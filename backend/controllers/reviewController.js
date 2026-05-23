const Review = require('../models/Review');

// Submit a new review
exports.submitReview = async (req, res) => {
  try {
    const { name, rating, review } = req.body;

    // Validate input
    if (!name || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, rating, and review'
      });
    }

    // Validate rating range
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create new review
    const newReview = new Review({
      name: name.trim(),
      rating: ratingNum,
      review: review.trim()
    });

    const savedReview = await newReview.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: savedReview
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while submitting review'
    });
  }
};

// Get all approved reviews
exports.getReviews = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;

    const reviews = await Review.find({ isApproved: true })
      .select('name rating review createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalReviews = await Review.countDocuments({ isApproved: true });

    res.status(200).json({
      success: true,
      data: reviews,
      total: totalReviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching reviews'
    });
  }
};

// Get review statistics
exports.getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { isApproved: true } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    // Count rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stats[0].ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });

    res.status(200).json({
      success: true,
      data: {
        totalReviews: stats[0].totalReviews,
        averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        ratingDistribution: distribution
      }
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching review statistics'
    });
  }
};