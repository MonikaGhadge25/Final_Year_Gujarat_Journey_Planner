require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const agentdashboardRoutes = require("./routes/agentdashboardroutes");
const hoteldashboardRoutes = require("./routes/hoteldashboardroutes");
const transportdashboardRoutes = require("./routes/transportdashboardroutes");
const bookingformsdataRoutes = require("./routes/bookingformsdataRoutes");
const profileRoutes = require("./routes/profileRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// ============================
// Security middleware
// ============================
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  
  // Log request body for debugging (excluding sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    // Remove sensitive fields
    delete logBody.password;
    delete logBody.token;
    console.log(`📝 Request body:`, JSON.stringify(logBody, null, 2));
  }
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// ============================
// Routes
// ============================

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Base CRUD APIs
app.use('/api/hotels', require('./routes/hotelRoutes'));
app.use('/api/places', require('./routes/placeroutes'));
app.use('/api/transport', require('./routes/transportRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));

app.use('/api/hotelauth', require('./routes/hotelauthRoutes'));

// Booking flows (filtered by selected districts)
app.use('/api/booking-hotels', require('./routes/bookinghotelroutes'));
app.use('/api/booking-agents', require('./routes/bookingagentroutes'));
app.use('/api/booking-places', require('./routes/bookingPlaceRoutes'));
// app.use('/api/booking-transport', require('./routes/bookingtransportroutes')); // TODO: create route file
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use("/api/agentdashboard", agentdashboardRoutes);
app.use("/api/hoteldashboard", hoteldashboardRoutes);
app.use("/api/transportdashboard", transportdashboardRoutes);
app.use('/api/bookingformsdata', bookingformsdataRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));

// ============================
// Health check endpoint
// ============================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Gujarat Travel Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      hotels: '/api/hotels',
      places: '/api/places',
      transport: '/api/transport',
      agents: '/api/agents',
      booking: '/api/booking',
      bookingHotels: '/api/booking-hotels',
      bookingAgents: '/api/booking-agents',
      bookingTransport: '/api/booking-transport',
      bookingFormsData: '/api/bookingformsdata',
      profile: '/api/profile',
      agentDashboard: '/api/agentdashboard',
      hotelDashboard: '/api/hoteldashboard',
      transportDashboard: '/api/transportdashboard',
      payment: '/api/payment',
      reviews: '/api/reviews'
    }
  });
});

// Favicon (prevent unnecessary error logs)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ============================
// Error handlers
// ============================
app.use(notFound);
app.use(errorHandler);

// ============================
// Start server
// ============================
const PORT = config.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
});

// ============================
// Graceful shutdown
// ============================
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
