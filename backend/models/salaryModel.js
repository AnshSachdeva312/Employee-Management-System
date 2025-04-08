const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  baseSalary: {
    type: Number,
    required: true,
  },
  allowances: {
    houseRentAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    foodAllowance: { type: Number, default: 0 },
    otherAllowance: { type: Number, default: 0 },
  },
  taxes: {
    incomeTax: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    providentFund: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
  },
  bonuses: {
    joiningBonus: { type: Number, default: 0 },
    performanceBonus: { type: Number, default: 0 },
    festivalBonus: { type: Number, default: 0 },
  },
  esops: {
    totalSharesGranted: { type: Number, default: 0 },
    vestedShares: { type: Number, default: 0 },
    unvestedShares: { type: Number, default: 0 },
  },
  salaryHistory: [
    {
      year: { type: Number, required: true },
      salary: { type: Number, required: true },
      bonusReceived: { type: Number, default: 0 },
    },
  ],
  salaryFrequency: {
    type: String,
    enum: ["Monthly", "Bi-Weekly", "Annual"],
    default: "Monthly",
  },
  netSalary: {
    type: Number,
    default: function () {
      return (
        this.baseSalary +
        Object.values(this.allowances || {}).reduce((a, b) => a + b, 0) +
        Object.values(this.bonuses || {}).reduce((a, b) => a + b, 0) -
        Object.values(this.taxes || {}).reduce((a, b) => a + b, 0)
      );
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Salary = mongoose.model("Salary", SalarySchema);
module.exports = Salary
