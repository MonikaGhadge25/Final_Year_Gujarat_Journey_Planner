const express = require('express');
const router = express.Router();
const {
  getTransportDashboardStats,
  getCarTypesSummary,
  getTransportBookingRequests,
  getTransportBookingHistory,
  handleTransportBookingRequest,
  getVehicleDetails
} = require('../controllers/transportdashboardcontroller');
const { verifyToken, restrictToRoles } = require('../middleware/authMiddleware');

// @desc    Get transport dashboard statistics
// @route   GET /api/transportdashboard/stats
// @access  Private (transport role preferred but can be public for demo)
router.get('/stats', getTransportDashboardStats);

// @desc    Get car types summary
// @route   GET /api/transportdashboard/car-types
// @access  Private (transport role preferred but can be public for demo)
router.get('/car-types', getCarTypesSummary);

// @desc    Get vehicle details for dashboard
// @route   GET /api/transportdashboard/vehicles
// @access  Private (transport role preferred but can be public for demo)
router.get('/vehicles', getVehicleDetails);

// Protected routes (require authentication and transport role)
// Uncomment these when you have transport role users set up
// router.get('/booking-requests', verifyToken, restrictToRoles('transport'), getTransportBookingRequests);
// router.get('/booking-history', verifyToken, restrictToRoles('transport'), getTransportBookingHistory);
// router.post('/booking-request/:bookingId', verifyToken, restrictToRoles('transport'), handleTransportBookingRequest);

// For now, make these routes accessible without authentication for testing
router.get('/booking-requests', getTransportBookingRequests);
router.get('/booking-history', getTransportBookingHistory);
router.post('/booking-request/:bookingId', handleTransportBookingRequest);

module.exports = router;