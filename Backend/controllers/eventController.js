const asyncHandler = require("express-async-handler");
const Event = require("../models/eventModel");

// @desc Get all events (Public)
// @route GET /api/events
// @access Public
const getEvents = asyncHandler(async (req, res) => {
    const today = new Date();

    const upcomingEvents = await Event.find({ date: { $gte: today } }).sort({ date: 1 });
    const pastEvents = await Event.find({ date: { $lt: today } }).sort({ date: -1 });

    if (!upcomingEvents.length && !pastEvents.length) {
        return res.status(404).json({ message: "No events available at the moment." });
    }

    res.status(200).json({ upcomingEvents, pastEvents });
});

// @desc Get a single event by ID (Public)
// @route GET /api/events/:id
// @access Public
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
});

// @desc Create an event (Verified Users Only)
// @route POST /api/events/create
// @access Verified Users Only
const createEvent = asyncHandler(async (req, res) => {
  console.log("Incoming Event Data:", req.body); // Debugging Log

  const { title, description, date, location, category, image } = req.body;

  // Ensure user is logged in
  if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized. Please log in.");
  }

  // Check if user is verified
  if (!req.user.isVerified) {
    res.status(403);
    throw new Error("Access denied. Please verify your email to create events.");
  }

  // Check for missing fields
  if (!title || !date || !location || !category) {
    console.log("Validation Failed: Missing Fields"); // Debugging Log
    return res.status(400).json({ 
      error: "Validation Failed",
      message: "Title, date, location, and category are required." 
    });
  }

  try {
    // Create a new event
    const event = new Event({
      title,
      description,
      date,
      location,
      category,
      image,
      createdBy: req.user.username, // Storing username instead of ObjectId
    });

    await event.save();

    res.status(201).json({
      message: "Event created successfully!",
      event,
    });
  } catch (error) {
    console.error("Event Creation Error:", error.message);
    res.status(500).json({
      message: "Failed to create event. Please try again.",
      error: error.message,
    });
  }
});

// @desc Update an event (Only event creator & verified users)
// @route PUT /api/events/:id
// @access Verified Users Only (Must be the creator)
const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, date, location, category, image } = req.body;

  // Find the event by ID
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Check if logged-in user is the creator
  if (event.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized. You can only update your own events." });
  }

  // Update event fields if provided
  event.title = title || event.title;
  event.description = description || event.description;
  event.date = date || event.date;
  event.location = location || event.location;
  event.category = category || event.category;
  event.image = image || event.image;

  const updatedEvent = await event.save();

  res.status(200).json({
    message: "Event updated successfully",
    event: updatedEvent,
  });
});

// @desc Delete an event (Only event creator & verified users)
// @route DELETE /api/events/:id
// @access Verified Users Only (Must be the creator)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Check if logged-in user is the creator
  if (event.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized. You can only delete your own events." });
  }

  await event.deleteOne();

  res.status(200).json({ message: "Event deleted successfully" });
});

// @desc RSVP to an event (Toggle interested status)
// @route POST /api/events/:id/rsvp
// @access Regular & Verified Users Only
const rsvpEvent = asyncHandler(async (req, res) => {
  if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  const eventId = req.params.id;
  const userId = req.user._id;

  const event = await Event.findById(eventId);
  if (!event) {
      return res.status(404).json({ message: "Event not found" });
  }

  const alreadyInterested = event.interestedUsers.includes(userId);

  if (alreadyInterested) {
      // If user already RSVP'd, remove them (toggle feature)
      event.interestedUsers = event.interestedUsers.filter(id => id.toString() !== userId.toString());
  } else {
      // Add user to interested list
      event.interestedUsers.push(userId);
  }

  await event.save();

  const interestedCount = event.interestedUsers.length;

  // Emit real-time update
  req.io.emit("updateRSVP", { eventId, interestedCount });

  res.status(200).json({
      message: alreadyInterested ? "RSVP removed" : "RSVP added",
      interestedCount,
  });
});

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent,
};
