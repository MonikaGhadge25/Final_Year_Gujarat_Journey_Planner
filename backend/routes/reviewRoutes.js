const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/reviews - Submit a new review (requires login)
router.post('/', verifyToken, reviewController.submitReview);

// GET /api/reviews - Get all approved reviews
router.get('/', reviewController.getReviews);

// GET /api/reviews/stats - Get review statistics
router.get('/stats', reviewController.getReviewStats);

module.exports = router;