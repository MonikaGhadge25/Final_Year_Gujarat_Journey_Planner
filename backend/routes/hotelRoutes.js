const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelcontroller');

router.get('/search', hotelController.searchHotels);
router.get('/nearby', hotelController.getNearbyHotels); // Specific first!
router.get('/admin/orphaned', hotelController.getOrphanedHotels); // Admin endpoint for hotels without managers  
router.get('/:id', hotelController.getHotelById);       // Keep this last

module.exports = router;
