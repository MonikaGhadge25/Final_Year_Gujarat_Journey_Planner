const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelmanagementsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixHotelProfile() {
  try {
    console.log('🔧 Fixing Hotel Profile Relationship');
    console.log('===================================');

    const userEmail = 'bhanu123@gmail.com';
    const userId = '68ea6cc54084074cbd58acdd';
    
    console.log(`\n🔍 Looking for user: ${userEmail}`);
    
    // Find the user
    const user = await User.findOne({ 
      $or: [
        { email: userEmail },
        { _id: userId }
      ]
    });
    
    if (!user) {
      console.log('❌ User not found. Available users:');
      const allUsers = await User.find({ role: 'hotel' }, 'fullName email _id role');
      allUsers.forEach(u => {
        console.log(`  - ${u.fullName} (${u.email}) - ID: ${u._id}`);
      });
      return;
    }
    
    console.log(`✅ User found: ${user.fullName} (${user.email})`);
    console.log(`   Role: ${user.role}, ID: ${user._id}`);
    
    // Check if hotel profile already exists
    console.log(`\n🔍 Looking for existing hotel profile...`);
    let hotel = await Hotel.findOne({ 
      $or: [
        { manager_id: user._id },
        { manager_email: user.email },
        { "hotel_details.email": user.email },
        { "hotel_details.username": user.email }
      ]
    });
    
    if (hotel) {
      console.log(`✅ Found existing hotel: ${hotel.hotel_details.hotel_name}`);
      console.log(`   Hotel ID: ${hotel._id}`);
      
      // Update the relationships
      console.log(`\n🔄 Updating relationships...`);
      hotel.manager_id = user._id;
      hotel.manager_email = user.email;
      if (!hotel.hotel_details.email) {
        hotel.hotel_details.email = user.email;
      }
      
      await hotel.save();
      
      // Update user with hotel_id
      user.hotel_id = hotel._id;
      await user.save();
      
      console.log(`✅ Updated existing hotel profile relationships`);
    } else {
      console.log(`❌ No hotel profile found. Creating new one...`);
      
      // Create new hotel profile
      const newHotel = new Hotel({
        manager_id: user._id,
        manager_email: user.email,
        hotel_details: {
          hotel_name: user.fullName.includes('Hotel') ? user.fullName : `${user.fullName}'s Hotel`,
          description: "A wonderful hotel providing excellent service and comfortable accommodations for all guests.",
          location: {
            district: "Not specified",
            pincode: 0
          },
          contact: "Not specified",
          email: user.email,
          check_in_time: "14:00",
          check_out_time: "11:00",
          rating: 3,
          amenities: ["WiFi", "Parking", "Restaurant", "Room Service"],
          username: user.email.split('@')[0] + '_hotel',
          password: 'temp_password_' + Date.now(),
        },
        room_types: [
          {
            type: "Standard Room",
            price_per_night: "₹2000",
            features: ["AC", "TV", "WiFi"]
          }
        ],
        image: {
          base64: ""
        },
        gallery: []
      });
      
      await newHotel.save();
      
      // Update user with hotel_id
      user.hotel_id = newHotel._id;
      await user.save();
      
      console.log(`✅ Created new hotel profile: ${newHotel.hotel_details.hotel_name}`);
      console.log(`   Hotel ID: ${newHotel._id}`);
    }
    
    console.log(`\n📊 Final Status:`);
    console.log(`✅ User: ${user.fullName} (${user.email})`);
    console.log(`✅ User ID: ${user._id}`);
    console.log(`✅ User Role: ${user.role}`);
    console.log(`✅ Hotel ID: ${user.hotel_id}`);
    
    const finalHotel = await Hotel.findById(user.hotel_id);
    console.log(`✅ Hotel: ${finalHotel.hotel_details.hotel_name}`);
    console.log(`✅ Manager ID: ${finalHotel.manager_id}`);
    console.log(`✅ Manager Email: ${finalHotel.manager_email}`);
    
    console.log(`\n🎉 Hotel profile relationship fixed!`);
    console.log(`🚀 You can now upload images and manage the hotel profile.`);
    
  } catch (error) {
    console.error('❌ Error fixing hotel profile:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
  }
}

// Run the fix
fixHotelProfile();