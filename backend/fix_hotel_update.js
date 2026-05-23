const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Hotel = require('./models/Hotel');

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

// Fix the hotel update controller issue
const fixHotelUpdateIssue = async () => {
  try {
    await connectDB();

    console.log('🔧 Fixing Hotel Dashboard Update Issues\n');

    // Find all hotels and check their structure
    const hotels = await Hotel.find({});
    console.log(`Found ${hotels.length} hotels to check`);

    for (const hotel of hotels) {
      console.log(`\n📋 Checking hotel: ${hotel.hotel_details.hotel_name}`);
      
      let needsUpdate = false;
      const updates = {};

      // Check if required fields are missing
      if (!hotel.hotel_details.location || !hotel.hotel_details.location.district) {
        console.log('  ❌ Missing required location.district field');
        if (!updates.hotel_details) updates.hotel_details = { ...hotel.hotel_details.toObject() };
        if (!updates.hotel_details.location) updates.hotel_details.location = {};
        updates.hotel_details.location.district = updates.hotel_details.location.district || 'Not specified';
        needsUpdate = true;
      }

      // Ensure other required fields exist
      if (!hotel.hotel_details.hotel_name) {
        console.log('  ❌ Missing required hotel_name field');
        if (!updates.hotel_details) updates.hotel_details = { ...hotel.hotel_details.toObject() };
        updates.hotel_details.hotel_name = 'Unnamed Hotel';
        needsUpdate = true;
      }

      // Ensure manager relationship fields exist
      if (!hotel.manager_id && !hotel.manager_email) {
        console.log('  ⚠️ Missing manager relationship fields');
        // These will be fixed when the user logs in
      }

      // Apply updates if needed
      if (needsUpdate) {
        try {
          await Hotel.findByIdAndUpdate(
            hotel._id,
            updates,
            { runValidators: false } // Skip validation for this fix
          );
          console.log('  ✅ Fixed missing required fields');
        } catch (error) {
          console.log('  ❌ Failed to fix hotel:', error.message);
        }
      } else {
        console.log('  ✅ Hotel structure is valid');
      }
    }

    console.log('\n✅ Hotel structure validation complete');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Test the update with proper field handling
const testProperUpdate = async () => {
  try {
    await connectDB();

    console.log('🧪 Testing Proper Hotel Update\n');

    const hotel = await Hotel.findOne({});
    if (!hotel) {
      console.log('❌ No hotel found for testing');
      return;
    }

    console.log(`Testing update on: ${hotel.hotel_details.hotel_name}`);

    // Prepare update data with all required fields preserved
    const updateData = {
      hotel_details: {
        hotel_name: hotel.hotel_details.hotel_name, // Required
        description: `Updated description - ${new Date().toISOString()}`,
        location: {
          district: hotel.hotel_details.location?.district || 'Not specified', // Required
          pincode: hotel.hotel_details.location?.pincode || 0
        },
        contact: hotel.hotel_details.contact || 'Not specified',
        email: hotel.hotel_details.email || '',
        check_in_time: hotel.hotel_details.check_in_time || '14:00',
        check_out_time: hotel.hotel_details.check_out_time || '11:00',
        rating: 4.5,
        amenities: hotel.hotel_details.amenities || ['WiFi', 'Parking'],
        username: hotel.hotel_details.username || '',
        password: hotel.hotel_details.password || ''
      }
    };

    console.log('📝 Attempting update with complete data...');

    try {
      const updatedHotel = await Hotel.findByIdAndUpdate(
        hotel._id,
        { hotel_details: updateData.hotel_details },
        { new: true, runValidators: true }
      );

      if (updatedHotel) {
        console.log('✅ Update successful!');
        console.log(`📊 Hotel: ${updatedHotel.hotel_details.hotel_name}`);
        console.log(`🏠 District: ${updatedHotel.hotel_details.location.district}`);
        console.log(`⭐ Rating: ${updatedHotel.hotel_details.rating}`);
        console.log(`📄 Description: ${updatedHotel.hotel_details.description.substring(0, 100)}...`);
      } else {
        console.log('❌ Update returned null');
      }

    } catch (error) {
      console.log('❌ Update error:', error.message);
      
      if (error.name === 'ValidationError') {
        console.log('📋 Validation errors:');
        for (const field in error.errors) {
          console.log(`  - ${field}: ${error.errors[field].message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
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
      await fixHotelUpdateIssue();
      break;
    case 'test':
      await testProperUpdate();
      break;
    case 'both':
      await fixHotelUpdateIssue();
      await testProperUpdate();
      break;
    default:
      console.log('Usage: node fix_hotel_update.js [fix|test|both]');
      console.log('  fix  - Fix hotel structure issues');
      console.log('  test - Test proper update functionality');
      console.log('  both - Run both fix and test');
      break;
  }
};

// Run if called directly
if (require.main === module) {
  main();
}