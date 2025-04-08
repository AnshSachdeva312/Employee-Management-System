const Attendance = require('../models/attendanceModel');
const Leave = require('../models/leaveModel');
const { normalizeDate, getDatesBetween } = require('../middleware/attendanceUtils');

// Clock In
const clockIn = async (req, res) => {
  try {
    console.log('[ClockIn] Request received from user:', req.user.id);
    console.log('[ClockIn] Request body:', req.body);
    console.log('[ClockIn] Request headers:', req.headers);

    const today = normalizeDate(new Date());
    console.log('[ClockIn] Normalized date:', today);

    const existing = await Attendance.findOne({
      employee: req.user.id,
      date: today
    }).lean();
    
    console.log('[ClockIn] Existing record check:', existing);

    if (existing) {
      console.log('[ClockIn] Conflict - existing record found');
      return res.status(400).json({ 
        success: false,
        message: existing.clockOut 
          ? 'You have already completed attendance today' 
          : 'You have already clocked in today'
      });
    }

    const newAttendance = {
      employee: req.user.id,
      date: today,
      clockIn: new Date(),
      status: 'Present',
      ipAddress: req.ip
    };

    console.log('[ClockIn] Creating record:', newAttendance);
    
    const attendance = await Attendance.create(newAttendance);
    
    console.log('[ClockIn] Record created successfully:', attendance);
    
    return res.status(201).json({ 
      success: true, 
      data: attendance 
    });

  } catch (error) {
    console.error('[ClockIn] Full error:', error);
    console.error('[ClockIn] Error stack:', error.stack);
    console.error('[ClockIn] Error during save:', error.errors || error.message);
    
    return res.status(500).json({ 
      success: false,
      message: 'Failed to clock in',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Internal server error'
    });
  }
};

// Clock Out
const clockOut = async (req, res) => {
  try {
    const today = normalizeDate(new Date());
    console.log('[ClockOut] Attempting to clock out user:', req.user.id, 'for date:', today);

    // First find the active attendance record
    const attendance = await Attendance.findOne({
      employee: req.user.id,
      date: today,
      clockOut: { $exists: false }
    });

    if (!attendance) {
      console.log('[ClockOut] No active attendance record found for user:', req.user.id);
      return res.status(400).json({
        success: false,
        message: 'No active attendance record found or already clocked out'
      });
    }

    // Calculate working hours
    const clockOutTime = new Date();
    const workingHours = calculateWorkingHours(attendance.clockIn, clockOutTime);
    console.log('[ClockOut] Calculated working hours:', workingHours);

    // Update the record
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendance._id,
      {
        clockOut: clockOutTime,
        workingHours: workingHours,
        $set: {
          // Update status if working hours < minimum required
          status: workingHours < 4 ? 'Half Day' : attendance.status
        }
      },
      { new: true }
    );

    console.log('[ClockOut] Successfully updated attendance:', updatedAttendance);
    res.json({ 
      success: true, 
      data: updatedAttendance 
    });

  } catch (error) {
    console.error('[ClockOut] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clock out',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get My Attendance
const getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { employee: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .lean();
      
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message 
    });
  }
};

// Apply for Leave
const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    
    const leave = await Leave.create({
      employee: req.user.id,
      startDate: normalizeDate(startDate),
      endDate: normalizeDate(endDate),
      type,
      reason
    });
    
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to apply for leave',
      error: error.message 
    });
  }
};

// Get My Leaves
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .sort({ startDate: -1 })
      .lean();
      
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch leaves',
      error: error.message 
    });
  }
};

// Admin: Get All Attendance
const getAllAttendance = async (req, res) => {
  try {
    const { employee, month, year, status } = req.query;
    let query = {};
    
    if (employee) query.employee = employee;
    if (status) query.status = status;
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(query)
      .populate('employee', 'name email')
      .sort({ date: -1 })
      .lean();
    
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message 
    });
  }
};

// Admin: Process Leave
const processLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const leave = await Leave.findByIdAndUpdate(
      id,
      { 
        status,
        notes,
        approvedBy: req.user.id 
      },
      { new: true }
    ).populate('employee', 'name');
    
    if (!leave) {
      return res.status(404).json({ 
        success: false,
        message: 'Leave request not found' 
      });
    }
    
    if (status === 'Approved') {
      const dates = getDatesBetween(leave.startDate, leave.endDate);
      
      await Attendance.bulkWrite(
        dates.map(date => ({
          updateOne: {
            filter: {
              employee: leave.employee._id,
              date: normalizeDate(date)
            },
            update: {
              $setOnInsert: {
                employee: leave.employee._id,
                date: normalizeDate(date),
                clockIn: null,
                clockOut: null
              },
              $set: {
                status: 'On Leave',
                notes: `Approved ${leave.type} leave`
              }
            },
            upsert: true
          }
        }))
      );
    } else if (status === 'Rejected') {
      await Attendance.deleteMany({
        employee: leave.employee._id,
        status: 'On Leave',
        date: {
          $gte: normalizeDate(leave.startDate),
          $lte: normalizeDate(leave.endDate)
        },
        notes: `Approved ${leave.type} leave`
      });
    }
    
    res.json({ 
      success: true,
      data: leave,
      message: `Leave ${status.toLowerCase()} successfully` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to process leave',
      error: error.message 
    });
  }
};
module.exports={clockIn,clockOut,processLeave,getAllAttendance,getMyLeaves,applyLeave,getMyAttendance}