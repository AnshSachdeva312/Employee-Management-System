const express = require("express");
const userRouter = express.Router();
const { getEmployeePosition, getSalaryDetails } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Route to get employee position details
userRouter.get("/position", authMiddleware, getEmployeePosition);
userRouter.get("/salary", authMiddleware, getSalaryDetails);
module.exports = userRouter;
