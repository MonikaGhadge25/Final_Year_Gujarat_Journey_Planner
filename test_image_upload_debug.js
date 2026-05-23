// Test image upload functionality with real authentication
async function testImageUploadWithAuth() {
  console.log('🧪 Testing Image Upload with Authentication');
  
  const API_BASE_URL = 'http://localhost:5000/api';
  
  try {
    // Step 1: Authenticate as Bhanu (hotel manager)
    console.log('\n=== 1. Authentication ===');
    
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'bhanu123@gmail.com',
        password: 'bhanu123'
      })
    });
    
    console.log('Login status:', loginResponse.status, loginResponse.statusText);
    
    if (!loginResponse.ok) {
      const loginError = await loginResponse.text();
      console.error('❌ Login failed:', loginError);
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('User:', loginData.user?.fullName);
    console.log('Role:', loginData.user?.role);
    console.log('Token available:', !!loginData.token);
    
    const authToken = loginData.token;
    const userId = loginData.user._id;
    
    // Step 2: Get current hotel profile
    console.log('\n=== 2. Get Current Hotel Profile ===');
    
    const profileResponse = await fetch(`${API_BASE_URL}/hoteldashboard/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Profile fetch status:', profileResponse.status, profileResponse.statusText);
    
    if (!profileResponse.ok) {
      const profileError = await profileResponse.text();
      console.error('❌ Profile fetch failed:', profileError);
      return;
    }
    
    const profileData = await profileResponse.json();
    console.log('✅ Profile loaded successfully');
    console.log('Hotel Name:', profileData.data?.hotel_details?.hotel_name);
    console.log('Hotel ID:', profileData.data?._id);
    console.log('Current main image:', profileData.data?.image ? 'Present' : 'Not set');
    console.log('Current gallery count:', profileData.data?.gallery?.length || 0);
    
    // Step 3: Test image upload
    console.log('\n=== 3. Test Image Upload ===');
    
    // Create a test image (small base64 encoded image)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const updatePayload = {
      hotel_details: {
        hotel_name: profileData.data?.hotel_details?.hotel_name || 'Test Hotel Name',
        contact: profileData.data?.hotel_details?.contact || '+91 1234567890',
        email: profileData.data?.hotel_details?.email || 'test@hotel.com',
        location: {
          district: profileData.data?.hotel_details?.location?.district || 'Test District',
          pincode: profileData.data?.hotel_details?.location?.pincode || 123456
        },
        description: profileData.data?.hotel_details?.description || 'Test hotel description',
        amenities: profileData.data?.hotel_details?.amenities || ['WiFi', 'Parking'],
        rating: profileData.data?.hotel_details?.rating || 3,
        check_in_time: profileData.data?.hotel_details?.check_in_time || '14:00',
        check_out_time: profileData.data?.hotel_details?.check_out_time || '11:00'
      },
      image: {
        base64: testImageBase64
      },
      gallery: [
        {
          base64: testImageBase64,
          id: 'test_gallery_' + Date.now()
        }
      ]
    };
    
    console.log('Update payload size:', JSON.stringify(updatePayload).length, 'bytes');
    console.log('Sending update request to:', `${API_BASE_URL}/hoteldashboard/${userId}`);
    
    const updateResponse = await fetch(`${API_BASE_URL}/hoteldashboard/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    console.log('Update status:', updateResponse.status, updateResponse.statusText);
    
    if (!updateResponse.ok) {
      const updateError = await updateResponse.text();
      console.error('❌ Update failed:', updateError);
      
      // Additional debugging
      console.log('\n=== Debug Info ===');
      console.log('Response headers:', Object.fromEntries(updateResponse.headers.entries()));
      
      try {
        const errorJson = JSON.parse(updateError);
        console.log('Error details:', errorJson);
      } catch {
        console.log('Raw error text:', updateError.substring(0, 500));
      }
      
      return;
    }
    
    const updateData = await updateResponse.json();
    console.log('✅ Update successful!');
    console.log('Response message:', updateData.message);
    console.log('Updated hotel name:', updateData.data?.hotel_details?.hotel_name);
    console.log('Image updated:', updateData.data?.image ? 'Yes' : 'No');
    console.log('Gallery updated:', updateData.data?.gallery?.length || 0, 'images');
    
    // Step 4: Verify the update
    console.log('\n=== 4. Verify Update ===');
    
    const verifyResponse = await fetch(`${API_BASE_URL}/hoteldashboard/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('✅ Verification successful');
      console.log('Main image present:', verifyData.data?.image?.base64 ? 'Yes' : 'No');
      console.log('Gallery images:', verifyData.data?.gallery?.length || 0);
      
      if (verifyData.data?.image?.base64) {
        console.log('Image base64 length:', verifyData.data.image.base64.length);
      }
    }
    
    console.log('\n🎉 Image upload test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Helper function to test with a larger image
async function testWithLargerImage() {
  console.log('\n🧪 Testing with Larger Image');
  
  // Create a larger test image (100x100 red square)
  const largeImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANJSURBVHic7d1BaxNBGMbx/6ttaVsQD4KIFw9ePHjx4sWLFy9evHjx4sGLFy9evHjwIHjx4sWLFy9evHjx4sWLFw9ePHjw4MGLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWLFy9evHjx4sWDF';
  
  console.log('Large image base64 length:', largeImageBase64.length);
  console.log('Estimated size:', Math.round(largeImageBase64.length * 0.75), 'bytes'); // Base64 is ~75% efficient
}

// Run the tests
console.log('Starting image upload debug tests...');
testImageUploadWithAuth()
  .then(() => testWithLargerImage())
  .catch(console.error);