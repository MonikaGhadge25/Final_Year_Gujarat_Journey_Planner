const mongoose = require('mongoose');
const fs = require('fs');
const config = require('./config/config');

// Connect to MongoDB
mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a simple hotel schema to insert the data
const hotelSchema = new mongoose.Schema({}, { strict: false });
const Hotel = mongoose.model('Hotel', hotelSchema, 'hotels');

async function importHotels() {
  try {
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Read the JSON file containing hotels with images
    const jsonPath = 'C:\\Users\\Patel Nishit\\OneDrive\\Desktop\\project\\Final-Year-Project\\gujarat_tour_travel.hotels.json';
    console.log('Reading JSON file:', jsonPath);
    
    if (!fs.existsSync(jsonPath)) {
      console.error('JSON file not found at:', jsonPath);
      return;
    }
    
    const jsonData = fs.readFileSync(jsonPath, 'utf8');
    const hotelsData = JSON.parse(jsonData);
    
    // Convert MongoDB extended JSON format to proper format
    const processedHotels = hotelsData.map(hotel => {
      // Convert _id from {$oid: "..."} to ObjectId
      if (hotel._id && hotel._id.$oid) {
        hotel._id = new mongoose.Types.ObjectId(hotel._id.$oid);
      }
      return hotel;
    });
    
    console.log('Hotels in JSON file:', hotelsData.length);
    
    // Check if any hotels have images
    const hotelsWithImages = hotelsData.filter(hotel => 
      hotel.image || hotel.img_1 || hotel.img_2 || hotel.img_3 || hotel.img_4 || hotel.img_5
    );
    
    console.log('Hotels with images in JSON:', hotelsWithImages.length);
    
    if (hotelsWithImages.length > 0) {
      console.log('\\n=== Sample hotel with image ===');
      const sampleHotel = hotelsWithImages[0];
      console.log('Hotel name:', sampleHotel.hotel_details?.hotel_name);
      console.log('Has main image:', !!sampleHotel.image);
      console.log('Has img_1:', !!sampleHotel.img_1);
      
      if (sampleHotel.image) {
        console.log('Image structure:');
        console.log('- Type:', typeof sampleHotel.image);
        if (sampleHotel.image.$binary) {
          console.log('- Has $binary field');
          console.log('- Base64 length:', sampleHotel.image.$binary.base64?.length || 0);
        }
      }
    }
    
    // Clear existing hotels and import new ones
    console.log('\\n=== Clearing existing hotels ===');
    await Hotel.deleteMany({});
    
    console.log('=== Importing new hotels ===');
    await Hotel.insertMany(hotelsData);
    
    console.log('\\n=== Import complete ===');
    const totalCount = await Hotel.countDocuments();
    console.log('Total hotels in database:', totalCount);
    
    const hotelsWithImagesInDb = await Hotel.countDocuments({
      $or: [
        { image: { $exists: true, $ne: null } },
        { img_1: { $exists: true, $ne: null } },
        { img_2: { $exists: true, $ne: null } },
        { img_3: { $exists: true, $ne: null } },
        { img_4: { $exists: true, $ne: null } },
        { img_5: { $exists: true, $ne: null } }
      ]
    });
    
    console.log('Hotels with images in database:', hotelsWithImagesInDb);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

importHotels();
