const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "Access denied" });
        }
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(401).json({ message: "Invalid token" });
    }
}
module.exports = authMiddleware;
