async function testHotelImagesAPI() {
  try {
    console.log('🧪 Testing Hotel Search API for images...');
    
    const response = await fetch('http://localhost:5000/api/hotels/search');
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📊 API Response Summary:');
    console.log('Total hotels:', data.hotels?.length || 0);
    console.log('Total pages:', data.totalPages);
    
    if (data.hotels && data.hotels.length > 0) {
      console.log('\n🏨 Hotels with images:');
      
      data.hotels.forEach((hotel, index) => {
        const hotelName = hotel.hotel_details?.hotel_name || hotel.name || 'Unknown Hotel';
        
        let hasImage = false;
        let imageInfo = 'No image';
        
        if (hotel.image) {
          if (typeof hotel.image === 'string' && hotel.image.startsWith('data:image/')) {
            hasImage = true;
            imageInfo = `Data URL (${hotel.image.length} chars)`;
          } else if (hotel.image.base64 && hotel.image.base64.length > 0) {
            hasImage = true;
            imageInfo = `Base64 object (${hotel.image.base64.length} chars)`;
          } else if (hotel.image.$binary && hotel.image.$binary.base64) {
            hasImage = true;
            imageInfo = `Binary format (${hotel.image.$binary.base64.length} chars)`;
          }
        }
        
        const status = hasImage ? '✅' : '❌';
        console.log(`${status} ${hotelName}: ${imageInfo}`);
        
        // Special attention to Bhanu's hotel
        if (hotelName.toLowerCase().includes('bhanu')) {
          console.log('   🔍 Bhanu\'s hotel details:');
          console.log('   - Hotel object:', JSON.stringify(hotel, null, 2));
        }
      });
    } else {
      console.log('❌ No hotels found in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the test
testHotelImagesAPI();