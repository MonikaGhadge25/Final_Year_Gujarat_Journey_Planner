async function testBhanuHotelAPI() {
  try {
    console.log('🧪 Testing Hotel Search API for Bhanu\'s hotel specifically...');
    
    // Test different search parameters
    const testCases = [
      { name: 'All hotels', url: 'http://localhost:5000/api/hotels/search' },
      { name: 'Search by location (chhota)', url: 'http://localhost:5000/api/hotels/search?location=chhota' },
      { name: 'Search by location (udepur)', url: 'http://localhost:5000/api/hotels/search?location=udepur' },
      { name: 'Search by name (bhanu)', url: 'http://localhost:5000/api/hotels/search?q=bhanu' },
      { name: 'All with larger limit', url: 'http://localhost:5000/api/hotels/search?limit=20' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\\n📍 ${testCase.name}:`);
      
      try {
        const response = await fetch(testCase.url);
        
        if (!response.ok) {
          console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        console.log(`Found ${data.hotels?.length || 0} hotels`);
        
        if (data.hotels && data.hotels.length > 0) {
          data.hotels.forEach((hotel) => {
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
            const location = hotel.hotel_details?.location?.district || 'Unknown location';
            console.log(`  ${status} ${hotelName} (${location}): ${imageInfo}`);
            
            // Special attention to Bhanu's hotel
            if (hotelName.toLowerCase().includes('bhanu')) {
              console.log('   🎯 FOUND BHANU\'S HOTEL!');
              console.log('   - Full name:', hotelName);
              console.log('   - Email:', hotel.hotel_details?.email);
              console.log('   - Location:', location);
              console.log('   - Manager ID:', hotel.manager_id);
              console.log('   - Image status:', imageInfo);
            }
          });
        }
        
      } catch (error) {
        console.error(`❌ Error in ${testCase.name}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

// Run the test
testBhanuHotelAPI();