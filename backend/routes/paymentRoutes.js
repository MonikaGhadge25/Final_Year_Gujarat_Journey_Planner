const express = require("express");
const {
  processPayment,
  getPaymentDetails,
  getPaymentHistory
} = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/payment/history
// @desc    Get user's payment history — MUST be before /:bookingId routes
// @access  Private
router.get("/history", verifyToken, getPaymentHistory);

// @route   POST /api/payment/:bookingId/process
// @desc    Process payment for a confirmed booking
// @access  Private
router.post("/:bookingId/process", verifyToken, processPayment);

// @route   GET /api/payment/:bookingId/details
// @desc    Get payment details for a specific booking
// @access  Private
router.get("/:bookingId/details", verifyToken, getPaymentDetails);

module.exports = router;
