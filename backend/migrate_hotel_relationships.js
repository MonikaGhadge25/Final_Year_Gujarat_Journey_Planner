/**
 * Migration Script: Fix Hotel-Manager Relationships
 * 
 * This script updates existing data to establish proper relationships between
 * User accounts and Hotel profiles for hotel managers.
 * 
 * Run this ONCE after updating the models:
 * node migrate_hotel_relationships.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hotel = require('./models/Hotel');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const migrateHotelRelationships = async () => {
  console.log('🚀 Starting hotel-manager relationship migration...\n');

  try {
    // Step 1: Find all hotel managers without hotel_id
    const hotelManagers = await User.find({ 
      role: 'hotel',
      $or: [
        { hotel_id: { $exists: false } },
        { hotel_id: null }
      ]
    });

    console.log(`📊 Found ${hotelManagers.length} hotel managers without hotel_id`);

    // Step 2: Find all hotels without manager_id
    const orphanedHotels = await Hotel.find({
      $or: [
        { manager_id: { $exists: false } },
        { manager_id: null }
      ]
    });

    console.log(`📊 Found ${orphanedHotels.length} hotels without manager_id`);

    let linkingSuccess = 0;
    let newHotelsCreated = 0;

    // Step 3: Try to link existing hotels with managers by email matching
    for (const manager of hotelManagers) {
      console.log(`\n🔍 Processing manager: ${manager.fullName} (${manager.email})`);

      // Try to find a hotel that might belong to this manager
      const matchingHotel = await Hotel.findOne({
        $or: [
          { 'hotel_details.email': manager.email },
          { 'hotel_details.username': manager.email },
          { manager_email: manager.email }
        ]
      });

      if (matchingHotel) {
        // Link the hotel and user
        matchingHotel.manager_id = manager._id;
        matchingHotel.manager_email = manager.email;
        
        manager.hotel_id = matchingHotel._id;
        manager.profile_completed = false; // Hotel manager needs to complete profile

        await Promise.all([
          matchingHotel.save(),
          manager.save()
        ]);

        console.log(`✅ Linked ${manager.email} with hotel: ${matchingHotel.hotel_details.hotel_name}`);
        linkingSuccess++;
      } else {
        // Create a new hotel profile for this manager
        const newHotel = new Hotel({
          manager_id: manager._id,
          manager_email: manager.email,
          hotel_details: {
            hotel_name: manager.fullName + "'s Hotel",
            description: "Welcome to our hotel",
            location: {
              district: "Not specified",
              pincode: 0
            },
            contact: "Not specified",
            email: manager.email,
            check_in_time: "14:00",
            check_out_time: "11:00",
            rating: 0,
            amenities: ["WiFi", "Parking"],
            username: manager.email.split('@')[0] + '_hotel',
            password: 'temp_password_' + Date.now(),
          },
          room_types: [
            {
              type: "Standard Room",
              price_per_night: "2000",
              features: ["AC", "TV", "WiFi"]
            }
          ],
          image: {
            base64: ""
          }
        });

        await newHotel.save();

        // Update manager with hotel_id
        manager.hotel_id = newHotel._id;
        manager.profile_completed = false;
        await manager.save();

        console.log(`✅ Created new hotel for ${manager.email}: ${newHotel.hotel_details.hotel_name}`);
        newHotelsCreated++;
      }
    }

    // Step 4: Handle any remaining orphaned hotels
    const remainingOrphanedHotels = await Hotel.find({
      $or: [
        { manager_id: { $exists: false } },
        { manager_id: null }
      ]
    });

    console.log(`\n📊 Migration Results:`);
    console.log(`   • Successfully linked: ${linkingSuccess} existing hotel-manager pairs`);
    console.log(`   • Created new hotels: ${newHotelsCreated}`);
    console.log(`   • Remaining orphaned hotels: ${remainingOrphanedHotels.length}`);

    if (remainingOrphanedHotels.length > 0) {
      console.log(`\n⚠️  Warning: ${remainingOrphanedHotels.length} hotels still need manual manager assignment:`);
      remainingOrphanedHotels.forEach(hotel => {
        console.log(`   • ${hotel.hotel_details.hotel_name} (${hotel.hotel_details.email})`);
      });
      console.log(`\n💡 Use the admin endpoint GET /api/hotels/admin/orphaned to see these hotels.`);
    }

    // Step 5: Verify results
    const hotelManagersWithHotels = await User.countDocuments({ 
      role: 'hotel',
      hotel_id: { $exists: true, $ne: null }
    });
    
    const hotelsWithManagers = await Hotel.countDocuments({
      manager_id: { $exists: true, $ne: null }
    });

    console.log(`\n📊 Final Status:`);
    console.log(`   • Hotel managers with hotel_id: ${hotelManagersWithHotels}`);
    console.log(`   • Hotels with manager_id: ${hotelsWithManagers}`);
    
    console.log('\n🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await migrateHotelRelationships();
  await mongoose.connection.close();
  console.log('\n👋 Database connection closed. Migration complete.');
  process.exit(0);
};

main().catch((error) => {
  console.error('❌ Migration script failed:', error);
  process.exit(1);
});