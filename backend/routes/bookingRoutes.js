const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, bookingController.createBooking);
router.get('/user/:userId', verifyToken, bookingController.getUserBookings);

module.exports = router;
