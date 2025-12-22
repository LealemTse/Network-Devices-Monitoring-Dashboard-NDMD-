const db = require('../config/db')

const getAllDevices = async (req, res) => {
    try {
        const [devices] = await db.query("SELECT * FROM devices")
        res.status(200).json({ devices: devices });
    } catch (err) {
        console.error("Error getting devices:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const getDeviceById = async (req, res) => {
    try {
        const { id } = req.params
        const [devices] = await db.query("SELECT * FROM devices WHERE id=?", [id])
        if (!devices[0]) return res.status(404).json({ message: "Device not found" })
        res.status(200).json({ device: devices[0] });
    } catch (err) {
        console.error("Error getting device:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const addDevice = async (req, res) => {
    try {
        const { name, ip_address, mac_address, status } = req.body
        if (!name || !ip_address || !mac_address || !status) {
            return res.status(400).json({ message: "All fields are required" })
        }
        const newDevice = await db.query("INSERT INTO devices(name, ip_address, mac_address, status) VALUES(?, ?, ?, ?)", [name, ip_address, mac_address, status])
        res.status(201).json({ message: "Device added successfully", device: newDevice })
    } catch (err) {
        console.error("Error adding device:", err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const editDevice = async (req, res) => {
    try {
        const { id } = req.params
        const { name, ip_address, mac_address, status } = req.body
        if (!name || !ip_address || !mac_address || !status) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const [result] = await db.query(
            "UPDATE devices SET name = ?, ip_address = ?, mac_address = ?, status = ? WHERE id = ?",
            [name, ip_address, mac_address, status, id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Device not updated" })
        }

        res.status(200).json({ message: "Device updated successfully" })
    } catch (err) {
        console.error("Error editting device:", err);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const deleteDevice = async (req, res) => {
    try {
        const { id } = req.params
        const [result] = await db.query(
            "DELETE FROM devices WHERE id = ?",
            [id]
        )
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Device not found" })
        }

        res.status(200).json({ message: "Device deleted successfully" })
    } catch (err) {
        console.error("Error ddeleting device:", err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = { addDevice, deleteDevice, getAllDevices, getDeviceById, editDevice }