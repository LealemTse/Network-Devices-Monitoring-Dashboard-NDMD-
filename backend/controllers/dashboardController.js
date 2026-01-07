const db = require('../config/db')
const statusColors = {
    online: "green",
    offline: "red",
    unstable: "yellow"
}
const redisClient = require('../config/redisClient');

//sends dashboard overview ( count of total devices and currently online, offline and unstable devices)  for frontend
const getDashboardOverview = async (req, res) => {
    try {
        // Try to get cached data
        try {
            const cachedData = await redisClient.get('dashboard:overview');
            if (cachedData) {
                return res.status(200).json(JSON.parse(cachedData));
            }
        } catch (redisErr) {
            console.error("Redis Cache Error:", redisErr.message);
            // Continue to DB on redis error
        }

        const [totalDevicesResult] = await db.query("SELECT COUNT(*) as total FROM devices");
        const [onlineDevicesResult] = await db.query("SELECT COUNT(*) as total FROM devices WHERE status = 'online'");
        const [offlineDevicesResult] = await db.query("SELECT COUNT(*) as total FROM devices WHERE status = 'offline'");
        const [unstableDevicesResult] = await db.query("SELECT COUNT(*) as total FROM devices WHERE status = 'unstable'");

        const data = {
            totalDevices: totalDevicesResult[0].total,
            onlineDevices: onlineDevicesResult[0].total,
            offlineDevices: offlineDevicesResult[0].total,
            unstableDevices: unstableDevicesResult[0].total
        };

        // Cache the result for 60 seconds
        try {
            await redisClient.set('dashboard:overview', JSON.stringify(data), {
                EX: 60
            });
        } catch (err) {
            console.error("Error setting redis cache:", err.message);
        }

        res.status(200).json(data);

    } catch (err) {
        console.error("Error getting dashboard overview:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//sends list of devices for frontend

const getDeviceStatusSummary = async (req, res) => {
    try {
        const [result] = await db.query(
            "SELECT id, name, status, ip_address, mac_address FROM devices"
        )
        const devices = result.map(d => ({
            id: d.id,
            name: d.name,
            status: d.status,
            color: statusColors[d.status],
            ip_address: d.ip_address,
            mac_address: d.mac_address
        }));
        res.status(200).json({ devices: devices });

    } catch (err) {
        console.error("Error fetching device status summary:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//prepares uptime and downtime for each device 

const getUptimeSummary = async (req, res) => {
    try {
        const [statusLogs] = await db.query(
            "SELECT status, timestamp, device_id FROM status_log ORDER BY timestamp ASC"
        )

        const uptimeSummaries = {}

        for (const log of statusLogs) {
            if (!uptimeSummaries[log.device_id]) {
                uptimeSummaries[log.device_id] = {
                    uptime: 0,
                    downtime: 0,
                    lastTimestamp: null,
                    lastStatus: null
                }
            }
            const uptimeSummary = uptimeSummaries[log.device_id]
            if (uptimeSummary.status != null) {
                const timeInterval = new Date(log.timestamp) - new Date(uptimeSummary.lastTimestamp)
                if (log.status == "online") uptimeSummary.uptime += timeInterval
                else uptimeSummary.downtime += timeInterval
            }
            uptimeSummary.lastTimestamp = log.timestamp
            uptimeSummary.lastStatus = log.status
        }
        res.status(200).json({ uptimeSummary: uptimeSummaries })
    }
    catch (err) {
        console.error("Error fetching uptime/downtime:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { getDeviceStatusSummary, getDashboardOverview, getUptimeSummary }