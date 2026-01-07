const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const db = require('../config/db')


// LOGIN
// Frontend sends: { username, password }
// Frontend receives: accessToken + user object
// Refresh token is set

const login = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) return res.status(400).json({ message: "username and password are required." })
        const [users] = await db.query("SELECT username,id,password,role FROM users WHERE username = ?", [username])
        const user = users[0]
        if (!user) return res.status(404).json({ message: "Invalid Credentials" })
        const auth = await bcrypt.compare(password, user.password)
        if (!auth) return res.status(401).json({ message: "Incorrect password." })

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.TOKEN_KEY,
            { expiresIn: '15m' }
        )
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        )
        await db.query(
            "INSERT INTO refresh_tokens (user_id, token, expiry_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
            [user.id, refreshToken]
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true
        })
        res.status(200).json({
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        })
    } catch (err) {
        console.error({ "Error logging in": err })
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// REFRESH ACCESS TOKEN
// Frontend calls this when a request returns 401 (expired access token)
// No request body required

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken
        if (!token) return res.sendStatus(401)

        const [rows] = await db.query(
            "SELECT * FROM refresh_tokens WHERE token = ? AND expiry_date > NOW()",
            [token]
        )
        if (!rows.length) return res.status(403).json({ message: "Forbidden" })

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" })

            const newAccessToken = jwt.sign(
                { id: decoded.id },
                process.env.TOKEN_KEY,
                { expiresIn: '15m' }
            )

            res.json({ accessToken: newAccessToken })
        })

    } catch (err) {
        console.error("Refresh token error:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}



// FORGOT PASSWORD (VERIFICATION STEP)
// Frontend sends username and security answers
//

const forgotPassword = async (req, res) => {
    try {
        const { username, securityAnswer1, securityAnswer2 } = req.body
        if (!username || !securityAnswer1 || !securityAnswer2) {
            return res.status(400).json({ message: "Incomplete fields" })
        }
        const [users] = await db.query("SELECT security_answer_1_hash, security_answer_2_hash FROM users WHERE username = ?", [username])
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


module.exports = { login, forgotPassword, refreshToken }