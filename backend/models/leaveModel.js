const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['Sick', 'Vacation', 'Personal', 'Maternity/Paternity', 'Bereavement', 'Other'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Validate end date is after start date
leaveSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    throw new Error('End date must be after start date');
  }
  next();
});

const Leave = mongoose.model('Leave', leaveSchema);
module.exports= Leave;