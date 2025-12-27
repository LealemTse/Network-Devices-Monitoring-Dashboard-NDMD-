const db = require('../config/db')
const getRefreshInterval = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT refresh_interval, min_refresh_interval, max_refresh_interval FROM configuration_settings LIMIT 1"
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Refresh interval not set" });
        }

        res.status(200).json({
            refreshInterval: rows[0].refresh_interval,
            minRefreshInterval: rows[0].min_refresh_interval,
            maxRefreshInterval: rows[0].max_refresh_interval
        });
    } catch (err) {
        console.error("Error getting refresh interval:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const updateRefreshInterval = async (req, res) => {
    try {
        const { interval } = req.body;

        if (interval === undefined || isNaN(interval)) {
            return res.status(400).json({ message: "Interval must be a number" });
        }
        const [rows] = await db.query(
            "SELECT min_refresh_interval, max_refresh_interval FROM configuration_settings LIMIT 1"
        );
        if (!rows.length) {
            return res.status(500).json({ message: "Configuration table not initialized" });
        }

        const { min_refresh_interval, max_refresh_interval } = rows[0];

        if (interval < min_refresh_interval || interval > max_refresh_interval) {
            return res.status(400).json({
                message: `Interval must be between ${min_refresh_interval} and ${max_refresh_interval}`
            });
        }

        const [result] = await db.query(
            "UPDATE configuration_settings SET refresh_interval = ? WHERE id = 1",
            [interval]
        );


        res.status(200).json({ message: "Refresh interval updated", refreshInterval: interval });
    } catch (err) {
        console.error("Error updating refresh interval:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = { getRefreshInterval, updateRefreshInterval }