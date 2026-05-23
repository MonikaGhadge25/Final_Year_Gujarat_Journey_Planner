const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testUser = {
  fullName: 'Test Guide User',
  email: 'testguide@example.com',
  password: 'testpassword123',
  dob: '1990-01-01',
  gender: 'Male',
  role: 'guide'
};

async function testAgentDashboardAPI() {
  try {
    console.log('🚀 Starting Agent Dashboard API Tests...\n');

    // Step 1: Register test user
    console.log('1. Registering test user...');
    try {
      await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ User registered successfully');
    } catch (error) {
      if (error.response?.data?.message === 'User already exists') {
        console.log('ℹ️  User already exists, proceeding with login');
      } else {
        throw error;
      }
    }

    // Step 2: Login user
    console.log('\n2. Logging in test user...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    const { token, user } = loginResponse.data;
    console.log(`✅ Login successful! User ID: ${user._id}, Role: ${user.role}`);
    
    const authHeaders = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    // Step 3: Test /me endpoint (recommended approach)
    console.log('\n3. Testing /api/agentdashboard/me endpoint...');
    try {
      const meResponse = await axios.get(`${API_BASE}/agentdashboard/me`, authHeaders);
      console.log('✅ /me endpoint successful!');
      console.log('📊 Guide Profile:', JSON.stringify(meResponse.data, null, 2));
    } catch (error) {
      console.error('❌ /me endpoint failed:', error.response?.data || error.message);
    }

    // Step 4: Test /:id endpoint 
    console.log('\n4. Testing /api/agentdashboard/:id endpoint...');
    try {
      const idResponse = await axios.get(`${API_BASE}/agentdashboard/${user._id}`, authHeaders);
      console.log('✅ /:id endpoint successful!');
      console.log('📊 Guide Profile:', JSON.stringify(idResponse.data, null, 2));
    } catch (error) {
      console.error('❌ /:id endpoint failed:', error.response?.data || error.message);
    }

    // Step 5: Test update endpoint
    console.log('\n5. Testing profile update...');
    const updateData = {
      district: 'Ahmedabad',
      address: '123 Test Street, Gujarat',
      experience: 5,
      fees: 2500,
      mobile_no: '+91-9876543210'
    };
    
    try {
      const updateResponse = await axios.put(`${API_BASE}/agentdashboard/${user._id}`, updateData, authHeaders);
      console.log('✅ Profile update successful!');
      console.log('📊 Updated Profile:', JSON.stringify(updateResponse.data, null, 2));
    } catch (error) {
      console.error('❌ Profile update failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('💥 Test failed:', error.response?.data || error.message);
  }
}

// Run the test
if (require.main === module) {
  testAgentDashboardAPI();
}

module.exports = { testAgentDashboardAPI };
