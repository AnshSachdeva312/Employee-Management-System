const express = require("express");
const noticePeriodRouter = express.Router();
const {
  createNoticePeriod,
  getNoticePeriods,
  getNoticePeriodByEmployeeId,
  updateNoticePeriod,
  deleteNoticePeriod,
} = require("../controllers/noticeperiodController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Notice Period Routes
noticePeriodRouter.post("/", authMiddleware, createNoticePeriod); // Employee submits notice
noticePeriodRouter.get("/", authMiddleware, adminMiddleware, getNoticePeriods); // HR/Admin views all
noticePeriodRouter.get("/employee/:employeeId", authMiddleware, getNoticePeriodByEmployeeId); // Employee/HR views specific
noticePeriodRouter.put("/:id", authMiddleware, adminMiddleware, updateNoticePeriod); // HR updates status
noticePeriodRouter.delete("/:id", authMiddleware, adminMiddleware, deleteNoticePeriod); // HR deletes (if needed)

module.exports = noticePeriodRouter;