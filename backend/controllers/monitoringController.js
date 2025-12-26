const db = require('../config/db')

//send device id,name,ip address to monitoring srvice

const getDevices = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, ip_address FROM devices"
        )
        if (!result.length) return res.status(404).json({ message: "No devices found." })
        res.status(200).json({
            devices: rows.map(d => ({
                deviceId: d.id,
                name: d.name,
                ipAddress: d.ip_address
            }))
        }
        )
    } catch (err) {
        console.error("Error getting device IP Adresses: ", err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

//send refresh interval to monitoring srvice

const getRefreshInterval = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT refresh_interval FROM configuration_settings LIMIT 1"
        )

        if (!rows.length) {
            return res.status(404).json({ message: "Refresh interval not set" })
        }

        res.status(200).json({
            refresh_interval: rows[0].refresh_interval
        })
    } catch (err) {
        console.error("Error getting refresh interval:", err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

//recive device status updates from monitoring service and update status + store in status log

const receiveMonitoringUpdate = async (req, res) => {
    try {
        const { device_id, status, latency } = req.body
        if (!device_id || !status) {
            return res.status(400).json({ message: "device_id and status are required" })
        }
        const [devices] = await db.query(
            "SELECT id FROM devices WHERE id = ?",
            [device_id]
        )
        if (!devices.length) {
            return res.status(404).json({ message: "Device not found" })
        }
        const allowedStatuses = ["online", "offline", "unstable"]
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid device status" })
        }
        await updateDeviceStatus(status, device_id)
        await storeStatusLog(status, device_id, latency)
        res.status(200).json({ message: "Monitoring update processed" })

    } catch (err) {
        console.error("Error getting monitoring update: ", err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const updateDeviceStatus = async (status, deviceId) => {
    await db.query(
        "UPDATE devices SET status = ? WHERE id = ?",
        [status, deviceId]
    )
}

const storeStatusLog = async (status, deviceId, latency) => {
    await db.query(
        "INSERT INTO status_logs (device_id, status, latency) VALUES (?, ?, ?)",
        [deviceId, status, latency]
    )
}

module.exports = { getDevices, receiveMonitoringUpdate, getRefreshInterval }