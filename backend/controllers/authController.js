const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET);

        res.json({ token, user: { name: user.name, email: user.email, role: user.role, image: user.image,phone:user.phone,_id:user._id } });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
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
module.exports = { login,allUsers };
