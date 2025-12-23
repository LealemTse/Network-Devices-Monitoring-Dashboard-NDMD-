const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: "Email and password are required." })
        const [users] = await db.query("SELECT email,id,password FROM users WHERE email = ?", [email])
        const user = users[0]
        if (!user) return res.status(404).json({ message: "Invalid Credentials" })
        const auth = await bcrypt.compare(password, user.password)
        if (!auth) return res.status(401).json({ message: "Incorrect password." })
        const token = await jwt.sign({ id: user.id }, process.env.TOKEN_KEY, { expiresIn: 3 * 24 * 60 * 60 })
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: 'None',
        })
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email
            }
        })
    } catch (err) {
        console.error({ "Error logging in": err })
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const forgotPassword = async (req, res) => {
    try {
        const { email, securityAnswer1, securityAnswer2 } = req.body
        if (!email || !securityAnswer1 || !securityAnswer2) {
            return res.status(400).json({ message: "Incomplete fields" })
        }
        const [users] = await db.query("SELECT security_answer_1_hash, security_answer_2_hash FROM users WHERE email = ?", [email])
        const user = users[0]
        if (!user) return res.status(404).json({ message: "User not found" })
        const isAnswer1Correct = await bcrypt.compare(
            securityAnswer1,
            user.security_answer_1_hash
        );

        const isAnswer2Correct = await bcrypt.compare(
            securityAnswer2,
            user.security_answer_2_hash
        );
        if (!isAnswer1Correct || !isAnswer2Correct) {
            return res.status(401).json({ message: "Invalid security answers" })
        }

        res.status(200).json({ message: "Security answers verified" })
    }

    catch (err) {
        console.error("Forgot password error:", err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
const getSecurityQuestion = async (req, res) => {

}



module.exports = { login, forgotPassword, getSecurityQuestion }