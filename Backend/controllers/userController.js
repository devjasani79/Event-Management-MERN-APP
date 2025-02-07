const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    if (!username || !email || !password || !phoneNumber) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        isVerified: false,
    });

    res.status(201).json({
        message: "User registered successfully",
        user: { id: user.id, email: user.email, isVerified: user.isVerified },
        token: generateToken(user),
    });
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, isVerified: user.isVerified },
            token: generateToken(user),
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
});

// Guest Login (No Database Storage)
const guestLogin = asyncHandler(async (req, res) => {
    const guestUser = {
        id: "guest",
        username: "Guest",
        email: "guest@example.com",
        isVerified: false,
    };

    const token = generateToken(guestUser);

    res.status(200).json({
        message: "Guest login successful",
        user: { id: guestUser.id, username: guestUser.username, isVerified: guestUser.isVerified },
        token,
    });
});

// Request Email Verification
const requestVerification = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
    await sendEmail({
        to: user.email,
        subject: "Verify Your Email",
        text: `Click the link to verify your email: ${verifyLink}`,
    });

    res.status(200).json({ message: "Verification link sent to email" });
});

// Verify Email
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
        message: "Email verified successfully",
        token: generateToken(user),
    });
});

// Update User Info
const updateUserInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { username, email } = req.body;

    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated", user: updatedUser });
});

// Delete User
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
});

module.exports = {
    registerUser,
    loginUser,
    guestLogin,
    requestVerification,
    verifyEmail,
    updateUserInfo,
    deleteUser,
};
