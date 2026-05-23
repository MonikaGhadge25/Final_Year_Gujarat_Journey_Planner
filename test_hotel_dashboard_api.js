async function testHotelDashboardAPI() {
  console.log('🧪 Testing Hotel Dashboard API - Image Upload Issues');
  
  // First, let's check if the server is responding
  try {
    console.log('\n=== 1. Testing Server Health ===');
    const healthResponse = await fetch('http://localhost:5000/api/hotels/search');
    console.log('Server status:', healthResponse.status, healthResponse.statusText);
    
    console.log('\n=== 2. Testing Authentication Endpoints ===');
    
    // Test if we can get hotel profile without auth (should fail with 401)
    const noAuthResponse = await fetch('http://localhost:5000/api/hoteldashboard/me');
    console.log('No auth request status:', noAuthResponse.status, noAuthResponse.statusText);
    
    // Get some sample auth token for testing (this would be from your login)
    // For now, let's create a dummy test
    console.log('\n=== 3. Testing Hotel Dashboard Endpoints Structure ===');
    
    const endpointsToTest = [
      'GET /api/hoteldashboard/me',
      'PUT /api/hoteldashboard/:userId', 
      'GET /api/hoteldashboard/:userId',
      'POST /api/hoteldashboard/create'
    ];
    
    for (const endpoint of endpointsToTest) {
      const [method, path] = endpoint.split(' ');
      const url = 'http://localhost:5000' + path.replace(':userId', '68ea6cc54084074cbd58acdd'); // Use Bhanu's user ID
      
      try {
        const response = await fetch(url, { method });
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
          console.log('  ✅ Requires authentication (expected)');
        } else if (response.status === 404) {
          console.log('  ❌ Endpoint not found');
        } else if (response.status === 500) {
          const errorData = await response.text();
          console.log('  ❌ Server error:', errorData.substring(0, 100) + '...');
        }
      } catch (error) {
        console.log(`${endpoint}: ❌ Request failed -`, error.message);
      }
    }
    
    console.log('\n=== 4. Checking Image Upload Specific Issues ===');
    
    // Test file size limits and validation
    console.log('Image upload validation checks:');
    
    const testImageData = {
      hotel_details: {
        hotel_name: 'Test Hotel',
        contact: '+91 1234567890',
        email: 'test@hotel.com',
        location: { district: 'Test District', pincode: 123456 },
        description: 'Test description',
        amenities: ['WiFi', 'Parking']
      },
      image: {
        base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' // 1x1 pixel
      },
      gallery: [
        {
          base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
          id: 'test_gallery_1'
        }
      ]
    };
    
    console.log('Test payload size:', JSON.stringify(testImageData).length, 'bytes');
    console.log('Main image base64 length:', testImageData.image.base64.length);
    console.log('Gallery count:', testImageData.gallery.length);
    
    // Test if we can reach the backend at all
    console.log('\n=== 5. Backend Route Registration Check ===');
    
    try {
      const routeTestResponse = await fetch('http://localhost:5000/', {
        method: 'GET'
      });
      console.log('Root route status:', routeTestResponse.status);
      
      const routeHealthResponse = await fetch('http://localhost:5000/api/health', {
        method: 'GET'
      });
      console.log('Health route status:', routeHealthResponse.status);
      
    } catch (error) {
      console.log('Backend connection test failed:', error.message);
    }
    
    console.log('\n=== 6. Common Image Upload Issues ===');
    console.log('Check these common issues:');
    console.log('1. CORS headers for file uploads');
    console.log('2. Request body size limits (express.json limit)');  
    console.log('3. Base64 encoding/decoding issues');
    console.log('4. Authentication token in headers');
    console.log('5. Route parameter validation (:userId format)');
    console.log('6. MongoDB connection and write permissions');
    console.log('7. File type validation (jpg, png)');
    console.log('8. Memory limits for large base64 images');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testHotelDashboardAPI();