const express = require('express');
const attendanceRouter = express.Router();
const {
  clockIn,
  clockOut,
  getMyAttendance,
  applyLeave,
  getMyLeaves,
  getAllAttendance,
  processLeave
} = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Employee routes
attendanceRouter.post('/clock-in', authMiddleware, clockIn);
attendanceRouter.post('/clock-out', authMiddleware, clockOut);
attendanceRouter.get('/my-attendance', authMiddleware, getMyAttendance);
attendanceRouter.post('/leave', authMiddleware, applyLeave);
attendanceRouter.get('/my-leaves', authMiddleware, getMyLeaves);

// Admin routes
attendanceRouter.get('/', authMiddleware, adminMiddleware, getAllAttendance);
attendanceRouter.put('/leave/:id', authMiddleware, adminMiddleware, processLeave);

module.exports = attendanceRouter;