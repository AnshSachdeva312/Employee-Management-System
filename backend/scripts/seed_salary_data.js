require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel"); // Load User model only once
const EmployeePosition = require("../models/positionModel");
const Salary = require("../models/salaryModel");

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Seed Salaries
const seedSalaries = async () => {
    try {
        // Fetch employees with positions
        const employees = await EmployeePosition.find().populate("employeeId");

        if (employees.length === 0) {
            console.log("No employees found. Please seed Users and EmployeePositions first.");
            return;
        }

        // Clear existing salary data
        await Salary.deleteMany();
        console.log("Old salary data removed...");

        const currentYear = new Date().getFullYear();

        const salaryData = employees.map((emp) => {
            const joiningYear = new Date(emp.dateOfJoining).getFullYear();

            // Generate salary history dynamically
            const salaryHistory = Array.from({ length: currentYear - joiningYear + 1 }, (_, i) => {
                const year = joiningYear + i;
                return {
                    year,
                    salary: emp.salary.amount + i * 5000, // 5k increment per year
                    bonusReceived: (i + 1) * 3000, // Increasing bonus per year
                };
            });

            return {
                employeeId: emp.employeeId._id,
                currency: "USD",
                baseSalary: emp.salary.amount,
                allowances: {
                    houseRentAllowance: emp.salary.amount * 0.2, // 20% HRA
                    transportAllowance: 3000,
                    medicalAllowance: 2000,
                    foodAllowance: 1000,
                    otherAllowance: 1500,
                },
                taxes: {
                    incomeTax: emp.salary.amount * 0.1, // 10% tax
                    professionalTax: 500,
                    providentFund: emp.salary.amount * 0.05, // 5% PF
                    otherDeductions: 1000,
                },
                bonuses: {
                    joiningBonus: emp.salary.amount * 0.05, // 5% Joining Bonus
                    performanceBonus: emp.salary.amount * 0.1, // 10% Performance Bonus
                    festivalBonus: 3000,
                },
                esops: {
                    totalSharesGranted: 100,
                    vestedShares: 50,
                    unvestedShares: 50,
                },
                salaryHistory,
                salaryFrequency: "Monthly",
            };
        });

        await Salary.insertMany(salaryData);
        console.log("Salary data seeded successfully!");

        process.exit();
    } catch (error) {
        console.error("Error seeding salaries:", error);
        process.exit(1);
    }
};

// Execute seeding
seedSalaries();
