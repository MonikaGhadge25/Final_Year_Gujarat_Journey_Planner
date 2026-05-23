const express = require("express");
const router = express.Router();
const { 
  getHotelById, 
  updateHotelProfile, 
  getCurrentHotelProfile,
  getHotelBookingRequests,
  handleHotelBookingRequest,
  getHotelBookingHistory,
  getHotelDashboardStats,
  // New endpoints for frontend compatibility
  getHotelByManagerEmail,
  getHotelByManagerId,
  findHotelByManager,
  createHotelProfile
} = require("../controllers/hoteldashboardcontroller");
const { verifyToken, restrictToRoles } = require("../middleware/authMiddleware");

// Hotel profile management
// GET /api/hoteldashboard/me - Get current user's hotel profile from token
router.get("/me", verifyToken, restrictToRoles("hotel"), getCurrentHotelProfile);

// NEW ENDPOINTS - Frontend compatibility
// GET /api/hoteldashboard/by-manager/:email - Get hotel by manager email
router.get("/by-manager/:email", verifyToken, restrictToRoles("hotel"), getHotelByManagerEmail);

// GET /api/hoteldashboard/by-manager-id/:userId - Get hotel by manager ID
router.get("/by-manager-id/:userId", verifyToken, restrictToRoles("hotel"), getHotelByManagerId);

// POST /api/hoteldashboard/find-by-manager - Find hotel by manager (flexible search)
router.post("/find-by-manager", verifyToken, restrictToRoles("hotel"), findHotelByManager);

// POST /api/hoteldashboard/create - Create new hotel profile
router.post("/create", verifyToken, restrictToRoles("hotel"), createHotelProfile);

// GET /api/hoteldashboard/stats - Get hotel dashboard statistics
router.get("/stats", verifyToken, restrictToRoles("hotel"), getHotelDashboardStats);

// GET /api/hoteldashboard/:id - Get hotel profile by user ID
router.get("/:id", verifyToken, restrictToRoles("hotel"), getHotelById);

// PUT /api/hoteldashboard/:id - Update hotel profile
router.put("/:id", verifyToken, restrictToRoles("hotel"), updateHotelProfile);

// Booking request management
// GET /api/hoteldashboard/bookings/requests - Get all pending booking requests
router.get("/bookings/requests", verifyToken, restrictToRoles("hotel"), getHotelBookingRequests);

// POST /api/hoteldashboard/bookings/:bookingId/handle - Accept or reject booking request
router.post("/bookings/:bookingId/handle", verifyToken, restrictToRoles("hotel"), handleHotelBookingRequest);

// GET /api/hoteldashboard/bookings/history - Get hotel's booking history
router.get("/bookings/history", verifyToken, restrictToRoles("hotel"), getHotelBookingHistory);

module.exports = router;
