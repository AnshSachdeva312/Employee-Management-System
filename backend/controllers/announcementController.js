const Announcement = require("../models/announcementModel");

// Create an announcement
const createAnnouncement = async (req, res) => {
  try {
    const newAnnouncement = new Announcement(req.body);
    await newAnnouncement.save();
    res.status(201).json({ message: "Announcement created successfully", announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get an announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an announcement
const updateAnnouncement = async (req, res) => {
  try {
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement updated successfully", announcement: updatedAnnouncement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 1) {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    // Find and delete the announcement
    const deletedAnnouncement = await Announcement.findByIdAndDelete(req.params.id);
    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const searchAnnouncements = async (req, res) => {
  try {
    const { query } = req.params;
    const results = await Announcement.find({ title: { $regex: query, $options: "i" } });
    
    if (results.length === 0) return res.status(404).json({ message: "No matching announcements found" });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = {createAnnouncement,getAnnouncementById,getAnnouncements,updateAnnouncement,deleteAnnouncement,searchAnnouncements}
