require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel");

// MongoDB connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Seed users function
const seedUsers = async () => {
    const users = [
        { name: "Ansh Sachdeva", email: "sachdeva@example.com", password: "password123", role: 0, phone: 1234567890, image: "" },
        { name: "Jane Smith", email: "janesmith@example.com", password: "securepass", role: 1, phone: 1234567891, image: "" },
        { name: "Robert Johnson", email: "robert@example.com", password: "password456", role: 0, phone: 1234567892, image: "" },
        { name: "Emily Davis", email: "emily@example.com", password: "password789", role: 0, phone: 1234567893, image: "" },
        { name: "Michael Brown", email: "michael@example.com", password: "michaelpass", role: 0, phone: 1234567894, image: "" },
        { name: "Sarah Wilson", email: "sarah@example.com", password: "sarahpass", role: 0, phone: 1234567895, image: "" },
        { name: "David Lee", email: "david@example.com", password: "davidpass", role: 1, phone: 1234567896, image: "" },
        { name: "Sophia Martinez", email: "sophia@example.com", password: "sophiapass", role: 1, phone: 1234567897, image: "" },
        { name: "James Anderson", email: "james@example.com", password: "jamespass", role: 1, phone: 1234567898, image: "" },
        { name: "Olivia Thomas", email: "olivia@example.com", password: "oliviapass", role: 0, phone: 1234567899, image: "" }
    ];

    try {
        await User.deleteMany({}); // Clears existing users
        
        // Using create() instead of insertMany() to trigger password hashing
        for (let user of users) {
            await User.create(user);
        }

        console.log("Users seeded successfully!");
    } catch (err) {
        console.error("Seeding error:", err);
    } finally {
        mongoose.connection.close();
    }
};

// Execute the function
seedUsers();
