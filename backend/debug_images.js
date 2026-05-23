const mongoose = require('mongoose');
require('dotenv').config();

async function testImageData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const Hotel = require('./models/hotel');
    
    // Find hotels with images
    const allHotels = await Hotel.find({}).select('hotel_details.hotel_name hotel_details.email image gallery').limit(10);
    
    console.log('\n=== ALL HOTELS ===');
    allHotels.forEach((hotel, index) => {
      console.log(`${index + 1}. ${hotel.hotel_details.hotel_name} (${hotel.hotel_details.email})`);
      console.log('   Has image:', hotel.image ? (hotel.image.base64 ? `Yes (${hotel.image.base64.length} chars)` : 'Empty') : 'No');
      console.log('   Gallery:', hotel.gallery ? hotel.gallery.length : 0, 'images');
    });
    
    // Specifically look for Bhanu's hotel
    const bhanuHotel = await Hotel.findOne({
      $or: [
        { 'hotel_details.hotel_name': /bhanu/i },
        { 'hotel_details.email': 'bhanu123@gmail.com' }
      ]
    });
    
    if (bhanuHotel) {
      console.log('\n=== BHANU\'S HOTEL ===');
      console.log('Hotel Name:', bhanuHotel.hotel_details.hotel_name);
      console.log('Email:', bhanuHotel.hotel_details.email);
      console.log('Image exists:', !!bhanuHotel.image);
      if (bhanuHotel.image) {
        console.log('Image has base64:', !!bhanuHotel.image.base64);
        console.log('Base64 length:', bhanuHotel.image.base64 ? bhanuHotel.image.base64.length : 0);
      }
      console.log('Gallery count:', bhanuHotel.gallery ? bhanuHotel.gallery.length : 0);
    } else {
      console.log('\n❌ Bhanu\'s hotel not found');
    }
    
    const hotels = await Hotel.find({
      'image.base64': { $exists: true, $ne: '' }
    }).select('hotel_details.hotel_name image gallery').limit(5);
    
    console.log(`Found ${hotels.length} hotels with images:`);
    
    hotels.forEach((hotel, index) => {
      console.log(`\nHotel ${index + 1}: ${hotel.hotel_details.hotel_name}`);
      console.log('Image type:', typeof hotel.image);
      console.log('Image keys:', hotel.image ? Object.keys(hotel.image) : 'null');
      
      if (hotel.image) {
        if (hotel.image.base64) {
          console.log('Base64 length:', hotel.image.base64.length);
          console.log('Base64 preview:', hotel.image.base64.substring(0, 50) + '...');
        }
        if (hotel.image.$binary) {
          console.log('Binary format detected');
        }
      }
      
      if (hotel.gallery && hotel.gallery.length > 0) {
        console.log('Gallery images:', hotel.gallery.length);
      }
    });
    
    // Now debug the dashboard issue
    console.log('\n\n=== DASHBOARD DEBUGGING ===');
    
    const User = require('./models/User');
    
    // Find the user Bhanu
    const user = await User.findOne({ email: 'bhanu123@gmail.com' });
    if (user) {
      console.log('\n=== BHANU USER ===');
      console.log('User ID:', user._id);
      console.log('Full Name:', user.fullName);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Hotel ID:', user.hotel_id);
    } else {
      console.log('❌ User bhanu123@gmail.com not found');
    }
    
    // Find all hotel records that could be related to Bhanu
    console.log('\n=== ALL BHANU-RELATED HOTELS ===');
    const bhanusHotels = await Hotel.find({
      $or: [
        { 'hotel_details.hotel_name': /bhanu/i },
        { 'hotel_details.email': 'bhanu123@gmail.com' },
        { 'hotel_details.email': 'thefernjambughoda@gmail.com' },
        { manager_email: 'bhanu123@gmail.com' },
        { manager_id: user ? user._id : null }
      ]
    });
    
    bhanusHotels.forEach((hotel, index) => {
      console.log(`\nHotel ${index + 1}:`);
      console.log('  _id:', hotel._id);
      console.log('  Hotel Name:', hotel.hotel_details.hotel_name);
      console.log('  Email:', hotel.hotel_details.email);
      console.log('  Manager ID:', hotel.manager_id);
      console.log('  Manager Email:', hotel.manager_email);
      console.log('  Has main image:', hotel.image ? (hotel.image.base64 ? `Yes (${hotel.image.base64.length} chars)` : 'Empty object') : 'No');
      console.log('  Gallery count:', hotel.gallery ? hotel.gallery.length : 0);
      
      // Check which one the dashboard would find
      if (user) {
        const wouldBeFoundByEmail = hotel.hotel_details.email === user.email || hotel.hotel_details.username === user.email;
        const wouldBeFoundByManagerId = hotel.manager_id && hotel.manager_id.toString() === user._id.toString();
        const wouldBeFoundByManagerEmail = hotel.manager_email === user.email;
        
        console.log('  🔍 Dashboard would find this hotel by:');
        console.log('    - Email match:', wouldBeFoundByEmail);
        console.log('    - Manager ID:', wouldBeFoundByManagerId);
        console.log('    - Manager Email:', wouldBeFoundByManagerEmail);
      }
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testImageData();
