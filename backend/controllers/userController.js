const User = require("../models/userModel");
const EmployeePosition = require("../models/positionModel");
const Salary=require("../models/salaryModel")
const getEmployeePosition = async (req, res) => {
    try {
        const { id, email, role } = req.user;
        console.log(id);
        const employee = await User.findById(id);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }
        const position = await EmployeePosition.findOne({ employeeId: id }).populate("reportsTo", "name email");
        if (!position) {
            return res.status(404).json({ success: false, message: "Position details not found" });
        }

        res.status(200).json({ success: true, position });

    } catch (error) {
        console.error("Error fetching employee position:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

// Get salary details for an employee
const getSalaryDetails = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming authentication middleware attaches `user` to req
        const salary = await Salary.findOne({ employeeId: userId });

        if (!salary) {
            return res.status(404).json({ message: "Salary details not found." });
        }

        res.status(200).json(salary);
    } catch (error) {
        console.error("Error fetching salary details:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const allUsers = async (req, res) => {
    try {
        const users = await User.find({}, "_id name email role"); // Fetch selected fields
        res.status(200).json(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
};
module.exports = {getEmployeePosition,getSalaryDetails};
