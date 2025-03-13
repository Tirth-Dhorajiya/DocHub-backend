const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const router = express.Router();

// Secret key for JWT
const SECRET_KEY = "your_secret_key";

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Admin not found!" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

    const token = jwt.sign({ id: admin._id }, SECRET_KEY, { expiresIn: "1h" });

    res.json({ token, admin: { id: admin._id, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Registration (Only for First Time)
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(403).json({ message: "Access Denied!" });

  try {
    const verified = jwt.verify(token.split(" ")[1], SECRET_KEY);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token!" });
  }
};

// Protected Route for Admin Data
router.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: "Welcome to Admin Panel!", adminId: req.admin.id });
});

module.exports = router;
