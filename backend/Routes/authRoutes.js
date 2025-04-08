const express = require("express");
const { login, allUsers } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const authRouter = express.Router();

// Login Route
authRouter.post("/login", login);
authRouter.get("/all",authMiddleware,adminMiddleware, allUsers);
module.exports = authRouter;
