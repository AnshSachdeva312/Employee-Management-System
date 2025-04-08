const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 6,
        maxLength: 50
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
    },
    image: {
        type: String, // URL or base64 string
        default: ""   // Can be set to a default profile image URL
    },
    role: {
        type: Number,
        default: 0 // 0: Regular user, other values can be used for different roles
    }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
