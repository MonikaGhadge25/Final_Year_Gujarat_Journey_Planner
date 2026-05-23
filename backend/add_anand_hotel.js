const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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
const Hotel = require('./models/Hotel');
const User = require('./models/User');

// Convert image to base64
const convertImageToBase64 = (imagePath) => {
  try {
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64String = imageBuffer.toString('base64');
      const extension = path.extname(imagePath).substring(1);
      return `data:image/${extension};base64,${base64String}`;
    }
    return null;
  } catch (error) {
    console.error(`❌ Error converting image ${imagePath}:`, error.message);
    return null;
  }
};

// Read hotel data from JSON file
const readHotelData = () => {
  try {
    const hotelDataPath = 'C:\\Users\\Dell\\Desktop\\Project\\Hotel data\\Anand\\Hotel neptune.txt';
    const rawData = fs.readFileSync(hotelDataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Error reading hotel data:', error.message);
    return null;
  }
};

// Create hotel profile
const createAnandHotel = async () => {
  try {
    await connectDB();

    // Read hotel data
    const hotelData = readHotelData();
    if (!hotelData) {
      console.error('❌ Could not read hotel data');
      process.exit(1);
    }

    console.log('📊 Hotel data loaded:', hotelData.hotel_details.hotel_name);

    // Process images from the Anand folder
    const imageFolder = 'C:\\Users\\Dell\\Desktop\\Project\\Hotel data\\Anand';
    const imageFiles = fs.readdirSync(imageFolder).filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') || 
      file.toLowerCase().endsWith('.png')
    );

    console.log(`📷 Found ${imageFiles.length} image files`);

    // Convert images to base64
    const gallery = [];
    let mainImage = null;

    for (let i = 0; i < imageFiles.length; i++) {
      const imagePath = path.join(imageFolder, imageFiles[i]);
      const base64Image = convertImageToBase64(imagePath);
      
      if (base64Image) {
        if (i === 0) {
          // First image as main image
          mainImage = { base64: base64Image };
        }
        
        // Add to gallery
        gallery.push({
          id: `image_${i + 1}`,
          base64: base64Image,
          uploadedAt: new Date()
        });
        
        console.log(`✅ Converted image ${i + 1}: ${imageFiles[i]}`);
      }
    }

    // Create or find a hotel manager user
    let hotelManager = await User.findOne({ 
      email: hotelData.hotel_details.email 
    });

    if (!hotelManager) {
      // Create a new hotel manager user
      hotelManager = new User({
        fullName: "Hotel Blueivy Manager",
        email: hotelData.hotel_details.email,
        phone: hotelData.hotel_details.contact,
        role: "hotel",
        password: "temporary_password_123", // This should be hashed in production
        profile_completed: true,
        isVerified: true
      });

      await hotelManager.save();
      console.log('✅ Created hotel manager user:', hotelManager._id);
    } else {
      console.log('✅ Found existing hotel manager:', hotelManager._id);
    }

    // Check if hotel already exists
    const existingHotel = await Hotel.findOne({
      $or: [
        { "hotel_details.hotel_name": hotelData.hotel_details.hotel_name },
        { "hotel_details.email": hotelData.hotel_details.email },
        { manager_id: hotelManager._id }
      ]
    });

    if (existingHotel) {
      console.log('⚠️ Hotel already exists:', existingHotel._id);
      console.log('Updating existing hotel with new data...');
      
      // Update existing hotel
      existingHotel.hotel_details = hotelData.hotel_details;
      existingHotel.room_types = hotelData.room_types;
      existingHotel.manager_id = hotelManager._id;
      existingHotel.manager_email = hotelManager.email;
      
      if (mainImage) existingHotel.image = mainImage;
      if (gallery.length > 0) existingHotel.gallery = gallery;
      
      await existingHotel.save();
      console.log('✅ Updated existing hotel profile');
      
      return existingHotel;
    }

    // Create new hotel profile
    const newHotel = new Hotel({
      manager_id: hotelManager._id,
      manager_email: hotelManager.email,
      hotel_details: {
        ...hotelData.hotel_details,
        username: hotelData.hotel_details.email.split('@')[0] + '_hotel',
        password: 'temp_password_' + Date.now()
      },
      room_types: hotelData.room_types,
      image: mainImage || { base64: "" },
      gallery: gallery,
      createdAt: new Date()
    });

    await newHotel.save();

    // Update hotel manager with hotel_id
    hotelManager.hotel_id = newHotel._id;
    await hotelManager.save();

    console.log('✅ Successfully created new hotel profile:');
    console.log('🏨 Hotel ID:', newHotel._id);
    console.log('👤 Manager ID:', hotelManager._id);
    console.log('🖼️ Images added:', gallery.length);
    console.log('📧 Manager Email:', hotelManager.email);

    return newHotel;

  } catch (error) {
    console.error('❌ Error creating hotel profile:', error);
    process.exit(1);
  }
};

// Debug hotel dashboard functionality
const debugHotelDashboard = async () => {
  try {
    console.log('\n🔧 Testing hotel dashboard functionality...\n');

    // Find all hotel managers
    const hotelManagers = await User.find({ role: 'hotel' });
    console.log(`Found ${hotelManagers.length} hotel managers:`);

    for (const manager of hotelManagers) {
      console.log(`\n👤 Manager: ${manager.fullName} (${manager.email})`);
      console.log(`   User ID: ${manager._id}`);
      console.log(`   Hotel ID: ${manager.hotel_id || 'Not set'}`);

      // Try to find associated hotel
      const hotel = await Hotel.findOne({
        $or: [
          { manager_id: manager._id },
          { manager_email: manager.email },
          { "hotel_details.email": manager.email }
        ]
      });

      if (hotel) {
        console.log(`   ✅ Hotel found: ${hotel.hotel_details.hotel_name}`);
        console.log(`   🏨 Hotel ID: ${hotel._id}`);
        console.log(`   📧 Hotel Email: ${hotel.hotel_details.email}`);
        console.log(`   🔗 Manager relationship: ${hotel.manager_id ? 'Set' : 'Missing'}`);
        
        // Fix relationships if missing
        if (!hotel.manager_id) {
          hotel.manager_id = manager._id;
          hotel.manager_email = manager.email;
          await hotel.save();
          console.log('   🔧 Fixed hotel manager_id relationship');
        }
        
        if (!manager.hotel_id) {
          manager.hotel_id = hotel._id;
          await manager.save();
          console.log('   🔧 Fixed user hotel_id relationship');
        }
      } else {
        console.log(`   ❌ No hotel found for this manager`);
      }
    }

    console.log('\n✅ Hotel dashboard debug complete\n');

  } catch (error) {
    console.error('❌ Error in hotel dashboard debug:', error);
  }
};

// Main execution
const main = async () => {
  try {
    console.log('🚀 Starting Hotel Blueivy setup...\n');

    // Create the hotel
    const hotel = await createAnandHotel();
    
    // Debug existing relationships
    await debugHotelDashboard();

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the backend server: node server.js');
    console.log('2. Login to the hotel manager dashboard');
    console.log('3. Test the update functionality');
    
    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createAnandHotel,
  debugHotelDashboard
};