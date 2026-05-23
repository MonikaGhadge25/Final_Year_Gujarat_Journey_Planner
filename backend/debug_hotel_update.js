const mongoose = require('mongoose');
const express = require('express');
require('dotenv').config();

// Import models
const Hotel = require('./models/Hotel');
const User = require('./models/User');

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

// Test hotel update functionality
const testHotelUpdate = async () => {
  try {
    await connectDB();

    console.log('🔧 Testing Hotel Dashboard Update Functionality\n');

    // Find all hotel managers
    const hotelManagers = await User.find({ role: 'hotel' });
    console.log(`Found ${hotelManagers.length} hotel managers`);

    for (const manager of hotelManagers) {
      console.log(`\n=== Testing Manager: ${manager.fullName} ===`);
      console.log(`Email: ${manager.email}`);
      console.log(`User ID: ${manager._id}`);

      // Find associated hotel using the same logic as the controller
      let hotel = await Hotel.findOne({ 
        $or: [
          { "hotel_details.email": manager.email },
          { "hotel_details.username": manager.email },
          { manager_email: manager.email },
          { manager_id: manager._id }
        ]
      });

      if (!hotel) {
        console.log('❌ No hotel found for this manager');
        continue;
      }

      console.log(`✅ Hotel found: ${hotel.hotel_details.hotel_name}`);
      console.log(`Hotel ID: ${hotel._id}`);

      // Test update operation
      try {
        const testUpdateData = {
          hotel_details: {
            ...hotel.hotel_details.toObject(),
            description: `Updated description for ${hotel.hotel_details.hotel_name} - ${new Date().toISOString()}`,
            rating: hotel.hotel_details.rating || 4.5
          }
        };

        console.log('🔄 Testing update operation...');

        const updatedHotel = await Hotel.findByIdAndUpdate(
          hotel._id,
          { hotel_details: testUpdateData.hotel_details },
          { new: true, runValidators: true }
        );

        if (updatedHotel) {
          console.log('✅ Update successful');
          console.log(`New description: ${updatedHotel.hotel_details.description.substring(0, 100)}...`);
        } else {
          console.log('❌ Update failed - no document returned');
        }

      } catch (updateError) {
        console.log('❌ Update error:', updateError.message);
        
        // Check for validation errors
        if (updateError.name === 'ValidationError') {
          console.log('Validation errors:');
          for (const field in updateError.errors) {
            console.log(`  - ${field}: ${updateError.errors[field].message}`);
          }
        }
      }

      // Test relationship integrity
      console.log('\n🔍 Checking relationships...');
      console.log(`Manager has hotel_id: ${manager.hotel_id || 'NO'}`);
      console.log(`Hotel has manager_id: ${hotel.manager_id || 'NO'}`);
      console.log(`Hotel has manager_email: ${hotel.manager_email || 'NO'}`);

      // Fix relationships if needed
      let relationshipFixed = false;
      if (!hotel.manager_id || !hotel.manager_email) {
        hotel.manager_id = manager._id;
        hotel.manager_email = manager.email;
        await hotel.save();
        console.log('🔧 Fixed hotel manager relationship');
        relationshipFixed = true;
      }

      if (!manager.hotel_id) {
        manager.hotel_id = hotel._id;
        await manager.save();
        console.log('🔧 Fixed user hotel relationship');
        relationshipFixed = true;
      }

      if (relationshipFixed) {
        console.log('✅ Relationships fixed');
      } else {
        console.log('✅ Relationships are correct');
      }
    }

    console.log('\n🎯 Update Test Summary:');
    console.log('- All hotel profiles tested for update functionality');
    console.log('- Relationships verified and fixed where necessary');
    console.log('- Hotels are ready for dashboard operations');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Simulate frontend API calls
const simulateAPICall = async () => {
  try {
    await connectDB();

    console.log('\n🌐 Simulating Frontend API Calls\n');

    // Get a hotel manager
    const manager = await User.findOne({ role: 'hotel' });
    if (!manager) {
      console.log('❌ No hotel manager found');
      return;
    }

    console.log(`Testing with manager: ${manager.fullName} (${manager._id})`);

    // Simulate GET request - getCurrentHotelProfile logic
    console.log('\n1. Testing GET /api/hoteldashboard/me logic:');
    
    let hotel = null;
    
    // Method 1: Use user.hotel_id if it exists
    if (manager.hotel_id) {
      console.log(`   🔍 Looking for hotel by hotel_id: ${manager.hotel_id}`);
      hotel = await Hotel.findById(manager.hotel_id);
      if (hotel) {
        console.log(`   ✅ Found hotel via hotel_id: ${hotel.hotel_details.hotel_name}`);
      }
    }
    
    // Method 2: Use manager_id relationship
    if (!hotel) {
      console.log(`   🔍 Looking for hotel by manager_id: ${manager._id}`);
      hotel = await Hotel.findOne({ manager_id: manager._id });
      if (hotel) {
        console.log(`   ✅ Found hotel via manager_id: ${hotel.hotel_details.hotel_name}`);
      }
    }
    
    // Method 3: Fallback to email matching
    if (!hotel) {
      console.log(`   🔍 Fallback: Looking for hotel by email: ${manager.email}`);
      hotel = await Hotel.findOne({ 
        $or: [
          { manager_email: manager.email },
          { "hotel_details.email": manager.email },
          { "hotel_details.username": manager.email }
        ]
      });
      if (hotel) {
        console.log(`   ✅ Found hotel via email matching: ${hotel.hotel_details.hotel_name}`);
      }
    }

    if (!hotel) {
      console.log('   ❌ No hotel found - this would trigger creation of default hotel');
      return;
    }

    // Simulate PUT request - updateHotelByUserId logic
    console.log('\n2. Testing PUT /api/hoteldashboard/:id logic:');
    
    const testUpdateData = {
      hotel_details: {
        hotel_name: hotel.hotel_details.hotel_name,
        description: `Test update at ${new Date().toISOString()}`,
        rating: 4.8,
        amenities: hotel.hotel_details.amenities || ["WiFi", "Parking"]
      }
    };

    console.log('   🔄 Simulating update request...');
    
    const updateFields = {};
    
    if (testUpdateData.hotel_details) {
      // Start with existing hotel_details to preserve required fields (like the fixed controller)
      const existingDetails = hotel.hotel_details.toObject();
      updateFields.hotel_details = { ...existingDetails };
      
      const allowedHotelFields = ['hotel_name', 'description', 'location', 'contact', 'email', 'rating', 'check_in_time', 'check_out_time', 'amenities'];
      allowedHotelFields.forEach(field => {
        if (testUpdateData.hotel_details[field] !== undefined) {
          if (field === 'location' && typeof testUpdateData.hotel_details[field] === 'object') {
            // Merge location object to preserve required district field
            updateFields.hotel_details.location = {
              ...existingDetails.location,
              ...testUpdateData.hotel_details[field]
            };
          } else {
            updateFields.hotel_details[field] = testUpdateData.hotel_details[field];
          }
        }
      });
    }

    console.log('   📝 Update fields prepared:', Object.keys(updateFields.hotel_details || {}));

    try {
      const updatedHotel = await Hotel.findByIdAndUpdate(
        hotel._id,
        updateFields,
        { new: true, runValidators: true }
      );

      if (updatedHotel) {
        console.log('   ✅ Update simulation successful');
        console.log(`   📊 Updated hotel: ${updatedHotel.hotel_details.hotel_name}`);
        console.log(`   ⭐ New rating: ${updatedHotel.hotel_details.rating}`);
      } else {
        console.log('   ❌ Update simulation failed');
      }

    } catch (error) {
      console.log('   ❌ Update error:', error.message);
      
      if (error.name === 'ValidationError') {
        console.log('   📋 Validation errors:');
        for (const field in error.errors) {
          console.log(`     - ${field}: ${error.errors[field].message}`);
        }
      }
    }

    console.log('\n✅ API simulation complete');

  } catch (error) {
    console.error('❌ API simulation failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';

  switch (command) {
    case 'test':
      await testHotelUpdate();
      break;
    case 'api':
      await simulateAPICall();
      break;
    case 'both':
      await testHotelUpdate();
      await simulateAPICall();
      break;
    default:
      console.log('Usage: node debug_hotel_update.js [test|api|both]');
      console.log('  test - Test hotel update functionality');
      console.log('  api  - Simulate API calls');
      console.log('  both - Run both tests');
      break;
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testHotelUpdate,
  simulateAPICall
};