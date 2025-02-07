const express = require("express");
const router = express.Router();
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent ,
} = require("../controllers/eventController");

const { validateToken, isVerified } = require("../middleware/validateToken");

// Public Routes
router.get("/events", getEvents); // Get all events
router.get("/events/:id", getEventById); // Get single event

// Protected Routes (Verified Users Only)
router.post("/events/create", validateToken, isVerified, createEvent);
router.put("/events/:id", validateToken, isVerified, updateEvent);
router.delete("/events/:id", validateToken, isVerified, deleteEvent);

//rsvp
router.post("/events/:id/rsvp", validateToken, rsvpEvent);
module.exports = router;
