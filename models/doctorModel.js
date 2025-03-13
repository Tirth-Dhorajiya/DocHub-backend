const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const doctorSchema = new mongoose.Schema({
  img: String,
  name: String,
  title: String,
  experience: String,
  hospital: String,
  about: String,
  fee: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
