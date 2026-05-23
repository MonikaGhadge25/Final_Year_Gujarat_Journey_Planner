# Authentication Setup for Tour Booking System

## Overview
This guide shows you how to implement proper authentication in your frontend to work with the booking system.

## Step 1: Login Implementation

### Frontend Login Form
Create a login form that collects email and password, then calls the login API:

```javascript
// Login function
async function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      // Store the token securely
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      alert('Login successful!');
      
      // Redirect based on user role
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.href = 'profile.html'; // Default to profile
      }
    } else {
      alert('Login failed: ' + data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
}

// Check if user is already logged in
function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const userInfo = localStorage.getItem('userInfo');
  
  if (token && userInfo) {
    // User is logged in
    return {
      token: token,
      user: JSON.parse(userInfo)
    };
  }
  return null;
}

// Logout function
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
  alert('Logged out successfully!');
  window.location.href = 'login.html';
}
```

## Step 2: Registration Implementation

```javascript
// Registration function
async function registerUser() {
  const formData = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    dob: document.getElementById('dob').value,
    gender: document.getElementById('gender').value,
    role: 'client' // Default role
  };
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert('Registration successful! Please login.');
      window.location.href = 'login.html';
    } else {
      alert('Registration failed: ' + data.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
}
```

## Step 3: Protected Booking Submission

Update your booking form to include authentication:

```javascript
// Updated booking submission with authentication
async function submitBooking() {
  // Check if user is logged in
  const auth = checkAuthStatus();
  if (!auth) {
    alert('Please login first to make a booking.');
    window.location.href = 'login.html';
    return;
  }
  
  // Collect form data
  const bookingData = {
    user: {
      fullName: document.getElementById('userFullName').value,
      phone: document.getElementById('userPhone').value,
      address: document.getElementById('userAddress').value
    },
    tourist: {
      totalTravellers: parseInt(document.getElementById('totalTravellers').value),
      name: document.getElementById('touristName').value,
      dob: document.getElementById('touristDob').value,
      gender: document.getElementById('touristGender').value,
      phone: document.getElementById('touristPhone').value,
      email: document.getElementById('touristEmail').value,
      address: document.getElementById('touristAddress').value
    },
    touristPlaces: getSelectedPlaces(), // Your function to get selected places
    hotel: {
      name: document.getElementById('hotelName').value,
      fromDate: document.getElementById('checkIn').value,
      toDate: document.getElementById('checkOut').value,
      address: document.getElementById('hotelAddress').value
    },
    agent: {
      name: document.getElementById('agentName').value,
      experience: document.getElementById('agentExperience').value,
      location: document.getElementById('agentLocation').value,
      languages: document.getElementById('agentLanguages').value
    },
    tourName: document.getElementById('tourName').value,
    tourDuration: document.getElementById('tourDuration').value
  };
  
  try {
    const response = await fetch('/api/bookingformsdata/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}` // Include authentication token
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`Booking submitted successfully! Booking ID: ${result.booking.bookingId}`);
      
      // Redirect to profile to see the booking
      window.location.href = 'profile.html';
    } else {
      alert('Booking failed: ' + result.message);
    }
  } catch (error) {
    console.error('Booking submission error:', error);
    alert('Booking submission failed. Please try again.');
  }
}
```

## Step 4: Protected Profile Page

Update your profile page to use authentication:

```javascript
// Protected profile page
async function loadUserProfile() {
  // Check authentication
  const auth = checkAuthStatus();
  if (!auth) {
    alert('Please login to view your profile.');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await fetch('/api/profile/', {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      alert('Session expired. Please login again.');
      window.location.href = 'login.html';
      return;
    }
    
    const profileData = await response.json();
    
    if (response.ok) {
      // Display user information
      document.getElementById('userName').textContent = profileData.name;
      document.getElementById('userEmail').textContent = profileData.email;
      document.getElementById('userPhone').textContent = profileData.phone;
      document.getElementById('userAge').textContent = profileData.age;
      
      // Display booking statistics
      if (profileData.stats) {
        document.getElementById('totalBookings').textContent = profileData.stats.totalBookings;
        document.getElementById('upcomingBookings').textContent = profileData.stats.upcoming;
        document.getElementById('completedBookings').textContent = profileData.stats.completed;
      }
      
      // Display bookings
      const bookingsContainer = document.getElementById('bookingsContainer');
      
      if (profileData.tours && profileData.tours.length > 0) {
        bookingsContainer.innerHTML = ''; // Clear "No bookings found"
        
        profileData.tours.forEach(booking => {
          const bookingCard = createBookingCard(booking);
          bookingsContainer.appendChild(bookingCard);
        });
      } else {
        bookingsContainer.innerHTML = '<p>No bookings found.</p>';
      }
      
    } else {
      console.error('Failed to load profile:', profileData.message);
      alert('Failed to load profile: ' + profileData.message);
    }
    
  } catch (error) {
    console.error('Error loading profile:', error);
    alert('Failed to load profile. Please try again.');
  }
}

// Create booking card element
function createBookingCard(booking) {
  const card = document.createElement('div');
  card.className = 'booking-card';
  
  card.innerHTML = `
    <div class="booking-header">
      <h3>${booking.tourName}</h3>
      <span class="booking-id">ID: ${booking.bookingId}</span>
    </div>
    
    <div class="booking-details">
      <div class="detail-row">
        <strong>Status:</strong> <span class="status status-${booking.status.toLowerCase().replace(' ', '-')}">${booking.status}</span>
      </div>
      <div class="detail-row">
        <strong>Places:</strong> ${booking.touristPlaces.join(', ')}
      </div>
      <div class="detail-row">
        <strong>Travelers:</strong> ${booking.travelers}
      </div>
      <div class="detail-row">
        <strong>Amount:</strong> ₹${booking.totalAmount}
      </div>
      <div class="detail-row">
        <strong>Check-in:</strong> ${new Date(booking.checkIn).toDateString()}
      </div>
      <div class="detail-row">
        <strong>Check-out:</strong> ${new Date(booking.checkOut).toDateString()}
      </div>
      <div class="detail-row">
        <strong>Hotel:</strong> ${booking.hotel.name || 'TBD'}
      </div>
      <div class="detail-row">
        <strong>Agent:</strong> ${booking.agent.name || 'TBD'}
      </div>
    </div>
    
    <div class="booking-progress">
      <h4>Booking Progress:</h4>
      <div class="progress-steps">
        <div class="step ${booking.progress.submitted ? 'completed' : ''}">
          <span class="step-icon">${booking.progress.submitted ? '✓' : '○'}</span>
          <span class="step-text">Submitted</span>
        </div>
        <div class="step ${booking.progress.agentConfirmed ? 'completed' : ''}">
          <span class="step-icon">${booking.progress.agentConfirmed ? '✓' : '○'}</span>
          <span class="step-text">Agent Confirmed</span>
        </div>
        <div class="step ${booking.progress.hotelConfirmed ? 'completed' : ''}">
          <span class="step-icon">${booking.progress.hotelConfirmed ? '✓' : '○'}</span>
          <span class="step-text">Hotel Confirmed</span>
        </div>
        <div class="step ${booking.progress.paymentCompleted ? 'completed' : ''}">
          <span class="step-icon">${booking.progress.paymentCompleted ? '✓' : '○'}</span>
          <span class="step-text">Payment Complete</span>
        </div>
      </div>
    </div>
    
    <div class="booking-actions">
      ${booking.actions.includes('pay') ? `<button class="btn btn-pay" onclick="processPayment('${booking.bookingId}')">Pay Now (₹${booking.totalAmount})</button>` : ''}
      ${booking.actions.includes('cancel') ? `<button class="btn btn-cancel" onclick="cancelBooking('${booking.bookingId}')">Cancel Booking</button>` : ''}
      ${booking.actions.includes('view_details') ? `<button class="btn btn-details" onclick="viewTripDetails('${booking.bookingId}')">View Details</button>` : ''}
    </div>
    
    ${booking.specialRequests ? `<div class="special-requests"><strong>Notes:</strong> ${booking.specialRequests}</div>` : ''}
  `;
  
  return card;
}

// Payment processing function
async function processPayment(bookingId) {
  const auth = checkAuthStatus();
  if (!auth) {
    alert('Please login to make payment.');
    return;
  }
  
  // Show payment method selection
  const paymentMethod = prompt('Select payment method:\n1. UPI\n2. Credit Card\n3. Debit Card\n\nEnter 1, 2, or 3:');
  const methods = {'1': 'UPI', '2': 'Credit Card', '3': 'Debit Card'};
  const selectedMethod = methods[paymentMethod];
  
  if (!selectedMethod) {
    alert('Invalid payment method selected.');
    return;
  }
  
  const paymentData = { paymentMethod: selectedMethod };
  
  if (selectedMethod === 'UPI') {
    paymentData.upiId = prompt('Enter UPI ID:');
    if (!paymentData.upiId) return;
  }
  
  try {
    const response = await fetch(`/api/payment/${bookingId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(`Payment successful! Transaction ID: ${result.transactionId}`);
      loadUserProfile(); // Refresh the profile
    } else {
      alert('Payment failed: ' + result.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  }
}

// Cancel booking function
async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) {
    return;
  }
  
  const auth = checkAuthStatus();
  if (!auth) {
    alert('Please login to cancel booking.');
    return;
  }
  
  // You can implement booking cancellation endpoint if needed
  alert('Booking cancellation feature will be implemented soon.');
}

// Load profile when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadUserProfile();
});
```

## Step 2: HTML Structure for Profile Page

Add this HTML structure to your profile page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile - Tour Bookings</title>
    <style>
        .booking-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin: 10px 0;
            background: #f9f9f9;
        }
        
        .booking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .booking-id {
            font-size: 0.9em;
            color: #666;
            background: #e0e0e0;
            padding: 5px 10px;
            border-radius: 5px;
        }
        
        .detail-row {
            margin: 8px 0;
        }
        
        .progress-steps {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
        }
        
        .step {
            text-align: center;
            flex: 1;
        }
        
        .step.completed {
            color: green;
            font-weight: bold;
        }
        
        .step-icon {
            display: block;
            font-size: 1.2em;
            margin-bottom: 5px;
        }
        
        .booking-actions {
            margin-top: 15px;
        }
        
        .btn {
            padding: 10px 20px;
            margin: 5px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .btn-pay {
            background: #28a745;
            color: white;
        }
        
        .btn-cancel {
            background: #dc3545;
            color: white;
        }
        
        .btn-details {
            background: #007bff;
            color: white;
        }
        
        .status {
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 0.9em;
        }
        
        .status-pending {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-confirmed {
            background: #d4edda;
            color: #155724;
        }
        
        .status-cancelled {
            background: #f8d7da;
            color: #721c24;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>User Profile</h1>
        
        <div class="user-info">
            <h2>Profile Details</h2>
            <p><strong>Name:</strong> <span id="userName">Loading...</span></p>
            <p><strong>Email:</strong> <span id="userEmail">Loading...</span></p>
            <p><strong>Phone:</strong> <span id="userPhone">Loading...</span></p>
            <p><strong>Age:</strong> <span id="userAge">Loading...</span></p>
        </div>
        
        <div class="booking-stats">
            <h3>Booking Statistics</h3>
            <p>Total Bookings: <span id="totalBookings">0</span></p>
            <p>Upcoming: <span id="upcomingBookings">0</span></p>
            <p>Completed: <span id="completedBookings">0</span></p>
        </div>
        
        <div class="tour-bookings">
            <h2>Tour Booking History</h2>
            <div id="bookingsContainer">
                <p>Loading bookings...</p>
            </div>
        </div>
        
        <div class="actions">
            <button onclick="logout()" class="btn btn-cancel">Logout</button>
        </div>
    </div>
    
    <!-- Include the JavaScript code from above -->
    <script>
        // Add all the JavaScript functions from Step 1 here
    </script>
</body>
</html>
```

## Step 3: Testing the Authentication Flow

1. **Create a user account first:**
```javascript
// Test user registration
const testUser = {
  fullName: "Patel Nishit Sunilbhai",
  email: "patelnishit257@gmail.com",
  password: "password123",
  dob: "2000-01-01",
  gender: "Male",
  role: "client"
};

fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testUser)
});
```

2. **Login to get token:**
```javascript
// Test login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "patelnishit257@gmail.com",
    password: "password123"
  })
});
```

3. **Use token for protected endpoints:**
```javascript
// After login, use the token for all requests
const token = localStorage.getItem('authToken');

// Create booking
fetch('/api/bookingformsdata/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(bookingData)
});

// View profile
fetch('/api/profile/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Step 4: Update Your Current Frontend

Since you already have a booking that was created, you need to:

1. **Register the user account** with email `patelnishit257@gmail.com`
2. **Login** to get the token
3. **Update your profile page** to use the authenticated endpoint

## Quick Test Commands

To test this right now, you can use these API calls:

```bash
# 1. Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Patel Nishit Sunilbhai","email":"patelnishit257@gmail.com","password":"password123","dob":"2000-01-01","gender":"Male"}'

# 2. Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patelnishit257@gmail.com","password":"password123"}'

# 3. Use token to view profile (replace YOUR_TOKEN_HERE with actual token)
curl -X GET http://localhost:5000/api/profile/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Would you like me to help you implement this authentication flow in your existing frontend pages?
