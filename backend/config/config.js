// Configuration file for environment variables
require('dotenv').config();

const config = {
  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/gujarat_travel',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  
  // Server
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://127.0.0.1:5502',
    'http://localhost:5500',
    'http://localhost:5501',
    'http://localhost:5502',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'null'
  ],
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 1000
};

module.exports = config; 