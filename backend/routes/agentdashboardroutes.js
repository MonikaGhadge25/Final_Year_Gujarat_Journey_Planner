// // const express = require("express");
// // const router = express.Router();
// // const agentdashboardcontroller = require("../controllers/agentdashboardcontroller");


// // router.get("/:id", agentdashboardcontroller.getAgentById);   // Read one
// // router.put("/:id", agentdashboardcontroller.updateAgent);    // Update

// // // router.get("/by-user/:userId", agentdashboardcontroller.getAgentByUserId);

// // module.exports = router;


// // // // routes/agentdashboardRoutes.js
// // // const express = require("express");
// // // const router = express.Router();
// // // const agentdashboardController = require("../controllers/agentdashboardController");

// // // router.post("/register", agentdashboardController.registerAgent);
// // // router.post("/login", agentdashboardController.loginAgent);
// // // router.get("/:id", agentdashboardController.getAgentProfile);
// // // router.put("/:id", agentdashboardController.updateAgent);

// // // module.exports = router;


// const express = require("express");
// const router = express.Router();
// const { getGuideById } = require("../controllers/agentdashboardcontroller");
// const { verifyToken, restrictToRoles } = require("../middleware/authMiddleware");

// // GET /api/agentdashboard/:id
// router.get("/:id", verifyToken, restrictToRoles("guide"), getGuideById);

// module.exports = router;

// const express = require("express");
// const router = express.Router();
// const { 
//   getGuideById, 
//   updateGuideProfile, 
//   getCurrentGuideProfile,
//   getAgentBookingRequests,
//   handleBookingRequest,
//   getAgentBookingHistory
// } = require("../controllers/agentdashboardcontroller");
// const { verifyToken, restrictToRoles } = require("../middleware/authMiddleware");

// // Agent profile management
// // GET /api/agentdashboard/me - Get current user's guide profile from token
// router.get("/me", verifyToken, restrictToRoles("guide"), getCurrentGuideProfile);

// // GET /api/agentdashboard/:id - Get guide profile by user ID
// router.get("/:id", verifyToken, restrictToRoles("guide"), getGuideById);

// // PUT /api/agentdashboard/:id - Update guide profile
// router.put("/:id", verifyToken, restrictToRoles("guide"), updateGuideProfile);

// // Booking request management
// // GET /api/agentdashboard/bookings/requests - Get all pending booking requests
// router.get("/bookings/requests", verifyToken, restrictToRoles("guide"), getAgentBookingRequests);

// // POST /api/agentdashboard/bookings/:bookingId/handle - Accept or reject booking request
// router.post("/bookings/:bookingId/handle", verifyToken, restrictToRoles("guide"), handleBookingRequest);

// // GET /api/agentdashboard/bookings/history - Get agent's booking history
// router.get("/bookings/history", verifyToken, restrictToRoles("guide"), getAgentBookingHistory);

// module.exports = router;





/**
 * agentdashboardroutes.js
 * Mirrors hoteldashboardroutes.js — all routes require role:'agent'
 */

const express = require('express');
const router  = express.Router();

const {
  getCurrentAgentProfile,
  getAgentByUserId,
  updateAgentProfile,
  getAgentDashboardStats,
  getAgentBookingRequests,
  handleAgentBookingRequest,
  getAgentBookingHistory
} = require('../controllers/agentdashboardcontroller');

const { verifyToken, restrictToRoles } = require('../middleware/authMiddleware');

// ── Profile ──────────────────────────────────────────────────────────────────
// IMPORTANT: named routes MUST come before /:id to avoid being swallowed
router.get('/me',       verifyToken, restrictToRoles('agent'), getCurrentAgentProfile);
router.get('/stats',    verifyToken, restrictToRoles('agent'), getAgentDashboardStats);

// ── Bookings ─────────────────────────────────────────────────────────────────
router.get('/bookings/requests',              verifyToken, restrictToRoles('agent'), getAgentBookingRequests);
router.get('/bookings/history',               verifyToken, restrictToRoles('agent'), getAgentBookingHistory);
router.post('/bookings/:bookingId/handle',    verifyToken, restrictToRoles('agent'), handleAgentBookingRequest);

// ── Profile by user ID (legacy + update) ─────────────────────────────────────
router.get('/:id',  verifyToken, restrictToRoles('agent'), getAgentByUserId);
router.put('/:id',  verifyToken, restrictToRoles('agent'), updateAgentProfile);

module.exports = router;