import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "secret_key";

//📌 1️⃣ NEW USER  SIGNUP 

export const signup = async (req: Request, res: Response): Promise<void> => {
  // Fill in the code
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
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "User with this email already exists." }); 
      return;
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10); 

    // Create and Save New User
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      termsAccepted,
    });

    // Prepare Response User Object 
    const userResponse = {
      id: newUser.id, 
      name: newUser.name,
      email: newUser.email,
      createdAt: new Date().toISOString()
    };
    
    // Send Successful Response
    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });

  } catch (error) {
    // Log the error for debugging purposes on the server
    console.error("Error during user signup:", error);
    // Send a generic error message to the client for security
    res.status(500).json({ error: "Error registering user" });
  }
};
  

// 📌 2️⃣ Login 
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
  
      // Search new user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
  
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
  
      // ✅ Create JWT
      const token = jwt.sign({ id: user.id }, "your_secret_key", { expiresIn: "1h" });
  
      res.json({ message: "Login successful!", token });
    } catch (error) {
      res.status(500).json({ error: "Error logging in" });
    }
  };
  
