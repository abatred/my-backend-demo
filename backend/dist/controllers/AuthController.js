"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const User_1 = require("../models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt"); // Import generateToken
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// The SECRET_KEY here is for the login function's hardcoded secret.
// For signup, we will use the generateToken function which uses JWT_SECRET from .env
const SECRET_KEY = process.env.JWT_SECRET || "secret_key";
//📌 1️⃣ NEW USER SIGNUP
const signup = async (req, res) => {
    try {
        const { name, email, password, termsAccepted } = req.body;
        // 1. Basic Input Validation
        if (!name || !email || !password || termsAccepted === undefined) {
            res.status(400).json({ error: "All required fields (name, email, password, termsAccepted) must be provided." });
            return;
        }
        if (typeof termsAccepted !== 'boolean' || !termsAccepted) {
            res.status(400).json({ error: "You must accept the terms and conditions." });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ error: "Password must be at least 8 characters long." });
            return;
        }
        // 2. Check for Duplicate Email
        const existingUser = await User_1.User.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: "User with this email already exists." });
            return;
        }
        // Hash Password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create and Save New User
        const newUser = await User_1.User.create({
            name,
            email,
            password: hashedPassword,
            termsAccepted,
        });
        // Generate JWT Token for the new user
        // Use newUser.id and newUser.email as payload
        const token = (0, jwt_1.generateToken)(newUser.id, newUser.email);
        // Prepare Response User Object
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: new Date().toISOString()
        };
        // Successful Response WITH TOKEN
        res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
            token: token,
        });
    }
    catch (error) {
        console.error("Error during user signup:", error);
        res.status(500).json({ error: "Error registering user" });
    }
};
exports.signup = signup;
// 📌 2️⃣ Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Search new user
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        // Check password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        // ✅ Create JWT
        // Note: It's better to use generateToken utility here too for consistency
        const token = (0, jwt_1.generateToken)(user.id, user.email);
        res.json({ message: "Login successful!", token });
    }
    catch (error) {
        res.status(500).json({ error: "Error logging in" });
    }
};
exports.login = login;
