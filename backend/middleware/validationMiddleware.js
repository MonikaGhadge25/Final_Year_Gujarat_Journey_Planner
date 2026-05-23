const { body, param, query, validationResult } = require('express-validator');

// Generic validation handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Hotel validation rules
const validateHotel = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hotel name must be between 2 and 100 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('category')
    .isIn(['budget', 'standard', 'luxury', 'resort'])
    .withMessage('Category must be one of: budget, standard, luxury, resort'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  handleValidationErrors
];

// User registration validation
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['client', 'guide', 'hotel', 'transport'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Booking validation
const validateBooking = [
  body('serviceType')
    .isIn(['hotel', 'transport', 'agent'])
    .withMessage('Service type must be one of: hotel, transport, agent'),
  body('serviceId')
    .isMongoId()
    .withMessage('Invalid service ID'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Search query validation
const validateSearchQuery = [
  query('q')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query is required'),
  handleValidationErrors
];

module.exports = {
  validateHotel,
  validateRegistration,
  validateLogin,
  validateBooking,
  validateId,
  validateSearchQuery,
  handleValidationErrors
}; 