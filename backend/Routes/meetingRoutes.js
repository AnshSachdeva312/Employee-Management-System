const express = require("express");
const meetingRouter = express.Router();
const {createMeeting,getMeetings,getMeetingById,updateMeeting,deleteMeeting,} = require("../controllers/meetingController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Meeting routes
meetingRouter.post("/",authMiddleware,adminMiddleware, createMeeting);
meetingRouter.get("/",authMiddleware, getMeetings);
meetingRouter.get("/:id",authMiddleware, getMeetingById);
meetingRouter.put("/:id",authMiddleware,adminMiddleware, updateMeeting);
meetingRouter.delete("/:id",authMiddleware,adminMiddleware, deleteMeeting);

module.exports = meetingRouter;
