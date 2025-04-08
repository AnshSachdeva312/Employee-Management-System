const express = require("express");
const announcementRouter = express.Router();
const {createAnnouncement,getAnnouncementById,getAnnouncements,updateAnnouncement,deleteAnnouncement, searchAnnouncements} = require("../controllers/announcementController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware=require("../middleware/adminMiddleware")
announcementRouter.post("/",authMiddleware,adminMiddleware, createAnnouncement);
announcementRouter.get("/",authMiddleware, getAnnouncements);
announcementRouter.get("/:id",authMiddleware, getAnnouncementById);
announcementRouter.get("/:query",authMiddleware, searchAnnouncements);
announcementRouter.put("/:id",authMiddleware,adminMiddleware,updateAnnouncement);
announcementRouter.delete("/:id",authMiddleware,adminMiddleware, deleteAnnouncement);

module.exports = announcementRouter;
