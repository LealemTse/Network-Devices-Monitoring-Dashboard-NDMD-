const db = require('../config/db')
const getAllLogs = async (req, res) => {
    try {
        const [logs] = await db.query('SELECT logs.id, logs.device_id, devices.name AS device_name, logs.status, logs.timestamp FROM logs JOIN devices ON logs.device_id = devices.id')
        res.status(200).json({ logs: logs });
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = { getAllLogs, addLog }