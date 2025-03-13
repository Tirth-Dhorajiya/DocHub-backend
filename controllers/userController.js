const User = require("../models/User");

// Get user data by email
const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user data
const updateUser = async (req, res) => {
  const { name, age, mobile, gender, dateOfBirth } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { name, age, mobile, gender, dateOfBirth },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUser, updateUser /* other exports */ };
