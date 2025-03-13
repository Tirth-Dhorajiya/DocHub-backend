const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const admin = require("./routes/admin");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const slotRoutes = require("./routes/slotRoutes");

const multer = require("multer");
const mongoose = require("mongoose");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

dotenv.config();
connectDB();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    console.log("inside file name fxn", file);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes); // Auth routes for login and registration
app.use("/api/user", userRoutes); // User routes for getting and updating user data
app.use("/api/appointments", appointmentRoutes); // Appointment routes for booking and fetching appointments
app.use("/api/slots", slotRoutes); // Slot routes for booking and fetching slots
app.use("/api/admin", admin); // Admin routes for fetching and updating doctor data
app.use("/api/doctors", doctorRoutes); // Doctor routes for fetching and updating doctor data

const Image = mongoose.model("Image", new mongoose.Schema({ image: String }));
app.post("/", upload.single("img"), async (req, res) => {
  console.log(req.file.path);
  const x = await cloudinary.uploader.upload(req.file.path);
  console.log("cloudinary", x);
  const newvar = new Image({ Img_Url: x.secure_url });
  newvar.save().then(() => {
    console.log("saved");
  });
  res.json({
    msg: "file uploaded",
    your_url: { img_url: x.secure_url },
  });
});

// Sample API Route
app.get("/api/test", (req, res) => {
  res.send({ message: "Backend is working!" });
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Fix for Vercel Deployment: Export the Serverless Function
module.exports = app;
