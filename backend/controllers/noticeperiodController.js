const NoticePeriod = require("../models/noticeperiodModel");

// Create a notice period entry
const createNoticePeriod = async (req, res) => {
  try {
    const noticePeriod = new NoticePeriod(req.body);
    await noticePeriod.save();
    res.status(201).json(noticePeriod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all notice periods (for HR/Admin)
const getNoticePeriods = async (req, res) => {
  try {
    const noticePeriods = await NoticePeriod.find().populate("employeeId", "name email");
    res.json(noticePeriods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get notice period by employee ID
const getNoticePeriodByEmployeeId = async (req, res) => {
  try {
    const noticePeriod = await NoticePeriod.findOne({ 
        employeeId: req.params.employeeId 
    }).populate("employeeId", "name email");

    if (!noticePeriod) {
      return res.status(404).json({ error: "Notice period not found" });
    }
    res.json(noticePeriod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update notice period (e.g., approve/reject)
const updateNoticePeriod = async (req, res) => {
  try {
    const updatedNoticePeriod = await NoticePeriod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedNoticePeriod) {
      return res.status(404).json({ error: "Notice period not found" });
    }
    res.json(updatedNoticePeriod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete notice period (if needed)
const deleteNoticePeriod = async (req, res) => {
  try {
    const deletedNoticePeriod = await NoticePeriod.findByIdAndDelete(req.params.id);
    if (!deletedNoticePeriod) {
      return res.status(404).json({ error: "Notice period not found" });
    }
    res.json({ message: "Notice period deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createNoticePeriod,
  getNoticePeriods,
  getNoticePeriodByEmployeeId,
  updateNoticePeriod,
  deleteNoticePeriod,
};