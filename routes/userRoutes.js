const express = require("express");
const { getUser, updateUser } = require("../controllers/userController");
const router = express.Router();

// Get user data by email
router.get("/:email", getUser);

// Update user data
router.put("/update/:email", updateUser);

module.exports = router;
