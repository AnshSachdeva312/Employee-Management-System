const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["Company Update", "Employee Recognition", "Policy Change", "Event Notification", "General Information"],
    required: true,
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    required: true,
  }, 
  visibility: {
    type: String,
    enum: ["All Employees", "Managers Only"],
    required: true,
  },
  scheduledDate: { type: Date, default: Date.now }, // Supports scheduling
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
