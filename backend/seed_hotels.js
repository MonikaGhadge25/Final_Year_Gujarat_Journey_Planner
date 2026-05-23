require('dotenv').config();
const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
}

// Sample hotel data in the correct format
const sampleHotels = [
  {
    hotel_details: {
      hotel_name: "Royal Heritage Hotel",
      description: "A premium 4-star hotel located in the heart of Ahmedabad, offering luxurious rooms, modern amenities, and exceptional hospitality. Perfect for both business and leisure travelers.",
      location: {
        district: "Ahmedabad",
        pincode: 380009
      },
      contact: "+91 9876543210",
      email: "royalheritage@gmail.com",
      check_in_time: "12 PM",
      check_out_time: "11 AM",
      rating: 4,
      amenities: ["WiFi", "Parking", "Spa", "Pool", "Restaurant"],
      username: "RoyalHeritage@gmail.com",
      password: "Royal@_Heritage04"
    },
    room_types: [
      {
        type: "Single",
        price_per_night: "₹3000",
        features: ["AC", "TV", "WiFi"]
      },
      {
        type: "Double",
        price_per_night: "₹4500",
        features: ["AC", "TV", "WiFi", "Bath Tub"]
      },
      {
        type: "Suite",
        price_per_night: "₹6500",
        features: ["AC", "TV", "WiFi", "Balcony", "Mini Bar"]
      },
      {
        type: "Deluxe",
        price_per_night: "₹9000",
        features: ["AC", "TV", "WiFi", "Jacuzzi", "Private Lounge"]
      }
    ]
  },
  {
    hotel_details: {
      hotel_name: "Sunset Resort Surat",
      description: "Modern beachside resort with stunning views and world-class amenities. Perfect for families and couples seeking a luxurious getaway.",
      location: {
        district: "Surat",
        pincode: 395007
      },
      contact: "+91 9876543211",
      email: "sunset@resort.com",
      check_in_time: "2 PM",
      check_out_time: "12 PM",
      rating: 5,
      amenities: ["WiFi", "Beach Access", "Spa", "Pool", "Restaurant", "Gym"],
      username: "sunset@resort.com",
      password: "Sunset@123"
    },
    room_types: [
      {
        type: "Standard",
        price_per_night: "₹2500",
        features: ["AC", "TV", "WiFi"]
      },
      {
        type: "Deluxe",
        price_per_night: "₹4000",
        features: ["AC", "TV", "WiFi", "Sea View"]
      },
      {
        type: "Premium",
        price_per_night: "₹7500",
        features: ["AC", "TV", "WiFi", "Balcony", "Sea View", "Mini Bar"]
      }
    ]
  },
  {
    hotel_details: {
      hotel_name: "Garden Palace Vadodara",
      description: "Elegant hotel surrounded by beautiful gardens, offering comfort and tranquility in the cultural city of Vadodara.",
      location: {
        district: "Vadodara",
        pincode: 390001
      },
      contact: "+91 9876543212",
      email: "garden@palace.com",
      check_in_time: "1 PM",
      check_out_time: "11 AM",
      rating: 3,
      amenities: ["WiFi", "Garden", "Restaurant", "Parking"],
      username: "garden@palace.com",
      password: "Garden@123"
    },
    room_types: [
      {
        type: "Economy",
        price_per_night: "₹1800",
        features: ["AC", "TV"]
      },
      {
        type: "Standard",
        price_per_night: "₹2800",
        features: ["AC", "TV", "WiFi"]
      },
      {
        type: "Deluxe",
        price_per_night: "₹4200",
        features: ["AC", "TV", "WiFi", "Garden View"]
      }
    ]
  },
  {
    hotel_details: {
      hotel_name: "Business Hub Rajkot",
      description: "Modern business hotel with excellent conference facilities and comfortable accommodations for corporate travelers.",
      location: {
        district: "Rajkot",
        pincode: 360001
      },
      contact: "+91 9876543213",
      email: "business@hub.com",
      check_in_time: "12 PM",
      check_out_time: "10 AM",
      rating: 4,
      amenities: ["WiFi", "Conference Room", "Restaurant", "Parking", "Gym"],
      username: "business@hub.com",
      password: "Business@123"
    },
    room_types: [
      {
        type: "Single",
        price_per_night: "₹2200",
        features: ["AC", "TV", "WiFi", "Work Desk"]
      },
      {
        type: "Executive",
        price_per_night: "₹3500",
        features: ["AC", "TV", "WiFi", "Work Desk", "Mini Bar"]
      },
      {
        type: "Suite",
        price_per_night: "₹5500",
        features: ["AC", "TV", "WiFi", "Work Desk", "Meeting Area"]
      }
    ]
  }
];

async function seedHotels() {
  try {
    await connectDB();
    
    // Clear existing hotels
    await Hotel.deleteMany({});
    console.log('🗑️ Cleared existing hotels');
    
    // Insert sample hotels
    const insertedHotels = await Hotel.insertMany(sampleHotels);
    console.log(`✅ Inserted ${insertedHotels.length} hotels`);
    
    console.log('🎉 Hotel seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding hotels:', error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedHotels();
}

module.exports = seedHotels;
