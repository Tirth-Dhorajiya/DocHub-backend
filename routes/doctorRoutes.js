const express = require("express");
const Doctor = require("../models/doctorModel");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// multer storage setup
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Doctor Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(400).json({ message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, doctor });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add a single doctor
router.post("/addDoctor", upload.single("img"), async (req, res) => {
  try {
    const { name, title, hospital, experience, fee, about, email, password } =
      req.body;
    let imgUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imgUrl = result.secure_url;
    }
    const newDoctor = new Doctor({
      name,
      title,
      hospital,
      experience,
      fee,
      email,
      password,
      about,
      img: imgUrl,
    });
    await newDoctor.save();
    res.status(201).json({ message: "Doctor added successfully!", newDoctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add multiple doctors
router.post("/addDoctors", async (req, res) => {
  try {
    const doctors = await Doctor.insertMany(req.body);
    res.status(201).json({ message: "Doctors added successfully!", doctors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all doctors
router.get("/getDoctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get doctor by ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Doctor Details
// Update Doctor Details including email and password
router.put("/updateDoctor/:id", upload.single("img"), async (req, res) => {
  try {
    const { name, title, hospital, about, experience, fee, email, password } =
      req.body;

    let updatedData = {
      name,
      title,
      hospital,
      experience,
      fee,
      about,
    };

    // Handle image update
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updatedData.img = result.secure_url;
    } else {
      const existingDoctor = await Doctor.findById(req.params.id);
      updatedData.img = existingDoctor.img;
    }

    // Handle email update
    if (email) {
      const existingEmail = await Doctor.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== req.params.id) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updatedData.email = email;
    }

    // Handle password update
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(password, salt);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Doctor updated successfully!", updatedDoctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get doctor by email
router.get("/email/:email", async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ email: req.params.email });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a Doctor
router.delete("/deleteDoctor/:id", async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Doctor deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
