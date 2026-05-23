require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Hotel = require('./models/Hotel');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://127.0.0.1:5501', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
connectDB();

// Simple hotel search endpoint for testing
app.get('/api/hotels/search', async (req, res) => {
  try {
    console.log('🔍 Hotel search request received');
    const { location, page = 1, limit = 6 } = req.query;
    
    const filter = {};
    if (location) {
      filter.$or = [
        { 'hotel_details.location.district': new RegExp(location, 'i') },
        { 'location.district': new RegExp(location, 'i') }
      ];
    }

    const hotels = await Hotel.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCount = await Hotel.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`✅ Found ${hotels.length} hotels`);
    
    res.json({
      hotels: hotels,
      totalPages,
      currentPage: parseInt(page),
      totalCount
    });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Hotel by ID endpoint for testing
app.get('/api/hotels/:id', async (req, res) => {
  try {
    console.log(`🔍 Hotel detail request for ID: ${req.params.id}`);
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    
    console.log('✅ Hotel found');
    res.json(hotel);
  } catch (error) {
    console.error('❌ Get hotel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Nearby hotels endpoint for testing
app.get('/api/hotels/nearby', async (req, res) => {
  try {
    console.log('🔍 Nearby hotels request');
    const { district, exclude } = req.query;
    
    const hotels = await Hotel.find({
      $or: [
        { 'hotel_details.location.district': district },
        { 'location.district': district }
      ],
      _id: { $ne: exclude }
    }).limit(5);
    
    console.log(`✅ Found ${hotels.length} nearby hotels`);
    res.json({ hotels });
  } catch (error) {
    console.error('❌ Nearby hotels error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /api/hotels/search');
  console.log('  GET /api/hotels/:id');
  console.log('  GET /api/hotels/nearby');
});
