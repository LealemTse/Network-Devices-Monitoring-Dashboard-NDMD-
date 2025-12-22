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
        const { email } = req.body
        const [users] = await db.query("SELECT id FROM users WHERE email = ?", [email])
        const user = users[0]
        if (!user) return res.status(404).json({ message: "User not found" })
        const userId = user.id

        //assuming we'll have a table user_security_answers, we can change it later

        const [storedAnswers] = await db.query('SELECT question_id, answer_has FROM user_security_answers WHERE user_id = ?', [userId])
        for (const provided of answers) {
            const stored = storedAnswers.find(
                answer => answer.question_id === provided.questionId
            );

            if (!stored) {
                return res.status(401).json({ message: "Invalid security answers" });
            }

            const match = await bcrypt.compare(
                provided.answer,
                stored.answer
            );

            if (!match) {
                return res.status(401).json({ message: "Invalid security answer" });
            } else {
                res.status(200).json({ message: "Valid security answers" });
            }
        }
    }
    catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
const getSecurityQuestions = async (req, res) => {

}



module.exports = { login, forgotPassword, getSecurityQuestion }