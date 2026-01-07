const fs = require('fs');
const util = require('util');
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
            console.log('Starting network scan...');
            // Step 1: Read ARP table for discovery
            const arpContent = await readFile(this.arpFile, 'utf8');
            const discoveries = this.parseArpTable(arpContent);
            console.log(`Found ${discoveries.length} devices in ARP table`);

            // Step 2: Sync ARP discoveries with DB (Add new devices, update MACs)
            await this.syncDiscoveries(discoveries);

            // Step 3: Active Status Check (Ping all DB devices)
            await this.updateDeviceStatuses();

            return discoveries;
        } catch (err) {
            console.error('Network scan failed:', err);
            return [];
        }
    }

    parseArpTable(content) {
        const lines = content.trim().split('\n');
        const devices = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].replace(/\s+/g, ' ').trim();
            if (!line) continue;

            const parts = line.split(' ');
            if (parts.length >= 4) {
                const ip = parts[0];
                const mac = parts[3];

                if (mac !== '00:00:00:00:00:00' && ip !== '127.0.0.1') {
                    devices.push({
                        ip_address: ip,
                        mac_address: mac,
                        name: `Device-${ip.split('.').pop()}`,
                        status: 'online'
                    });
                }
            }
        }
        return devices;
    }

    async syncDiscoveries(discoveries) {
        for (const device of discoveries) {
            try {
                // Check if device exists by MAC
                const [existing] = await db.query(
                    'SELECT id FROM devices WHERE mac_address = ?',
                    [device.mac_address]
                );

                if (existing.length === 0) {
                    // Check by IP to resolve conflict
                    const [conflict] = await db.query(
                        'SELECT id FROM devices WHERE ip_address = ?',
                        [device.ip_address]
                    );

                    if (conflict.length > 0) {
                        // IP Conflict: Update MAC
                        await db.query(
                            'UPDATE devices SET mac_address = ?, last_seen = NOW() WHERE id = ?',
                            [device.mac_address, conflict[0].id]
                        );
                    } else {
                        // Truly New Device
                        await db.query(
                            'INSERT INTO devices (name, ip_address, mac_address, status) VALUES (?, ?, ?, ?)',
                            [device.name, device.ip_address, device.mac_address, 'online']
                        );
                    }
                } else {
                    // Update IP if changed
                    await db.query(
                        'UPDATE devices SET ip_address = ?, last_seen = NOW() WHERE id = ?',
                        [device.ip_address, existing[0].id]
                    );
                }
            } catch (err) {
                console.error(`Error syncing device ${device.ip_address}:`, err.message);
            }
        }
    }

    async updateDeviceStatuses() {
        try {
            // Get all devices from DB
            const [devices] = await db.query('SELECT id, ip_address FROM devices');

            // Ping each device
            for (const device of devices) {
                const result = await this.pingDevice(device.ip_address);
                const status = result.alive ? 'online' : 'offline';
                const latency = result.latency || null;

                // Update Status
                await db.query(
                    'UPDATE devices SET status = ? WHERE id = ?',
                    [status, device.id]
                );

                // Log Status History
                await this.logStatus(device.id, status, latency);
            }
        } catch (err) {
            console.error('Error updating statuses:', err);
        }
    }

    async pingDevice(ip) {
        try {
            // Ping 1 packet, timeout 1s
            const { stdout } = await execPromise(`ping -c 1 -W 1 ${ip}`);

            // Extract latency (time=X.X ms)
            const timeMatch = stdout.match(/time=([\d.]+)/);
            const latency = timeMatch ? parseFloat(timeMatch[1]) : 0;

            return { alive: true, latency };
        } catch (err) {
            return { alive: false, latency: null };
        }
    }

    async logStatus(deviceId, status, latency) {
        try {
            await db.query(
                'INSERT INTO status_logs (device_id, status, latency) VALUES (?, ?, ?)',
                [deviceId, status, latency]
            );
        } catch (err) {
            console.error('Error logging status:', err.message);
        }
    }
}

module.exports = new NetworkScanner();
