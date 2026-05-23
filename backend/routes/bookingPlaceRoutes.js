const express = require('express');
const router = express.Router();
const bookingPlaceController = require('../controllers/BookingPlaceController');

router.get('/search', bookingPlaceController.searchPlaces);

module.exports = router;
