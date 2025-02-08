const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "guest"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    loginCount: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
