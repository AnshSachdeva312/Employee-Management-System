require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel"); // Load User model only once
const EmployeePosition = require("../models/positionModel");

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Seed Employee Positions
const seedEmployeePositions = async () => {
    try {
        // Fetch all users
        const users = await User.find();
        const employees = users.filter(user => user.role === 0); // Employees
        const hrManagers = users.filter(user => user.role === 1); // HR Managers

        if (users.length === 0) {
            console.log("No users found. Please seed the User model first.");
            return;
        }

        // Sample positions
        const employeePositions = [
            { designation: "Software Engineer", department: "IT", employmentType: "Full-time", salary: 80000 },
            { designation: "Marketing Lead", department: "Marketing", employmentType: "Full-time", salary: 70000 },
            { designation: "Sales Executive", department: "Sales", employmentType: "Contract", salary: 50000 },
            { designation: "Data Analyst", department: "IT", employmentType: "Full-time", salary: 75000 },
            { designation: "Product Manager", department: "Product", employmentType: "Full-time", salary: 90000 },
            { designation: "Support Specialist", department: "Customer Support", employmentType: "Full-time", salary: 55000 }
        ];

        const hrPositions = [
            { designation: "HR Manager", department: "HR", employmentType: "Full-time", salary: 60000 },
            { designation: "HR Generalist", department: "HR", employmentType: "Full-time", salary: 50000 },
            { designation: "HR Executive", department: "HR", employmentType: "Full-time", salary: 55000 },
            { designation: "Recruiter", department: "HR", employmentType: "Full-time", salary: 52000 }
        ];

        // Clear existing data
        await EmployeePosition.deleteMany();
        console.log("Old EmployeePosition data removed...");

        // Assign positions to employees
        const employeeData = employees.map((user, index) => ({
            employeeId: user._id,
            designation: employeePositions[index % employeePositions.length].designation,
            department: employeePositions[index % employeePositions.length].department,
            employmentType: employeePositions[index % employeePositions.length].employmentType,
            dateOfJoining: new Date("2023-01-01"),
            salary: { amount: employeePositions[index % employeePositions.length].salary, currency: "USD" },
            workLocation: { office: "HQ Office", remote: false },
            reportsTo: null,
            status: "Active",
        }));

        // Assign positions to HR Managers
        const hrData = hrManagers.map((user, index) => ({
            employeeId: user._id,
            designation: hrPositions[index % hrPositions.length].designation,
            department: hrPositions[index % hrPositions.length].department,
            employmentType: hrPositions[index % hrPositions.length].employmentType,
            dateOfJoining: new Date("2023-01-01"),
            salary: { amount: hrPositions[index % hrPositions.length].salary, currency: "USD" },
            workLocation: { office: "HQ Office", remote: false },
            reportsTo: null,
            status: "Active",
        }));

        await EmployeePosition.insertMany([...employeeData, ...hrData]);
        console.log("Employee positions seeded successfully!");

        process.exit();
    } catch (error) {
        console.error("Error seeding employee positions:", error);
        process.exit(1);
    }
};

// Execute seeding
seedEmployeePositions();
