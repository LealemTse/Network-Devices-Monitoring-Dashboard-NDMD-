const db = require('../config/db')
const net = require('net');

const getAllDevices = async (req, res) => {
    try {
        const [devices] = await db.query(
            "SELECT id, name, ip_address, mac_address, status FROM devices"
        )
        if (!devices.length) return res.status(404).json({ message: "No devices found" })
        res.status(200).json({ devices: devices })
    } catch (err) {
        console.error("Error getting devices:", err)
        res.status(500).json({ message: "Internal Server Error" })
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
        const { name, ip_address, mac_address } = req.body

        if (!name || !ip_address || !mac_address) {
            return res.status(400).json({ message: "Name, IP address, and MAC address are required" })
        }

        if (!net.isIPv4(ip_address) && !net.isIPv6(ip_address)) {
            return res.status(400).json({ message: "Invalid IP address format" })
        }

        const [existing] = await db.query(
            "SELECT id FROM devices WHERE ip_address = ?",
            [ip_address]
        )
        if (existing.length) {
            return res.status(409).json({ message: "Device with this IP address already exists" })
        }


        const [result] = await db.query(
            "INSERT INTO devices (name, ip_address, mac_address, status) VALUES (?, ?, ?, ?)",
            [name, ip_address, mac_address, "offline"]
        )

        res.status(201).json({
            message: "Device added successfully",
            device: {
                id: result.insertId,
                name,
                ip_address,
                mac_address,
                status: "offline"
            }
        })

    } catch (err) {
        console.error("Error adding device:", err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


const editDevice = async (req, res) => {
    try {
        const { id } = req.params
        const { name, ip_address, mac_address } = req.body

        if (!name || !ip_address || !mac_address) {
            return res.status(400).json({ message: "Name, IP address, and MAC address are required" })
        }

        if (!net.isIPv4(ip_address) && !net.isIPv6(ip_address)) {
            return res.status(400).json({ message: "Invalid IP address format" })
        }

        const [existing] = await db.query(
            "SELECT id FROM devices WHERE ip_address = ? AND id != ?",
            [ip_address, id]
        )
        if (existing.length) {
            return res.status(409).json({ message: "Another device already uses this IP address" })
        }

        const [result] = await db.query(
            "UPDATE devices SET name = ?, ip_address = ?, mac_address = ? WHERE id = ?",
            [name, ip_address, mac_address, id]
        )

        if (!result.affectedRows) {
            return res.status(404).json({ message: "Device not found" })
        }

        res.status(200).json({ message: "Device updated successfully" })

    } catch (err) {
        console.error("Error editing device:", err)
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