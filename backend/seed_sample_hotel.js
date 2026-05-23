const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travelmanagementsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample hotel data based on your example
const sampleHotelData = {
  manager_id: null, // Will be set when you have a hotel manager user
  manager_email: "balajipalaceporbandar@gmail.com",
  hotel_details: {
    hotel_name: "Hotel Balaji Palace",
    description: "A mid-range hotel in Porbandar offering comfortable rooms, essential amenities, and convenient access to the city's religious and coastal attractions.",
    location: {
      district: "Porbandar",
      pincode: 360575
    },
    contact: "+91 9876543223",
    email: "balajipalaceporbandar@gmail.com",
    check_in_time: "12:00", // 12 PM
    check_out_time: "11:00", // 11 AM
    rating: 3,
    amenities: [
      "WiFi",
      "Parking",
      "Restaurant",
      "Banquet Hall",
      "Room Service",
      "Laundry"
    ],
    username: "balaji_palace_porbandar",
    password: "temp_password_" + Date.now()
  },
  room_types: [
    {
      type: "Single",
      price_per_night: "₹1700",
      features: [
        "AC",
        "TV",
        "WiFi"
      ]
    },
    {
      type: "Double",
      price_per_night: "₹2700",
      features: [
        "AC",
        "TV",
        "WiFi",
        "Work Desk"
      ]
    },
    {
      type: "Suite",
      price_per_night: "₹4000",
      features: [
        "AC",
        "TV",
        "WiFi",
        "Mini Bar",
        "Seating Area"
      ]
    },
    {
      type: "Deluxe",
      price_per_night: "₹5200",
      features: [
        "AC",
        "TV",
        "WiFi",
        "Private Lounge",
        "Coffee Maker"
      ]
    }
  ],
  // Base64 encoded sample image data (you can replace this with your actual hotel images)
  image: {
    base64: "" // Add your base64 image data here
  },
  // Sample gallery images
  gallery: [
    {
      id: "gallery_1",
      base64: "", // Add your base64 image data here
      uploadedAt: new Date()
    },
    {
      id: "gallery_2",
      base64: "", // Add your base64 image data here
      uploadedAt: new Date()
    },
    {
      id: "gallery_3",
      base64: "", // Add your base64 image data here
      uploadedAt: new Date()
    },
    {
      id: "gallery_4",
      base64: "", // Add your base64 image data here
      uploadedAt: new Date()
    }
  ]
};

async function seedSampleHotel() {
  try {
    console.log('🌱 Seeding sample hotel data...');
    
    // Check if hotel already exists
    const existingHotel = await Hotel.findOne({ 
      "hotel_details.hotel_name": sampleHotelData.hotel_details.hotel_name 
    });
    
    if (existingHotel) {
      console.log('Hotel already exists, updating with new structure...');
      
      // Update existing hotel with new fields
      const updatedHotel = await Hotel.findByIdAndUpdate(
        existingHotel._id,
        {
          $set: {
            manager_email: sampleHotelData.manager_email,
            hotel_details: sampleHotelData.hotel_details,
            room_types: sampleHotelData.room_types
          }
        },
        { new: true, runValidators: true }
      );
      
      console.log('✅ Updated existing hotel:', updatedHotel.hotel_details.hotel_name);
    } else {
      // Create new hotel
      const newHotel = new Hotel(sampleHotelData);
      await newHotel.save();
      console.log('✅ Created new sample hotel:', newHotel.hotel_details.hotel_name);
    }
    
    console.log('📝 Sample hotel data structure:');
    console.log('- Hotel Name:', sampleHotelData.hotel_details.hotel_name);
    console.log('- District:', sampleHotelData.hotel_details.location.district);
    console.log('- Room Types:', sampleHotelData.room_types.length);
    console.log('- Amenities:', sampleHotelData.hotel_details.amenities.length);
    
    console.log('🎉 Sample hotel seeding completed successfully!');
    
    // List all hotels to verify
    const allHotels = await Hotel.find({});
    console.log('🏨 Total hotels in database:', allHotels.length);
    
  } catch (error) {
    console.error('❌ Error seeding sample hotel:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
  }
}

// Run the seeding
seedSampleHotel();