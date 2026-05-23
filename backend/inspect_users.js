const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel');

async function inspectDatabase() {
  try {
    console.log('🔍 Inspecting Database');
    console.log('=====================');
    
    // Find all users
    console.log('\n👤 ALL USERS:');
    const allUsers = await User.find({}, 'fullName email _id role').sort({ createdAt: -1 });
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
    } else {
      allUsers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.fullName} (${u.email})`);
        console.log(`   ID: ${u._id}, Role: ${u.role}`);
      });
    }
    
    // Find hotel managers specifically
    console.log('\n🏨 HOTEL MANAGERS:');
    const hotelManagers = await User.find({ role: 'hotel' }, 'fullName email _id').sort({ createdAt: -1 });
    if (hotelManagers.length === 0) {
      console.log('❌ No hotel managers found');
    } else {
      hotelManagers.forEach((u, index) => {
        console.log(`${index + 1}. ${u.fullName} (${u.email})`);
        console.log(`   ID: ${u._id}`);
      });
    }
    
    // Find all hotels
    console.log('\n🏨 ALL HOTELS:');
    const allHotels = await Hotel.find({}, 'hotel_details.hotel_name hotel_details.email manager_email manager_id').sort({ createdAt: -1 });
    if (allHotels.length === 0) {
      console.log('❌ No hotels found in database');
    } else {
      allHotels.forEach((h, index) => {
        console.log(`${index + 1}. ${h.hotel_details.hotel_name}`);
        console.log(`   Hotel Email: ${h.hotel_details.email}`);
        console.log(`   Manager Email: ${h.manager_email}`);
        console.log(`   Manager ID: ${h.manager_id}`);
        console.log(`   Hotel ID: ${h._id}`);
      });
    }
    
    // Show the specific error case
    console.log('\n🔍 CHECKING SPECIFIC USER FROM ERROR:');
    const specificUserId = '68ea6cc54084074cbd58acdd';
    console.log(`Looking for user ID: ${specificUserId}`);
    
    const specificUser = await User.findById(specificUserId);
    if (specificUser) {
      console.log(`✅ Found user: ${specificUser.fullName} (${specificUser.email})`);
      console.log(`   Role: ${specificUser.role}, ID: ${specificUser._id}`);
      
      // Check if hotel exists for this user
      const hotelForUser = await Hotel.findOne({
        $or: [
          { manager_id: specificUser._id },
          { manager_email: specificUser.email },
          { "hotel_details.email": specificUser.email }
        ]
      });
      
      if (hotelForUser) {
        console.log(`✅ Hotel found: ${hotelForUser.hotel_details.hotel_name}`);
      } else {
        console.log(`❌ No hotel found for this user - THIS IS THE PROBLEM!`);
        console.log(`🔧 Need to create hotel profile for: ${specificUser.email}`);
      }
    } else {
      console.log(`❌ User with ID ${specificUserId} not found`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

inspectDatabase();