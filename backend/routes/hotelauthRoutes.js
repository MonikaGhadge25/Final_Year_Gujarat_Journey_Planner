const express = require('express');
const router  = express.Router();

const { hotelLogin, getMe, updateHotel } = require('../controllers/hotelauth');
const { verifyHotelToken }               = require('../middleware/hotelAuthMiddleware');

// POST /api/hotelauth/login   — no auth needed
router.post('/login', hotelLogin);

// GET  /api/hotelauth/me      — get this hotel's full data
router.get('/me', verifyHotelToken, getMe);

// PUT  /api/hotelauth/update  — update hotel details
router.put('/update', verifyHotelToken, updateHotel);

module.exports = router;