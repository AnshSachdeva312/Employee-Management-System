const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized user", success: false });
        }

        const decodedInfo = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedInfo) {
            return res.status(401).json({ message: "Invalid token", success: false });
        }
        console.log("Decoded JWT payload:", decodedInfo);
        req.user = decodedInfo;
        console.log("req.user set to:", req.user);
        next();
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized user",
            success: false,
            error: error.message
        });
    }
};

module.exports = authMiddleware;
