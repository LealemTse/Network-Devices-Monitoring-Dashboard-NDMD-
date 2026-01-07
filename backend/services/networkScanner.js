const fs = require('fs');
const util = require('util');
const os = require('os');
const { exec } = require('child_process');
const readFile = util.promisify(fs.readFile);
const execPromise = util.promisify(exec);
const db = require('../config/db');

class NetworkScanner {
    constructor() {
        this.arpFile = '/proc/net/arp';
    }

    async scan() {
        try {
            console.log('Starting high-accuracy network scan (Ping Sweep)...');

            // 1. Detect Local Subnet
            const { subnet, localIP } = this.getLocalNetworkInfo();
            if (!subnet) {
                console.error("Could not detect local subnet. Scanning DB devices only.");
                return [];
            }
            console.log(`Scanning subnet: ${subnet} (Local IP: ${localIP})`);

            // 2. Perform Ping Sweep (Active Discovery)
            // Scans all IPs in the subnet to find active hosts
            const activeHosts = await this.pingSweep(subnet);
            console.log(`Ping Sweep found ${activeHosts.length} active hosts.`);

            // 3. Get MAC Addresses from ARP Table
            // (Ping populates ARP table for local LAN)
            const arpEntries = await this.readArpTable();

            // 4. Merge Data
            const devices = this.mergeDeviceData(activeHosts, arpEntries);

            // 5. Update Database (Sync)
            await this.syncDatabase(devices);

            return devices;
        } catch (err) {
            console.error('Network scan failed:', err);
            return [];
        }
    }

    getLocalNetworkInfo() {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    const ip = iface.address;
                    const prefix = ip.substring(0, ip.lastIndexOf('.'));
                    return { subnet: `${prefix}.0/24`, localIP: ip, prefix };
                }
            }
        }
        return { subnet: null, localIP: null };
    }

    async pingSweep(subnet) {
        // Generate all IPs in /24 subnet (1..254)
        const prefix = subnet.split('.')[0] + '.' + subnet.split('.')[1] + '.' + subnet.split('.')[2];
        const ips = [];
        for (let i = 1; i < 255; i++) {
            ips.push(`${prefix}.${i}`);
        }

        // Ping in batches to avoid OS limit/overhead
        const batchSize = 50;
        const activeHosts = [];

        for (let i = 0; i < ips.length; i += batchSize) {
            const batch = ips.slice(i, i + batchSize);
            const promises = batch.map(ip => this.checkIP(ip));
            const results = await Promise.all(promises);

            // Filter alive hosts
            results.forEach(res => {
                if (res.alive) {
                    activeHosts.push(res);
                }
            });
        }
        return activeHosts;
    }

    async checkIP(ip) {
        try {
            // Ping 1 packet, timeout 1s
            const { stdout } = await execPromise(`ping -c 1 -W 1 ${ip}`);
            // Extract latency
            const timeMatch = stdout.match(/time=([\d.]+)/);
            const latency = timeMatch ? parseFloat(timeMatch[1]) : 0;
            return { ip, alive: true, latency, hostname: `Device-${ip.split('.').pop()}` };
        } catch (err) {
            return { ip, alive: false, latency: null };
        }
    }

    async readArpTable() {
        try {
            // Read ARP table to get MACs
            const content = await readFile(this.arpFile, 'utf8');
            const lines = content.trim().split('\n');
            const entries = {}; // Map IP -> MAC

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].replace(/\s+/g, ' ').trim();
                const parts = line.split(' ');
                if (parts.length >= 4) {
                    const ip = parts[0];
                    const mac = parts[3];
                    // On some systems, incomplete entries show 00:00...
                    if (mac !== '00:00:00:00:00:00') {
                        entries[ip] = mac;
                    }
                }
            }
            return entries;
        } catch (err) {
            console.error("Error reading ARP table:", err);
            return {};
        }
    }

    mergeDeviceData(activeHosts, arpEntries) {
        const devices = [];
        for (const host of activeHosts) {
            // We use MAC from ARP if available, otherwise unknown (maybe blocked or external?)
            // If it's active but not in ARP, it might be the host itself or routing issue
            const mac = arpEntries[host.ip];
            if (mac) {
                devices.push({
                    ip_address: host.ip,
                    mac_address: mac,
                    name: host.hostname,
                    latency: host.latency,
                    status: 'online'
                });
            }
        }
        return devices;
    }

    async syncDatabase(activeDevices) {
        // 1. Get current DB state
        const [dbDevices] = await db.query('SELECT id, mac_address FROM devices');
        const onlineMacs = new Set();

        // 2. Sync Active Devices
        for (const device of activeDevices) {
            onlineMacs.add(device.mac_address);
            try {
                const [existing] = await db.query('SELECT id FROM devices WHERE mac_address = ?', [device.mac_address]);

                if (existing.length > 0) {
                    // Update existing
                    await db.query(
                        'UPDATE devices SET ip_address = ?, status = ?, last_seen = NOW() WHERE id = ?',
                        [device.ip_address, 'online', existing[0].id]
                    );
                    // Log Latency
                    await this.logStatus(existing[0].id, 'online', device.latency);
                } else {
                    // Check if IP matches another device (Conflict)
                    const [conflict] = await db.query('SELECT id FROM devices WHERE ip_address = ?', [device.ip_address]);
                    if (conflict.length > 0) {
                        // IP Conflict - Update the old device's MAC
                        await db.query(
                            'UPDATE devices SET mac_address = ?, status = ?, last_seen = NOW() WHERE id = ?',
                            [device.mac_address, 'online', conflict[0].id]
                        );
                        await this.logStatus(conflict[0].id, 'online', device.latency);
                    } else {
                        // New Device
                        const [result] = await db.query(
                            'INSERT INTO devices (name, ip_address, mac_address, status, last_seen) VALUES (?, ?, ?, ?, NOW())',
                            [device.name, device.ip_address, device.mac_address, 'online']
                        );
                        await this.logStatus(result.insertId, 'online', device.latency);
                    }
                }
            } catch (err) {
                console.error(`Error syncing ${device.ip_address}:`, err.message);
            }
        }

        // 3. Mark Offline Devices
        for (const dbDev of dbDevices) {
            if (!onlineMacs.has(dbDev.mac_address)) {
                await db.query('UPDATE devices SET status = ? WHERE id = ?', ['offline', dbDev.id]);
            }
        }
    }

    async logStatus(deviceId, status, latency) {
        await db.query(
            'INSERT INTO status_logs (device_id, status, latency) VALUES (?, ?, ?)',
            [deviceId, status, latency]
        );
    }
}

module.exports = new NetworkScanner();
