const mongoose = require('mongoose');
require('dotenv').config();

async function debugUserHotelRelationship() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔍 Debugging User-Hotel Relationships');
    
    const Hotel = require('./models/hotel');
    const User = require('./models/User');
    
    // Find Bhanu's user record
    const user = await User.findById('68ea6cc54084074cbd58acdd');
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('\n=== USER INFO ===');
    console.log('User ID:', user._id);
    console.log('Full Name:', user.fullName);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Hotel ID:', user.hotel_id);
    
    // Find hotels related to this user
    console.log('\n=== HOTEL SEARCH METHODS ===');
    
    // Method 1: By email match (what updateHotelByUserId uses)
    const hotelByEmail = await Hotel.findOne({
      $or: [
        { "hotel_details.email": user.email },
        { "hotel_details.username": user.email }
      ]
    });
    
    console.log('1. Hotel found by email/username match:', hotelByEmail ? hotelByEmail.hotel_details.hotel_name : 'NOT FOUND');
    if (hotelByEmail) {
      console.log('   Hotel ID:', hotelByEmail._id);
      console.log('   Hotel Email:', hotelByEmail.hotel_details.email);
      console.log('   Manager ID:', hotelByEmail.manager_id);
      console.log('   Manager Email:', hotelByEmail.manager_email);
    }
    
    // Method 2: By manager_id match
    const hotelByManagerId = await Hotel.findOne({ manager_id: user._id });
    console.log('2. Hotel found by manager_id match:', hotelByManagerId ? hotelByManagerId.hotel_details.hotel_name : 'NOT FOUND');
    if (hotelByManagerId) {
      console.log('   Hotel ID:', hotelByManagerId._id);
      console.log('   Hotel Email:', hotelByManagerId.hotel_details.email);
    }
    
    // Method 3: By user.hotel_id
    let hotelByUserHotelId = null;
    if (user.hotel_id) {
      hotelByUserHotelId = await Hotel.findById(user.hotel_id);
      console.log('3. Hotel found by user.hotel_id:', hotelByUserHotelId ? hotelByUserHotelId.hotel_details.hotel_name : 'NOT FOUND');
    } else {
      console.log('3. User.hotel_id not set');
    }
    
    console.log('\n=== PROBLEM ANALYSIS ===');
    if (!hotelByEmail) {
      console.log('❌ The updateHotelByUserId function cannot find the hotel');
      console.log('   This is because it searches for:');
      console.log('   - hotel_details.email = "' + user.email + '"');
      console.log('   - hotel_details.username = "' + user.email + '"');
      console.log('   But the hotel record has:');
      if (hotelByManagerId) {
        console.log('   - hotel_details.email = "' + hotelByManagerId.hotel_details.email + '"');
        console.log('   - manager_email = "' + hotelByManagerId.manager_email + '"');
        console.log('\n💡 SOLUTION: The backend controller needs to also search by manager_email and manager_id');
      }
    } else {
      console.log('✅ The relationship should work correctly');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugUserHotelRelationship();