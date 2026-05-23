# Agent Dashboard API Integration Guide

## Overview

The agent dashboard API provides endpoints for guides to manage their profile data. This guide explains how to integrate the API with your frontend application.

## API Endpoints

### 1. Get Current User's Profile (Recommended)

**Endpoint**: `GET /api/agentdashboard/me`  
**Description**: Gets the current authenticated user's guide profile  
**Authentication**: Required (Bearer token)  
**Role**: guide only  

**Example Request**:
```javascript
// Assuming you have the JWT token from login
const token = localStorage.getItem('authToken'); // or wherever you store it

const response = await fetch('/api/agentdashboard/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "_id": "68b92b59f7cbe9d6700badfc",
    "name": "Test Guide User",
    "email": "testguide@example.com",
    "mobile_no": "+91-9876543210",
    "district": "Ahmedabad",
    "address": "123 Test Street, Gujarat",
    "experience": 5,
    "language": ["English"],
    "rating": 0,
    "fees": 2500,
    "gender": "Male",
    "age": 34
  }
}
```

### 2. Get Profile by User ID

**Endpoint**: `GET /api/agentdashboard/:userId`  
**Description**: Gets guide profile by specific user ID  
**Authentication**: Required (Bearer token)  
**Role**: guide only  

**Example Request**:
```javascript
const userId = 'USER_ID_HERE'; // Get from login response
const response = await fetch(`/api/agentdashboard/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Update Profile

**Endpoint**: `PUT /api/agentdashboard/:userId`  
**Description**: Updates guide profile data  
**Authentication**: Required (Bearer token)  
**Role**: guide only  

**Allowed Fields**: `name`, `district`, `address`, `experience`, `age`, `language`, `fees`, `mobile_no`, `gender`

**Example Request**:
```javascript
const updateData = {
  district: 'Ahmedabad',
  address: '123 New Street, Gujarat',
  experience: 7,
  fees: 3000,
  mobile_no: '+91-9876543210'
};

const response = await fetch(`/api/agentdashboard/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
});

const result = await response.json();
```

## Frontend Integration Steps

### 1. Login Flow

When a guide logs in, the API returns:
```json
{
  "token": "JWT_TOKEN_HERE",
  "user": {
    "_id": "USER_ID_HERE",
    "fullName": "Guide Name",
    "role": "guide"
  },
  "redirectUrl": "agentdashboard.html"
}
```

Store the token and user ID for subsequent API calls.

### 2. Dashboard Page Loading

**Option A: Use `/me` endpoint (Recommended)**
```javascript
async function loadDashboard() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/agentdashboard/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      displayProfile(result.data);
    } else {
      console.error('Failed to load profile:', result.message);
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}
```

**Option B: Use user ID from login**
```javascript
async function loadDashboard() {
  try {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId'); // from login response
    
    const response = await fetch(`/api/agentdashboard/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      displayProfile(result.data);
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}
```

### 3. Update Profile

```javascript
async function updateProfile(formData) {
  try {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    const response = await fetch(`/api/agentdashboard/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Profile updated successfully');
      displayProfile(result.data);
    } else {
      console.error('Update failed:', result.message);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
  }
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development mode only)"
}
```

Common error status codes:
- `400`: Bad request (invalid data)
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (not a guide user)
- `404`: Not found (user/profile not found)
- `500`: Server error

## Authentication Flow

1. **Login**: `POST /api/auth/login`
2. **Store Token**: Save JWT token and user ID
3. **Dashboard**: Use token for all subsequent API calls
4. **Token Expiry**: Handle 401 errors and redirect to login

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Agent Dashboard</title>
</head>
<body>
    <div id="profile-form">
        <input id="name" placeholder="Name">
        <input id="district" placeholder="District">
        <input id="address" placeholder="Address">
        <input id="experience" type="number" placeholder="Experience">
        <input id="fees" type="number" placeholder="Fees">
        <input id="mobile_no" placeholder="Mobile Number">
        <button onclick="saveProfile()">Save</button>
    </div>

    <script>
        // Load profile on page load
        window.onload = async function() {
            await loadProfile();
        }

        async function loadProfile() {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('/api/agentdashboard/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    populateForm(result.data);
                } else {
                    alert('Failed to load profile: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error loading profile');
            }
        }

        function populateForm(data) {
            document.getElementById('name').value = data.name || '';
            document.getElementById('district').value = data.district || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('experience').value = data.experience || '';
            document.getElementById('fees').value = data.fees || '';
            document.getElementById('mobile_no').value = data.mobile_no || '';
        }

        async function saveProfile() {
            const formData = {
                name: document.getElementById('name').value,
                district: document.getElementById('district').value,
                address: document.getElementById('address').value,
                experience: parseInt(document.getElementById('experience').value),
                fees: parseInt(document.getElementById('fees').value),
                mobile_no: document.getElementById('mobile_no').value
            };

            try {
                const token = localStorage.getItem('authToken');
                const userId = localStorage.getItem('userId');
                
                const response = await fetch(`/api/agentdashboard/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('Profile updated successfully!');
                } else {
                    alert('Update failed: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error updating profile');
            }
        }
    </script>
</body>
</html>
```

## Recommendation

Use the `/api/agentdashboard/me` endpoint for loading the dashboard as it's simpler and doesn't require storing the user ID separately. The JWT token contains all necessary information.

## Troubleshooting

1. **Profile data not loading**: Check browser console for errors, verify token is valid
2. **403 Forbidden**: User role must be 'guide' 
3. **401 Unauthorized**: Token expired or invalid, redirect to login
4. **Default profile created**: First-time users get a default profile that can be updated

The API includes detailed console logging to help debug any issues during development.
