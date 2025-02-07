const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // Event Title (Required)
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    // Event Description (Required)
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },

    // Event Date & Time (Required)
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value) {
          return value > new Date(); // Ensures event date is in the future
        },
        message: "Event date must be in the future",
      },
    },

    // Event Location (Required)
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },

    // Event Category (Required)
    category: {
      type: String,
      required: [true, "Event category is required"],
      trim: true,
      enum: ["Concert", "Sports", "Conference", "Meetup", "Workshop", "Festival", "Other"],
    },

    // Event Image URL (Required - Cloudinary Storage)
    image: {
      type: String,
      required: [true, "Event image is required"],
      validate: {
        validator: function (value) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(value); // Ensures a valid image URL
        },
        message: "Invalid image URL format",
      },
    },

    // Created By (Store username instead of ObjectId)
    createdBy: {
      type: String,
      required: [true, "Event creator is required"],
      trim: true,
    },

    // List of Users Interested in the Event
    interestedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt & updatedAt
  }
);

module.exports = mongoose.model("Event", eventSchema);
