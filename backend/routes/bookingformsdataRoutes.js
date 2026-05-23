const express = require("express");
const {
  createBookingFormsData,
  getAllBookingFormsData,
  getBookingFormsDataById,
  getBookingsByUserId,
  getPendingBookingsForAgent,
  confirmBookingByAgent,
  confirmBookingByHotel,
  confirmBookingByTransport,
  processPayment,
  getBookingsByEmail,
  cancelBookingByUser,
  updatePaymentByUser
} = require("../controllers/bookingformsdataController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Booking creation and retrieval
router.post("/", verifyToken, createBookingFormsData);  // Create booking with authentication
router.post("/public", createBookingFormsData);  // Temporary public booking endpoint for testing
router.get("/", getAllBookingFormsData);  // Get all bookings (admin use)
router.get("/:id", getBookingFormsDataById);  // Get specific booking

// User bookings
router.get("/user/my-bookings", verifyToken, getBookingsByUserId);  // Get current user's bookings
router.get("/user/:userId", getBookingsByUserId);  // Get bookings for specific user

// Agent booking management
router.get("/agent/pending", verifyToken, getPendingBookingsForAgent);  // Get pending bookings for agent
router.put("/agent/confirm/:bookingId", verifyToken, confirmBookingByAgent);  // Agent confirm/reject booking

// Hotel booking management
router.put("/hotel/confirm/:bookingId", verifyToken, confirmBookingByHotel);  // Hotel confirm/reject booking

// Transport booking management
router.put("/transport/confirm/:bookingId", verifyToken, confirmBookingByTransport);  // Transport confirm/reject booking

// Payment processing
router.post("/payment/:bookingId", verifyToken, processPayment);  // Process payment for confirmed booking

// User actions
router.put("/:bookingId/cancel", verifyToken, cancelBookingByUser);  // User cancel booking
router.put("/:bookingId/payment", verifyToken, updatePaymentByUser);  // User update payment

// Public endpoint for testing - get bookings by email
router.get("/public/user/:email", getBookingsByEmail);  // Get bookings by email (for testing)

module.exports = router;
