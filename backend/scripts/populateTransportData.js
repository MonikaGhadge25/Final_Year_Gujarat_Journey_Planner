const mongoose = require('mongoose');
require('dotenv').config();

// Import the Transport model
const Transport = require('../models/Transport');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel');

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Sample transport data using seating_capacity and car_type
const transportData = [
  {
    carName: "Toyota Etios",
    seating_capacity: 3,
    car_type: "sedan",
    fuel: "Petrol",
    ac: true,
    price: "₹12/km",
    location: "Ahmedabad",
    drivers: [{
      name: "Ramesh Patel",
      phone: "9876543210",
      email: "ramesh@example.com",
      vehicleNumber: "GJ01AB1234",
      bookedDates: []
    }]
  },
  {
    carName: "Hyundai i20",
    seating_capacity: 4,
    car_type: "hatchback",
    fuel: "CNG",
    ac: false,
    price: "₹10/km",
    location: "Surat",
    drivers: [{
      name: "Anil Desai",
      phone: "9876500022",
      email: "anil@example.com",
      vehicleNumber: "GJ01EF9012",
      bookedDates: [{ from: "2025-06-20", to: "2025-06-25" }]
    }]
  },
  {
    carName: "Maruti Swift",
    seating_capacity: 4,
    car_type: "hatchback",
    fuel: "Petrol",
    ac: true,
    price: "₹11/km",
    location: "Vadodara",
    drivers: [{
      name: "Kiran Shah",
      phone: "9876541111",
      email: "kiran@example.com",
      vehicleNumber: "GJ01CD5678",
      bookedDates: []
    }]
  },
  {
    carName: "Toyota Innova",
    seating_capacity: 7,
    car_type: "suv",
    fuel: "Diesel",
    ac: true,
    price: "₹20/km",
    location: "Ahmedabad",
    drivers: [{
      name: "Suresh Mehta",
      phone: "9876500001",
      email: "suresh@example.com",
      vehicleNumber: "GJ01XY5678",
      bookedDates: []
    }]
  },
  {
    carName: "Force Traveller",
    seating_capacity: 12,
    car_type: "tempo",
    fuel: "Diesel",
    ac: false,
    price: "₹25/km",
    location: "Rajkot",
    drivers: [{
      name: "Manoj Kumar",
      phone: "9876500033",
      email: "manoj@example.com",
      vehicleNumber: "GJ02ZZ9999",
      bookedDates: []
    }]
  },
  {
    carName: "Mahindra Scorpio",
    seating_capacity: 7,
    car_type: "suv",
    fuel: "Diesel",
    ac: true,
    price: "₹18/km",
    location: "Surat",
    drivers: [{
      name: "Rajesh Kumar",
      phone: "9876500044",
      email: "rajesh@example.com",
      vehicleNumber: "GJ01MM5555",
      bookedDates: []
    }]
  },
  {
    carName: "Tata Sumo",
    seating_capacity: 10,
    car_type: "van",
    fuel: "Diesel",
    ac: false,
    price: "₹15/km",
    location: "Vadodara",
    drivers: [{
      name: "Prakash Joshi",
      phone: "9876500055",
      email: "prakash@example.com",
      vehicleNumber: "GJ01PP7777",
      bookedDates: []
    }]
  },
  {
    carName: "Maruti Eeco",
    seating_capacity: 8,
    car_type: "ecco",
    fuel: "CNG",
    ac: false,
    price: "₹8/km",
    location: "Ahmedabad",
    drivers: [{
      name: "Vikram Patel",
      phone: "9876500066",
      email: "vikram@example.com",
      vehicleNumber: "GJ01VV8888",
      bookedDates: []
    }]
  },
  {
    carName: "Honda City",
    seating_capacity: 4,
    car_type: "sedan",
    fuel: "Petrol",
    ac: true,
    price: "₹14/km",
    location: "Rajkot",
    drivers: [{
      name: "Amit Shah",
      phone: "9876500077",
      email: "amit@example.com",
      vehicleNumber: "GJ01AS9999",
      bookedDates: []
    }]
  },
  {
    carName: "Hyundai Creta",
    seating_capacity: 5,
    car_type: "suv",
    fuel: "Petrol",
    ac: true,
    price: "₹16/km",
    location: "Ahmedabad",
    drivers: [{
      name: "Jigar Patel",
      phone: "9876500088",
      email: "jigar@example.com",
      vehicleNumber: "GJ01JP1111",
      bookedDates: []
    }]
  },
  {
    carName: "Tata Indica",
    seating_capacity: 3,
    car_type: "hatchback",
    fuel: "Petrol",
    ac: false,
    price: "₹9/km",
    location: "Surat",
    drivers: [{
      name: "Ravi Kumar",
      phone: "9876500099",
      email: "ravi@example.com",
      vehicleNumber: "GJ01RK2222",
      bookedDates: []
    }]
  },
  {
    carName: "Mahindra Bolero",
    seating_capacity: 6,
    car_type: "suv",
    fuel: "Diesel",
    ac: false,
    price: "₹13/km",
    location: "Vadodara",
    drivers: [{
      name: "Dhiren Patel",
      phone: "9876500111",
      email: "dhiren@example.com",
      vehicleNumber: "GJ01DP3333",
      bookedDates: []
    }]
  }
];

async function populateTransportData() {
  try {
    console.log('🚀 Starting transport data population...');

    // Clear existing data
    await Transport.deleteMany({});
    console.log('✅ Cleared existing transport data');

    // Insert new data
    const result = await Transport.insertMany(transportData);
    console.log(`✅ Successfully inserted ${result.length} transport records`);

    // Display inserted data summary
    console.log('\n📊 Inserted Transport Data Summary:');
    result.forEach((transport, index) => {
      console.log(`${index + 1}. ${transport.carName} (${transport.type}) - ${transport.location}`);
    });

    console.log('\n🎉 Transport data population completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error populating transport data:', error);
    process.exit(1);
  }
}

// Run the population script
populateTransportData();