const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');

router.get('/nearby', placeController.getNearbyPlaces);
// Existing search route
router.get('/search', placeController.searchPlaces);

// ✅ Add this route to get single place by name
router.get('/single/:name', placeController.getSinglePlaceByName);

module.exports = router;