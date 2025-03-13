const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/doctorModel");

router.post("/", async (req, res) => {
  try {
    const {
      userEmail,
      name,
      phone,
      appointmentDate,
      hospital,
      doctor,
      timeSlot,
      age,
      gender,
    } = req.body;

    const newAppointment = new Appointment({
      userEmail,
      name,
      phone,
      appointmentDate,
      hospital,
      doctor,
      timeSlot,
      age,
      gender,
    });

    await newAppointment.save();
    res
      .status(201)
      .json({ message: "Appointment booked successfully", newAppointment });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Fetch all doctors and unique hospitals
router.get("/doctors-hospitals", async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "name hospital"); // Fetch doctors with name & hospital only
    const hospitals = [...new Set(doctors.map((doc) => doc.hospital))]; // Get unique hospitals

    res.status(200).json({ doctors, hospitals });
  } catch (error) {
    console.error("Error fetching doctors and hospitals:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get appointments by user email
router.get("/:userEmail", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userEmail: req.params.userEmail,
    }).populate("doctor");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get appointments by doctor ID
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    }).populate("doctor");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete an appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
