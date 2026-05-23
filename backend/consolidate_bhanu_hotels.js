const mongoose = require('mongoose');
require('dotenv').config();

async function fixBhanuHotel() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const Hotel = require('./models/hotel');
    const User = require('./models/User');
    
    // Find both hotel records
    const originalHotel = await Hotel.findOne({ 
      'hotel_details.hotel_name': 'Bhanu The Fern Forest Resort & Spa',
      'hotel_details.email': 'thefernjambughoda@gmail.com'
    });
    
    const dashboardHotel = await Hotel.findOne({ 
      'hotel_details.hotel_name': 'Bhanu The Fern Forest Resort & Spa\'s Hotel',
      'hotel_details.email': 'bhanu123@gmail.com'
    });
    
    const user = await User.findOne({ email: 'bhanu123@gmail.com' });
    
    if (!originalHotel || !dashboardHotel || !user) {
      console.log('❌ Could not find all required records');
      console.log('Original Hotel:', !!originalHotel);
      console.log('Dashboard Hotel:', !!dashboardHotel);
      console.log('User:', !!user);
      return;
    }
    
    console.log('✅ Found all records. Starting consolidation...');
    console.log('\\nOriginal Hotel:', originalHotel.hotel_details.hotel_name);
    console.log('Dashboard Hotel:', dashboardHotel.hotel_details.hotel_name);
    console.log('User:', user.fullName);
    
    // Step 1: Update the original hotel with images and proper manager relationship
    console.log('\\n📝 Updating original hotel with images and manager relationship...');
    
    originalHotel.image = dashboardHotel.image;
    originalHotel.gallery = dashboardHotel.gallery;
    originalHotel.manager_id = user._id;
    originalHotel.manager_email = user.email;
    
    // Update hotel details with dashboard data if it's more complete
    if (dashboardHotel.hotel_details.contact && dashboardHotel.hotel_details.contact !== 'Not specified') {
      originalHotel.hotel_details.contact = dashboardHotel.hotel_details.contact;
    }
    if (dashboardHotel.hotel_details.description && dashboardHotel.hotel_details.description !== 'Welcome to our hotel') {
      originalHotel.hotel_details.description = dashboardHotel.hotel_details.description;
    }
    if (dashboardHotel.hotel_details.rating && dashboardHotel.hotel_details.rating > 0) {
      originalHotel.hotel_details.rating = dashboardHotel.hotel_details.rating;
    }
    if (dashboardHotel.room_types && dashboardHotel.room_types.length > 0) {
      originalHotel.room_types = dashboardHotel.room_types;
    }
    if (dashboardHotel.hotel_details.amenities && dashboardHotel.hotel_details.amenities.length > 0) {
      originalHotel.hotel_details.amenities = dashboardHotel.hotel_details.amenities;
    }
    
    await originalHotel.save();
    console.log('✅ Original hotel updated successfully');
    
    // Step 2: Update user to point to the original hotel
    console.log('\\n🔗 Updating user hotel_id to point to original hotel...');
    user.hotel_id = originalHotel._id;
    await user.save();
    console.log('✅ User updated successfully');
    
    // Step 3: Delete the duplicate dashboard hotel
    console.log('\\n🗑️ Deleting duplicate dashboard hotel...');
    await Hotel.findByIdAndDelete(dashboardHotel._id);
    console.log('✅ Duplicate hotel deleted successfully');
    
    console.log('\\n🎉 Hotel consolidation completed!');
    console.log('\\nFinal state:');
    console.log('- Hotel:', originalHotel.hotel_details.hotel_name);
    console.log('- Email:', originalHotel.hotel_details.email);
    console.log('- Manager ID:', originalHotel.manager_id);
    console.log('- Manager Email:', originalHotel.manager_email);
    console.log('- Has main image:', originalHotel.image.base64 ? `Yes (${originalHotel.image.base64.length} chars)` : 'No');
    console.log('- Gallery count:', originalHotel.gallery ? originalHotel.gallery.length : 0);
    console.log('- User hotel_id points to:', user.hotel_id);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBhanuHotel();