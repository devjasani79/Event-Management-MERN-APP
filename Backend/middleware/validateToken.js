const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// Middleware to validate JWT token and attach user to request
const validateToken = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Check if ACCESS_TOKEN_SECRET is loaded
            if (!process.env.ACCESS_TOKEN_SECRET) {
                console.error("ACCESS_TOKEN_SECRET is missing in environment variables.");
                return res.status(500).json({ message: "Server error: Missing token secret" });
            }

            // Verify the token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log("Decoded Token:", decoded); // Debugging

            // Fetch user from DB and attach to req.user
            req.user = await User.findById(decoded.user.id).select("-password");

            // If user doesn't exist, return unauthorized
            if (!req.user) {
                return res.status(401).json({ message: "User not found. Unauthorized access." });
            }

            next();
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    } else {
        return res.status(401).json({ message: "No token provided. Access denied." });
    }
});

// Middleware to check if user is verified (merged validateEventAccess)
const isVerified = asyncHandler(async (req, res, next) => {
    console.log("User Object in Middleware:", req.user);
    
    if (!req.user || !req.user.isVerified) {
        return res.status(403).json({ message: "Access denied. Please verify your email to manage events." });
    }

    next();
});

module.exports = { validateToken, isVerified };
