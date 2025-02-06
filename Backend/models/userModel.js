const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
        validate: {
            validator: function (v) {
                return validator.isMobilePhone(v, "any", { strictMode: false });
            },
            message: "Please enter a valid phone number"
        }
    },
    avatar: {
        type: String,
        enum: ["avatar1.png", "avatar2.png", "avatar3.png"], // Predefined avatars
        default: "avatar1.png"
    },
    role: {
        type: String,
        enum: ["user", "admin", "guest"], // "guest" role
        default: "user"
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
