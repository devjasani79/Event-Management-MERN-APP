const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization || req.headers.Authorization;  // Simplified header access

    if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];

        // Verify the token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "USER NOT VERIFIED", error: err.message }); // Returning error response
            }
            req.user = decoded.user; // Attach user data to request
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        return res.status(401).json({ message: "USER NOT AUTHORIZED or TOKEN MISSING" }); // Return error if no token
    }
});

module.exports = validateToken;
