const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Check Authorization header first (for API testing tools like RESTFOX)
        const authHeader = req.headers.authorization;
        let token;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // Extract token from "Bearer <token>"
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.token) {
            // Fallback to cookie for browser-based requests
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = authMiddleware;
