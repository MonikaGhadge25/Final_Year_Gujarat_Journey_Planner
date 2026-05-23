const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Fix Hotel Blueivy manager user account
const fixHotelManagerUser = async () => {
  try {
    await connectDB();

    console.log('🔧 Fixing Hotel Blueivy Manager User Account\n');

    // Find the Hotel Blueivy manager
    const managerEmail = 'hotelblueivyanand@gmail.com';
    let manager = await User.findOne({ email: managerEmail });

    if (!manager) {
      console.log('❌ Hotel Blueivy manager not found, creating new user...');
      
      // Hash the password properly
      const plainPassword = 'temporary_password_123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      // Create new user with proper structure
      manager = new User({
        fullName: "Hotel Blueivy Manager",
        email: managerEmail,
        password: hashedPassword, // Properly hashed password
        gender: "Other",
        dob: new Date('2018-02-06'), // Similar to Bhanu format
        role: "hotel",
        profile_completed: false,
        age: 7, // Calculated from dob (current year - birth year)
        phone: "+91 9876543202", // From hotel contact
        isVerified: true
      });

      await manager.save();
      console.log('✅ Created new Hotel Blueivy manager user');
    } else {
      console.log('📝 Found existing manager, updating password and structure...');
      
      // Hash the password properly
      const plainPassword = 'temporary_password_123';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      // Update with proper structure
      manager.password = hashedPassword;
      manager.gender = manager.gender || "Other";
      manager.dob = manager.dob || new Date('2018-02-06');
      manager.role = "hotel";
      manager.profile_completed = false;
      manager.age = manager.age || 7;
      manager.phone = manager.phone || "+91 9876543202";
      manager.isVerified = true;

      await manager.save();
      console.log('✅ Updated existing Hotel Blueivy manager user');
    }

    console.log('\n📊 Manager User Details:');
    console.log(`👤 Full Name: ${manager.fullName}`);
    console.log(`📧 Email: ${manager.email}`);
    console.log(`🔐 Password Hash: ${manager.password.substring(0, 20)}...`);
    console.log(`👥 Gender: ${manager.gender}`);
    console.log(`📅 DOB: ${manager.dob}`);
    console.log(`🎭 Role: ${manager.role}`);
    console.log(`🆔 User ID: ${manager._id}`);
    console.log(`📞 Phone: ${manager.phone}`);

    // Find the associated hotel and ensure relationships are correct
    const hotel = await Hotel.findOne({ 
      "hotel_details.email": managerEmail 
    });

    if (hotel) {
      console.log('\n🏨 Hotel Relationship:');
      console.log(`🏨 Hotel Name: ${hotel.hotel_details.hotel_name}`);
      console.log(`🆔 Hotel ID: ${hotel._id}`);

      // Update relationships
      let relationshipUpdated = false;

      if (!hotel.manager_id || hotel.manager_id.toString() !== manager._id.toString()) {
        hotel.manager_id = manager._id;
        hotel.manager_email = manager.email;
        relationshipUpdated = true;
      }

      if (!manager.hotel_id || manager.hotel_id.toString() !== hotel._id.toString()) {
        manager.hotel_id = hotel._id;
        relationshipUpdated = true;
      }

      if (relationshipUpdated) {
        await Promise.all([hotel.save(), manager.save()]);
        console.log('🔗 Updated user-hotel relationships');
      } else {
        console.log('✅ User-hotel relationships are correct');
      }
    } else {
      console.log('❌ No hotel found for this manager email');
    }

    // Test password verification
    console.log('\n🧪 Testing Password Verification:');
    const testPassword = 'temporary_password_123';
    const isPasswordValid = await bcrypt.compare(testPassword, manager.password);
    console.log(`Password "${testPassword}" verification: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}`);

    console.log('\n✅ Hotel Manager User Fix Complete');
    console.log('\n📋 Login Credentials:');
    console.log(`📧 Email: ${manager.email}`);
    console.log(`🔐 Password: temporary_password_123`);
    console.log(`🎭 Role: hotel`);

  } catch (error) {
    console.error('❌ Error fixing hotel manager user:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Verify all hotel managers have proper user accounts
const verifyAllHotelManagers = async () => {
  try {
    await connectDB();

    console.log('🔍 Verifying All Hotel Manager User Accounts\n');

    // Find all hotels with manager relationships
    const hotels = await Hotel.find({
      $or: [
        { manager_id: { $exists: true } },
        { manager_email: { $exists: true } }
      ]
    });

    console.log(`Found ${hotels.length} hotels with manager relationships`);

    for (const hotel of hotels) {
      console.log(`\n🏨 Hotel: ${hotel.hotel_details.hotel_name}`);
      console.log(`📧 Manager Email: ${hotel.manager_email || 'Not set'}`);
      console.log(`🆔 Manager ID: ${hotel.manager_id || 'Not set'}`);

      // Find corresponding user
      let user = null;
      
      if (hotel.manager_id) {
        user = await User.findById(hotel.manager_id);
      }
      
      if (!user && hotel.manager_email) {
        user = await User.findOne({ email: hotel.manager_email });
      }

      if (user) {
        console.log(`✅ User account found: ${user.fullName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🎭 Role: ${user.role}`);
        console.log(`   🔐 Password: ${user.password ? 'Set (hashed)' : 'NOT SET'}`);
        
        // Verify password is properly hashed (bcrypt hashes start with $2a$ or $2b$)
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
          console.log('   ✅ Password is properly hashed');
        } else {
          console.log('   ❌ Password is not properly hashed!');
        }
      } else {
        console.log(`❌ No user account found for this hotel manager`);
      }
    }

    console.log('\n✅ Hotel Manager Verification Complete');

  } catch (error) {
    console.error('❌ Error verifying hotel managers:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'fix';

  switch (command) {
    case 'fix':
      await fixHotelManagerUser();
      break;
    case 'verify':
      await verifyAllHotelManagers();
      break;
    case 'both':
      await fixHotelManagerUser();
      console.log('\n' + '='.repeat(50) + '\n');
      await verifyAllHotelManagers();
      break;
    default:
      console.log('Usage: node fix_hotel_manager_user.js [fix|verify|both]');
      console.log('  fix    - Fix Hotel Blueivy manager user account');
      console.log('  verify - Verify all hotel manager user accounts');
      console.log('  both   - Run both operations');
      break;
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fixHotelManagerUser,
  verifyAllHotelManagers
};