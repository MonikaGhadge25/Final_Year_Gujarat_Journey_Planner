const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now, can be changed to false for moderation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;