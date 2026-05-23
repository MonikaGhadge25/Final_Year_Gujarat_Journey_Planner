const mongoose = require('mongoose');
const config = require('./config/config');

// Connect to MongoDB
mongoose.connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define a simple hotel schema to read the data
const hotelSchema = new mongoose.Schema({}, { strict: false });
const Hotel = mongoose.model('Hotel', hotelSchema, 'hotels');

async function debugHotels() {
  try {
    // Wait for connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('=== Counting hotels ===');
    const totalHotels = await Hotel.countDocuments();
    console.log('Total hotels in database:', totalHotels);
    
    console.log('\n=== Fetching hotel with image from database ===');
    
    // First try to find a hotel with an image
    let hotel = await Hotel.findOne({ image: { $exists: true, $ne: null } }).lean();
    if (!hotel) {
      console.log('No hotels with image field found, trying img_1');
      hotel = await Hotel.findOne({ img_1: { $exists: true, $ne: null } }).lean();
    }
    if (!hotel) {
      console.log('No hotels with images found, getting first hotel');
      hotel = await Hotel.findOne().lean();
    }
    if (!hotel) {
      console.log('No hotels found in database at all');
      return;
    }
    
    console.log('\n=== Checking all hotels for image fields ===');
    const allHotels = await Hotel.find({}, { _id: 1, 'hotel_details.hotel_name': 1, image: 1, img_1: 1 }).limit(10).lean();
    allHotels.forEach((h, i) => {
      console.log(`Hotel ${i + 1}: ${h.hotel_details?.hotel_name || 'Unnamed'} - Image: ${!!h.image}, img_1: ${!!h.img_1}`);
    });
    
    console.log('Hotel ID:', hotel._id);
    console.log('Hotel name:', hotel.hotel_details?.hotel_name);
    
    console.log('\n=== Image field analysis ===');
    console.log('Image exists:', !!hotel.image);
    console.log('Image type:', typeof hotel.image);
    
    if (hotel.image) {
      console.log('Image keys:', Object.keys(hotel.image));
      console.log('Image structure:', JSON.stringify(hotel.image, null, 2).substring(0, 500));
      
      // Test the processImage function logic
      const processImage = (imageField) => {
        console.log('\n--- Processing image ---');
        console.log('Input type:', typeof imageField);
        console.log('Input value preview:', imageField ? JSON.stringify(imageField, null, 2).substring(0, 200) : 'null');
        
        if (!imageField) {
          console.log('No image field, returning null');
          return null;
        }
        
        if (imageField.$binary && imageField.$binary.base64) {
          console.log('Found $binary.base64, converting to data URL');
          return `data:image/jpeg;base64,${imageField.$binary.base64}`;
        } else if (imageField.base64) {
          console.log('Found base64, converting to data URL');
          return `data:image/jpeg;base64,${imageField.base64}`;
        } else if (Buffer.isBuffer(imageField)) {
          console.log('Found Buffer, converting to data URL');
          return `data:image/jpeg;base64,${imageField.toString('base64')}`;
        } else if (imageField.data && Buffer.isBuffer(imageField.data)) {
          console.log('Found Buffer data, converting to data URL');
          return `data:image/jpeg;base64,${imageField.data.toString('base64')}`;
        }
        
        console.log('No recognized format, returning as is');
        return imageField;
      };
      
      const processedImage = processImage(hotel.image);
      console.log('\n=== Processed image result ===');
      console.log('Type:', typeof processedImage);
      console.log('Preview:', processedImage ? processedImage.toString().substring(0, 100) + '...' : 'null');
    }
    
    console.log('\n=== Additional image fields ===');
    for (let i = 1; i <= 5; i++) {
      const imgKey = `img_${i}`;
      if (hotel[imgKey]) {
        console.log(`${imgKey} exists:`, !!hotel[imgKey]);
        console.log(`${imgKey} type:`, typeof hotel[imgKey]);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugHotels();
