"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/profile", authMiddleware_1.authenticateUser, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const user = await User_1.User.findByPk(req.user.id, {
            attributes: ["name", "email", "firstName", "lastName", "phoneNumber", "about"]
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
router.put("/profile", authMiddleware_1.authenticateUser, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const { firstName, lastName, phoneNumber, about } = req.body;
        if (!firstName || !lastName || !phoneNumber || !about) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        await User_1.User.update({ firstName, lastName, phoneNumber, about }, { where: { id: req.user.id } });
        res.json({ message: "Profile updated successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.default = router;
