const mongoose = require("mongoose");

const noticePeriodSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resignationDate: {
    type: Date,
    required: true,
  },
  noticePeriodDays: {
    type: Number,
    required: true,
    default: 30, // Default notice period (30 days)
  },
  lastWorkingDay: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Completed"],
    default: "Pending",
  },
  isEarlyReleaseRequested: {
    type: Boolean,
    default: false,
  },
  earlyReleaseReason: {
    type: String,
    default: "",
  },
  handoverCompleted: {
    type: Boolean,
    default: false,
  },
  exitInterviewScheduled: {
    type: Boolean,
    default: false,
  },
  clearance: {
    it: { type: Boolean, default: false },
    hr: { type: Boolean, default: false },
    finance: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
  },
  comments: {
    type: String,
    default: "",
  },
}, { timestamps: true });

// Auto-calculate lastWorkingDate before saving
noticePeriodSchema.pre("save", function (next) {
  if (!this.lastWorkingDay && this.resignationDate && this.noticePeriodDays) {
    const lastDay = new Date(this.resignationDate);
    lastDay.setDate(lastDay.getDate() + this.noticePeriodDays);
    this.lastWorkingDay = lastDay;
  }
  next();
});
noticePeriodSchema.pre("validate", function(next) {
    if (!this.lastWorkingDay && this.resignationDate && this.noticePeriodDays) {
      const lastDay = new Date(this.resignationDate);
      lastDay.setDate(lastDay.getDate() + Number(this.noticePeriodDays));
      this.lastWorkingDay = lastDay;
    }
    next();
  });
const NoticePeriod = mongoose.model("NoticePeriod", noticePeriodSchema);
module.exports = NoticePeriod;