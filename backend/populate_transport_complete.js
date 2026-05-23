require('dotenv').config();
const mongoose = require('mongoose');
const Transport = require('./models/Transport');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const completeTransportData = [
  // 3-Seater Hatchback vehicles
  {
    carName: "Maruti Swift",
    seating_capacity: 3,
    car_type: "hatchback",
    fuel: "Petrol",
    ac: true,
    price: "₹10/km",
    location: "Ahmedabad",
    drivers: [{
      name: "Amit Patel",
      phone: "9876543210",
      email: "amit.patel@gmail.com",
      vehicleNumber: "GJ01AA1234",
      bookedDates: []
    }]
  },
  {
    carName: "Hyundai i10",
    seating_capacity: 3,
    car_type: "hatchback",
    fuel: "CNG",
    ac: false,
    price: "₹8/km",
    location: "Surat",
    drivers: [{
      name: "Rajesh Shah",
      phone: "9876543211",
      email: "rajesh.shah@gmail.com",
      vehicleNumber: "GJ05BB2345",
      bookedDates: []
    }]
  },
  {
    carName: "Tata Indica",
    seating_capacity: 3,
    car_type: "hatchback",
    fuel: "Diesel",
    ac: true,
    price: "₹9/km",
    location: "Vadodara",
    drivers: [{
      name: "Deepak Joshi",
      phone: "9876543212",
      email: "deepak.joshi@gmail.com",
      vehicleNumber: "GJ06CC3456",
      bookedDates: []
    }]
  },

  // 4-Seater Sedan vehicles  
  {
    carName: "Honda City",
    seating_capacity: 4,
    car_type: "sedan",
    fuel: "Petrol",
    ac: true,
    price: "₹12/km",
    location: "Ahmedabad",
    drivers: [{
      name: "Vikram Singh",
      phone: "9876543213",
      email: "vikram.singh@gmail.com",
      vehicleNumber: "GJ01DD4567",
      bookedDates: []
    }]
  },
  {
    carName: "Toyota Etios",
    seating_capacity: 4,
    car_type: "sedan",
    fuel: "CNG",
    ac: true,
    price: "₹11/km",
    location: "Surat",
    drivers: [{
      name: "Kiran Kumar",
      phone: "9876543214",
      email: "kiran.kumar@gmail.com",
      vehicleNumber: "GJ05EE5678",
      bookedDates: []
    }]
  },
  {
    carName: "Maruti Dzire",
    seating_capacity: 4,
    car_type: "sedan",
    fuel: "Petrol",
    ac: true,
    price: "₹10/km",
    location: "Vadodara",
    drivers: [{
      name: "Suresh Patel",
      phone: "9876543215",
      email: "suresh.patel@gmail.com",
      vehicleNumber: "GJ06FF6789",
      bookedDates: []
    }]
  },

  // 5-Seater vehicles
  {
    carName: "Maruti Ertiga",
    seating_capacity: 5,
    car_type: "van",
    fuel: "CNG",
    ac: true,
    price: "₹13/km",
    location: "Rajkot",
    drivers: [{
      name: "Mahesh Desai",
      phone: "9876543216",
      email: "mahesh.desai@gmail.com",
      vehicleNumber: "GJ03GG7890",
      bookedDates: []
    }]
  },

  // 6-Seater vehicles
  {
    carName: "Mahindra Bolero",
    seating_capacity: 6,
    car_type: "van",
    fuel: "Diesel",
    ac: false,
    price: "₹14/km",
    location: "Bhavnagar",
    drivers: [{
      name: "Ravi Sharma",
      phone: "9876543217",
      email: "ravi.sharma@gmail.com",
      vehicleNumber: "GJ04HH8901",
      bookedDates: []
    }]
  },

  // 7-Seater SUV vehicles
  {
    carName: "Toyota Innova",
    seating_capacity: 7,
    car_type: "suv",
    fuel: "Diesel",
    ac: true,
    price: "₹16/km",
    location: "Ahmedabad",
    drivers: [{
      name: "Anil Mehta",
      phone: "9876543218",
      email: "anil.mehta@gmail.com",
      vehicleNumber: "GJ01II9012",
      bookedDates: []
    }]
  },
  {
    carName: "Mahindra Scorpio",
    seating_capacity: 7,
    car_type: "suv",
    fuel: "Diesel",
    ac: true,
    price: "₹15/km",
    location: "Surat",
    drivers: [{
      name: "Gopal Yadav",
      phone: "9876543219",
      email: "gopal.yadav@gmail.com",
      vehicleNumber: "GJ05JJ0123",
      bookedDates: []
    }]
  },

  // Van vehicles (8+ seaters)
  {
    carName: "Force Traveller",
    seating_capacity: 12,
    car_type: "van",
    fuel: "Diesel",
    ac: true,
    price: "₹18/km",
    location: "Vadodara",
    drivers: [{
      name: "Prakash Jain",
      phone: "9876543220",
      email: "prakash.jain@gmail.com",
      vehicleNumber: "GJ06KK1234",
      bookedDates: []
    }]
  },

  // Tempo vehicles (12+ seaters)
  {
    carName: "Mahindra Bolero Camper",
    seating_capacity: 15,
    car_type: "tempo",
    fuel: "Diesel",
    ac: false,
    price: "₹20/km",
    location: "Rajkot",
    drivers: [{
      name: "Ramesh Tiwari",
      phone: "9876543221",
      email: "ramesh.tiwari@gmail.com",
      vehicleNumber: "GJ03LL2345",
      bookedDates: []
    }]
  },
  {
    carName: "Tata Winger",
    seating_capacity: 18,
    car_type: "tempo",
    fuel: "Diesel",
    ac: true,
    price: "₹22/km",
    location: "Gandhinagar",
    drivers: [{
      name: "Dinesh Pandey",
      phone: "9876543222",
      email: "dinesh.pandey@gmail.com",
      vehicleNumber: "GJ07MM3456",
      bookedDates: []
    }]
  }
];

async function populateTransportData() {
  try {
    await connectDB();
    
    // Clear existing transport data
    console.log('🗑️ Clearing existing transport data...');
    await Transport.deleteMany({});
    
    // Insert new complete transport data
    console.log('📋 Inserting complete transport data...');
    const result = await Transport.insertMany(completeTransportData);
    
    console.log(`✅ Successfully inserted ${result.length} transport records`);
    console.log('🚗 Transport data populated with complete information');
    
    // Display summary
    const summary = await Transport.aggregate([
      {
        $group: {
          _id: '$car_type',
          count: { $sum: 1 },
          avgSeating: { $avg: '$seating_capacity' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Transport Data Summary:');
    summary.forEach(item => {
      console.log(`- ${item._id}: ${item.count} vehicles (avg ${Math.round(item.avgSeating)} seats)`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error populating transport data:', error);
    process.exit(1);
  }
}

populateTransportData();