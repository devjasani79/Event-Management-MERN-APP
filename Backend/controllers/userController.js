const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Generate Token
const generateToken = (user) => {
    console.log("ACCESS_TOKEN_SECRET: ", process.env.ACCESS_TOKEN_SECRET); // Debugging the secret key
    return jwt.sign(
        { user: { id: user.id, username: user.username, email: user.email, phoneNumber: user.phoneNumber, avatar: user.avatar } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, phoneNumber, avatar } = req.body;

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
        avatar: avatar || "avatar1.png"
    });

    if (user) {
        return res.status(201).json({
            message: "User registered successfully",
            user: { id: user.id, email: user.email, avatar: user.avatar },
            token: generateToken(user)
        });
    } else {
        return res.status(400).json({ message: "Invalid user data" });
    }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        return res.status(200).json({
            message: "Login successful",
            user: { id: user.id, email: user.email, avatar: user.avatar },
            token: generateToken(user)
        });
    } else {
        return res.status(401).json({ message: "Invalid email or password" });
    }
});

// Guest Login
const guestLogin = asyncHandler(async (req, res) => {
    const guestUser = {
        id: "guest",
        username: "Guest",
        email: "guest@example.com",
        phoneNumber: "N/A",
        avatar: "avatar1.png",
        role: "guest"
    };

    const token = generateToken(guestUser);

    res.status(200).json({
        message: "Guest login successful",
        user: { id: guestUser.id, username: guestUser.username, avatar: guestUser.avatar },
        token
    });
});

// Get Current User
const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});


// update user

const updateUserInfo = asyncHandler(async (req, res) => {
    const userId = req.user.id; // Extract user ID from the validated token
    const { username, email, phone } = req.body;
  
    const updates = {};
    if (username) updates.username = username;
  
    // Check for unique email
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists.id !== userId) {
        return res.status(400).json({ message: "Email already in use by another user" });
      }
      updates.email = email;
    }
  
    // Check for unique phone number
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists && phoneExists.id !== userId) {
        return res.status(400).json({ message: "Phone number already in use by another user" });
      }
      updates.phone = phone;
    }
  
    // Update the user
    const updatedUser  = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
  
    if (!updatedUser ) {
      return res.status(404).json({ message: "User  not found" });
    }
  
    res.status(200).json({
      message: "User  information updated successfully",
      user: updatedUser ,
    });
  });
  
  
  /*
   * DELETE USER ACCOUNT
   */
  const deleteUser  = asyncHandler(async (req, res) => {
    const userId = req.user.id; // Extract user ID from the validated token
  
    // Find and delete the user by their ID
    const user = await User.findByIdAndDelete(userId);
  
    if (!user) {
      return res.status(404).json({ message: "User  not found" });
    }
  
    res.status(200).json({ message: "User  account deleted successfully" });
  });

module.exports = { registerUser, loginUser, guestLogin, currentUser, updateUserInfo, deleteUser };
