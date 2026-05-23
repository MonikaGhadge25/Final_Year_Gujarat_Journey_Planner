const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel');

async function fixBhanuHotel() {
  try {
    console.log('🔧 Fixing Bhanu Hotel Profile Relationship');
    console.log('=========================================');
    
    const userId = '68ea6cc54084074cbd58acdd';
    const userEmail = 'bhanu123@gmail.com';
    const hotelId = '68ea6cef4084074cbd58ace5';
    
    // Get user
    const user = await User.findById(userId);
    console.log(`✅ User: ${user.fullName} (${user.email})`);
    
    // Get hotel
    const hotel = await Hotel.findById(hotelId);
    console.log(`✅ Hotel: ${hotel.hotel_details.hotel_name}`);
    
    console.log('\n📊 BEFORE FIX:');
    console.log(`User Email: ${user.email}`);
    console.log(`Hotel Email: ${hotel.hotel_details.email}`);
    console.log(`Manager ID: ${hotel.manager_id}`);
    console.log(`Manager Email: ${hotel.manager_email}`);
    
    // Fix the relationship
    console.log('\n🔄 APPLYING FIX...');
    
    // Update hotel details
    hotel.hotel_details.email = user.email;
    hotel.manager_id = user._id;
    hotel.manager_email = user.email;
    
    // Update user with hotel_id
    user.hotel_id = hotel._id;
    
    // Save both
    await hotel.save();
    await user.save();
    
    console.log('\n📊 AFTER FIX:');
    console.log(`✅ User Email: ${user.email}`);
    console.log(`✅ Hotel Email: ${hotel.hotel_details.email}`);
    console.log(`✅ Manager ID: ${hotel.manager_id}`);
    console.log(`✅ Manager Email: ${hotel.manager_email}`);
    console.log(`✅ User Hotel ID: ${user.hotel_id}`);
    
    // Test the search that was failing
    console.log('\n🧪 TESTING SEARCH THAT WAS FAILING...');
    const testHotel = await Hotel.findOne({ 
      $or: [
        { "hotel_details.email": user.email },
        { "hotel_details.username": user.email }
      ]
    });
    
    if (testHotel) {
      console.log(`✅ SUCCESS! Hotel found by email: ${testHotel.hotel_details.hotel_name}`);
    } else {
      console.log(`❌ Still not working - hotel not found by email search`);
    }
    
    console.log('\n🎉 Hotel profile relationship fixed!');
    console.log('🚀 Image upload should now work!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

fixBhanuHotel();