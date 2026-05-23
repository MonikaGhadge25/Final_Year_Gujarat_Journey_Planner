// // const express = require("express");
// // const router = express.Router();
// // const { getProfileData } = require("../controllers/profileController");
// // const { protect } = require("../middleware/authMiddleware");

// // router.get("/", protect, getProfileData);

// // module.exports = router;


// const User = require("../models/User");
// const ProfileBooking = require("../models/ProfileBooking");

// const express = require("express");
// const router = express.Router();

// // Import controller
// const { getProfileData } = require("../controllers/profileController");

// // Import auth middleware
// const { protect } = require("../middleware/authMiddleware");

// // @route   GET /api/profile
// // @desc    Get user profile + bookings
// // @access  Private
// router.get("/", protect, getProfileData);

// module.exports = router;


const express = require("express");
const router = express.Router();

const { getProfileData } = require("../controllers/profileController");
const { verifyToken } = require("../middleware/authMiddleware");

// @route   GET /api/profile
// @desc    Get user profile + bookings
// @access  Private
router.get("/", verifyToken, getProfileData);

module.exports = router;
