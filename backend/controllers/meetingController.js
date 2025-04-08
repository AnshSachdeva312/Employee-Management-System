const Meeting = require("../models/meetingModel");

// Create a new meeting
const createMeeting = async (req, res) => {
  try {
    const meeting = new Meeting(req.body);
    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all meetings
const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find().populate("participants createdBy", "name email");
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single meeting by ID
const getMeetingById = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id).populate("participants createdBy", "name email");
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a meeting
const updateMeeting = async (req, res) => {
  try {
    const updatedMeeting = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMeeting) return res.status(404).json({ error: "Meeting not found" });
    res.json(updatedMeeting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a meeting
const deleteMeeting = async (req, res) => {
  try {
    const deletedMeeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!deletedMeeting) return res.status(404).json({ error: "Meeting not found" });
    res.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports={createMeeting,getMeetingById,getMeetings,deleteMeeting,updateMeeting};