const db = require('../config/db');

// Get current configuration settings
const getConfig = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM configuration_settings LIMIT 1"
        );

        if (rows.length === 0) {
            // Return defaults if no config exists
            return res.status(200).json({
                pingInterval: 3000,
                pingTimeout: 5,
                retryCount: 3
            });
        }

        res.status(200).json({
            pingInterval: rows[0].ping_interval,
            pingTimeout: rows[0].ping_timeout,
            retryCount: rows[0].retry_count
        });
    } catch (err) {
        console.error("Error fetching config:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Update configuration settings
const updateConfig = async (req, res) => {
    try {
        const { pingInterval, pingTimeout, retryCount } = req.body;

        // Validation
        if (!pingInterval || !pingTimeout || !retryCount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate ranges
        if (pingInterval < 1000 || pingInterval > 60000) {
            return res.status(400).json({ message: "Ping interval must be between 1000ms and 60000ms" });
        }

        if (pingTimeout < 1 || pingTimeout > 30) {
            return res.status(400).json({ message: "Ping timeout must be between 1 and 30 seconds" });
        }

        if (retryCount < 1 || retryCount > 10) {
            return res.status(400).json({ message: "Retry count must be between 1 and 10" });
        }

        // Check if config exists
        const [existing] = await db.query("SELECT id FROM configuration_settings LIMIT 1");

        if (existing.length > 0) {
            // Update existing
            await db.query(
                "UPDATE configuration_settings SET ping_interval = ?, ping_timeout = ?, retry_count = ? WHERE id = ?",
                [pingInterval, pingTimeout, retryCount, existing[0].id]
            );
        } else {
            // Insert new
            await db.query(
                "INSERT INTO configuration_settings (ping_interval, ping_timeout, retry_count) VALUES (?, ?, ?)",
                [pingInterval, pingTimeout, retryCount]
            );
        }

        res.status(200).json({
            message: "Configuration updated successfully",
            pingInterval,
            pingTimeout,
            retryCount
        });
    } catch (err) {
        console.error("Error updating config:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getConfig, updateConfig };
