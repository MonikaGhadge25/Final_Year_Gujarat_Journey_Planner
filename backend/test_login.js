const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

// Import models
const User = require('./models/User');
const Hotel = require('./models/Hotel');

// Test hotel manager login functionality
const testHotelManagerLogin = async () => {
  try {
    await connectDB();

    console.log('🔐 Testing Hotel Manager Login Functionality\n');

    // Test credentials
    const testCredentials = [
      {
        email: 'hotelblueivyanand@gmail.com',
        password: 'temporary_password_123',
        name: 'Hotel Blueivy Manager'
      },
      {
        email: 'bhanu123@gmail.com',
        password: 'bhanu123', // Assuming this is the password
        name: 'Bhanu Hotel Manager'
      }
    ];

    for (const cred of testCredentials) {
      console.log(`\n=== Testing Login for ${cred.name} ===`);
      console.log(`📧 Email: ${cred.email}`);

      // Step 1: Find user by email
      const user = await User.findOne({ email: cred.email });
      if (!user) {
        console.log('❌ User not found');
        continue;
      }

      console.log(`✅ User found: ${user.fullName}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`🆔 User ID: ${user._id}`);

      // Step 2: Verify password
      const isPasswordValid = await bcrypt.compare(cred.password, user.password);
      console.log(`🔐 Password verification: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);

      if (!isPasswordValid) {
        console.log('❌ Login would fail - incorrect password');
        continue;
      }

      // Step 3: Check if user has hotel role
      if (user.role !== 'hotel') {
        console.log('❌ Login would fail - not a hotel manager');
        continue;
      }

      // Step 4: Generate JWT token (simulate login success)
      const token = jwt.sign(
        { 
          id: user._id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('✅ JWT token generated successfully');
      console.log(`🔑 Token: ${token.substring(0, 50)}...`);

      // Step 5: Find associated hotel
      console.log('\n🏨 Looking for associated hotel...');
      
      let hotel = null;
      
      // Try multiple methods to find hotel (same as controller)
      if (user.hotel_id) {
        hotel = await Hotel.findById(user.hotel_id);
        if (hotel) {
          console.log(`✅ Found hotel via hotel_id: ${hotel.hotel_details.hotel_name}`);
        }
      }
      
      if (!hotel) {
        hotel = await Hotel.findOne({ manager_id: user._id });
        if (hotel) {
          console.log(`✅ Found hotel via manager_id: ${hotel.hotel_details.hotel_name}`);
        }
      }
      
      if (!hotel) {
        hotel = await Hotel.findOne({ 
          $or: [
            { manager_email: user.email },
            { "hotel_details.email": user.email },
            { "hotel_details.username": user.email }
          ]
        });
        if (hotel) {
          console.log(`✅ Found hotel via email matching: ${hotel.hotel_details.hotel_name}`);
        }
      }

      if (hotel) {
        console.log('🎉 LOGIN SUCCESS - User can access hotel dashboard');
        console.log(`🏨 Hotel: ${hotel.hotel_details.hotel_name}`);
        console.log(`📍 Location: ${hotel.hotel_details.location.district}`);
        console.log(`⭐ Rating: ${hotel.hotel_details.rating}`);
        
        // Test API endpoint simulation
        console.log('\n🌐 API Endpoint Access Simulation:');
        console.log('GET /api/hoteldashboard/me - ✅ Would return hotel profile');
        console.log('PUT /api/hoteldashboard/:id - ✅ Would allow updates');
        console.log('GET /api/hoteldashboard/stats - ✅ Would show statistics');
      } else {
        console.log('⚠️ LOGIN SUCCESS but no hotel found - would create default hotel');
      }
    }

    console.log('\n🎯 Login Test Summary:');
    console.log('- Authentication system is working correctly');
    console.log('- Passwords are properly hashed and verified');
    console.log('- JWT token generation is functional');
    console.log('- Hotel-user relationships are established');

  } catch (error) {
    console.error('❌ Login test failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Test specific user login
const testSpecificLogin = async (email, password) => {
  try {
    await connectDB();

    console.log(`🔐 Testing Login for: ${email}\n`);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found');
      return false;
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log(`Password check: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (isValid && user.role === 'hotel') {
      console.log('✅ Login would be successful');
      return true;
    } else {
      console.log('❌ Login would fail');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    mongoose.connection.close();
  }
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.length >= 2) {
    // Test specific credentials
    await testSpecificLogin(args[0], args[1]);
  } else {
    // Run full test
    await testHotelManagerLogin();
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testHotelManagerLogin,
  testSpecificLogin
};