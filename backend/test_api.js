const http = require('http');

// Test API endpoint
const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/hotels/search?limit=1',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('\n=== API Response ===');
      console.log('Total hotels:', jsonData.hotels?.length);
      
      if (jsonData.hotels && jsonData.hotels[0]) {
        const hotel = jsonData.hotels[0];
        console.log('\n=== First Hotel ===');
        console.log('ID:', hotel._id);
        console.log('Name:', hotel.hotel_details?.hotel_name);
        console.log('Image type:', typeof hotel.image);
        console.log('Image value:', hotel.image);
        console.log('Has img_1:', !!hotel.img_1);
        console.log('Has img_2:', !!hotel.img_2);
        
        // Check image structure
        if (hotel.image) {
          if (typeof hotel.image === 'string') {
            console.log('Image is string, starts with data:', hotel.image.startsWith('data:'));
            console.log('Image preview:', hotel.image.substring(0, 100) + '...');
          } else {
            console.log('Image is object with keys:', Object.keys(hotel.image));
            console.log('Image object value:', JSON.stringify(hotel.image, null, 2));
          }
        }
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
