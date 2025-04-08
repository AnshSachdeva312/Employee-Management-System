const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Employee ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Leave'],
    default: 'Present'
  },
  workingHours: {
    type: Number
  },
  notes: {
    type: String
  },
  ipAddress: {
    type: String
  },
  location: {
    type: String
  }
}, { timestamps: true });

// Helper function to calculate if clock-in is late (after 9:30 AM)
function isLate(clockInTime) {
  const lateThreshold = new Date(clockInTime);
  lateThreshold.setHours(9, 30, 0, 0); // Set to 9:30 AM
  return clockInTime > lateThreshold;
}

// Helper function to calculate working hours
function calculateWorkingHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const diffInMs = clockOut - clockIn;
  return parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));
}

// Calculate working hours and late status before saving
attendanceSchema.pre('save', function(next) {
  // Calculate working hours if clockOut exists
  if (this.clockOut) {
    this.workingHours = calculateWorkingHours(this.clockIn, this.clockOut);
  }
  
  // Determine if employee is late (only if status is still 'Present')
  if (this.clockIn && this.status === 'Present' && isLate(this.clockIn)) {
    this.status = 'Late';
  }
  
  next();
});

// Prevent duplicate clock-in for same day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;