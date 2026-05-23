# Tour Booking System Implementation Guide

## Overview
This guide explains the comprehensive tour booking system that has been implemented in your project. The system allows users to submit booking forms, see bookings in their profile, and enables agents and hotel managers to confirm bookings before payment processing.

## System Architecture

### Booking Workflow
1. **User submits booking form** → Booking created with `pending` status
2. **Agent reviews and confirms** → Status changes to `agent_confirmed`
3. **Hotel manager reviews and confirms** → Status changes to `confirmed`
4. **User makes payment** → Status changes to `payment_complete`
5. **Booking appears as "Upcoming" in user profile**

## Database Models

### 1. Enhanced BookingFormsData Model
**File:** `backend/models/bookingformsdataModel.js`

**New Fields Added:**
```javascript
{
  userId: ObjectId,           // Link to user who made booking
  bookingId: String,          // Auto-generated unique booking ID (BK123456789)
  status: String,             // pending, agent_confirmed, hotel_confirmed, confirmed, payment_complete, cancelled
  agentConfirmed: Boolean,    // Whether agent has confirmed
  hotelConfirmed: Boolean,    // Whether hotel has confirmed
  payment: {
    totalAmount: Number,      // Calculated total cost
    status: String,           // pending, processing, completed, failed
    paymentMethod: String,    // Payment method used
    transactionId: String,    // Transaction ID from payment gateway
    paidAt: Date             // When payment was completed
  },
  tourName: String,           // Name of the tour package
  tourDuration: String,       // Duration of tour
  specialRequests: String     // Any special requests/notes
}
```

## API Endpoints

### User Booking Management

#### 1. Create Booking
**POST** `/api/bookingformsdata/`
```javascript
// Headers: Authorization: Bearer <token>
// Body:
{
  "user": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "address": "123 Main St"
  },
  "tourist": {
    "totalTravellers": 4,
    "name": "John Doe",
    "dob": "1990-01-01",
    "gender": "Male",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St"
  },
  "touristPlaces": ["Statue of Unity", "Somnath Temple"],
  "hotel": {
    "name": "Grand Hotel",
    "fromDate": "2024-12-01",
    "toDate": "2024-12-05",
    "address": "Hotel Address"
  },
  "agent": {
    "name": "Agent Smith",
    "experience": "5 years",
    "location": "Ahmedabad",
    "languages": "English, Hindi"
  },
  "tourName": "Gujarat Heritage Tour",
  "tourDuration": "4 days 3 nights"
}
```

#### 2. Get User's Bookings
**GET** `/api/bookingformsdata/user/my-bookings`
- Headers: `Authorization: Bearer <token>`
- Returns all bookings for the authenticated user

#### 3. Get User Profile with Bookings
**GET** `/api/profile/`
- Headers: `Authorization: Bearer <token>`
- Returns user profile with detailed booking information

### Agent Dashboard

#### 1. Get Pending Booking Requests
**GET** `/api/agentdashboard/bookings/requests`
- Headers: `Authorization: Bearer <token>`
- Returns bookings assigned to the agent that need confirmation

#### 2. Accept/Reject Booking Request
**POST** `/api/agentdashboard/bookings/{bookingId}/handle`
```javascript
// Headers: Authorization: Bearer <token>
// Body:
{
  "action": "accept",  // or "reject"
  "notes": "Looking forward to guiding you!"  // Optional
}
```

#### 3. Get Agent's Booking History
**GET** `/api/agentdashboard/bookings/history`
- Headers: `Authorization: Bearer <token>`
- Returns all bookings confirmed by this agent

### Payment Processing

#### 1. Get Payment Details
**GET** `/api/payment/{bookingId}/details`
- Headers: `Authorization: Bearer <token>`
- Returns payment information and status

#### 2. Process Payment
**POST** `/api/payment/{bookingId}/process`
```javascript
// Headers: Authorization: Bearer <token>
// Body:
{
  "paymentMethod": "UPI",  // or "Credit Card", "Debit Card"
  "upiId": "john@paytm"    // if UPI selected
}
```

#### 3. Get Payment History
**GET** `/api/payment/history`
- Headers: `Authorization: Bearer <token>`
- Returns user's payment history

## Frontend Integration

### 1. Booking Form Submission
```javascript
const submitBooking = async (bookingData) => {
  try {
    const response = await fetch('/api/bookingformsdata/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Booking submitted successfully!');
      // Redirect to profile page
    }
  } catch (error) {
    console.error('Booking submission failed:', error);
  }
};
```

### 2. Profile Page - Display Bookings
```javascript
const loadUserProfile = async () => {
  try {
    const response = await fetch('/api/profile/', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const profileData = await response.json();
    
    // Display user info
    document.getElementById('userName').textContent = profileData.name;
    document.getElementById('userEmail').textContent = profileData.email;
    
    // Display bookings
    const bookingsContainer = document.getElementById('bookings');
    profileData.tours.forEach(booking => {
      const bookingCard = createBookingCard(booking);
      bookingsContainer.appendChild(bookingCard);
    });
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};

const createBookingCard = (booking) => {
  return `
    <div class="booking-card">
      <h3>${booking.tourName}</h3>
      <p>Booking ID: ${booking.bookingId}</p>
      <p>Status: ${booking.status}</p>
      <p>Amount: ₹${booking.totalAmount}</p>
      <p>Travelers: ${booking.travelers}</p>
      <p>Places: ${booking.touristPlaces.join(', ')}</p>
      
      <!-- Progress Indicators -->
      <div class="progress-indicators">
        <span class="${booking.progress.submitted ? 'completed' : ''}">✓ Submitted</span>
        <span class="${booking.progress.agentConfirmed ? 'completed' : ''}">✓ Agent Confirmed</span>
        <span class="${booking.progress.hotelConfirmed ? 'completed' : ''}">✓ Hotel Confirmed</span>
        <span class="${booking.progress.paymentCompleted ? 'completed' : ''}">✓ Payment Complete</span>
      </div>
      
      <!-- Action Buttons -->
      ${booking.actions.includes('pay') ? `<button onclick="processPayment('${booking.bookingId}')">Pay Now</button>` : ''}
      ${booking.actions.includes('cancel') ? `<button onclick="cancelBooking('${booking.bookingId}')">Cancel</button>` : ''}
    </div>
  `;
};
```

### 3. Agent Dashboard - Booking Requests
```javascript
const loadBookingRequests = async () => {
  try {
    const response = await fetch('/api/agentdashboard/bookings/requests', {
      headers: {
        'Authorization': `Bearer ${agentToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const requestsContainer = document.getElementById('booking-requests');
      data.requests.forEach(request => {
        const requestCard = createRequestCard(request);
        requestsContainer.appendChild(requestCard);
      });
    }
  } catch (error) {
    console.error('Failed to load booking requests:', error);
  }
};

const handleBookingRequest = async (bookingId, action) => {
  const notes = document.getElementById(`notes-${bookingId}`).value;
  
  try {
    const response = await fetch(`/api/agentdashboard/bookings/${bookingId}/handle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${agentToken}`
      },
      body: JSON.stringify({ action, notes })
    });
    
    const result = await response.json();
    if (result.success) {
      alert(`Booking ${action}ed successfully!`);
      loadBookingRequests(); // Refresh the list
    }
  } catch (error) {
    console.error('Failed to handle booking request:', error);
  }
};
```

### 4. Payment Processing
```javascript
const processPayment = async (bookingId) => {
  const paymentMethod = document.getElementById('paymentMethod').value;
  const paymentData = { paymentMethod };
  
  if (paymentMethod === 'UPI') {
    paymentData.upiId = document.getElementById('upiId').value;
  }
  
  try {
    const response = await fetch(`/api/payment/${bookingId}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    if (result.success) {
      alert(`Payment successful! Transaction ID: ${result.transactionId}`);
      // Redirect to booking confirmation page
    } else {
      alert(`Payment failed: ${result.message}`);
    }
  } catch (error) {
    console.error('Payment processing failed:', error);
  }
};
```

## Status Tracking

### Booking Status Values:
- **`pending`**: Just submitted, waiting for confirmations
- **`agent_confirmed`**: Agent confirmed, waiting for hotel
- **`hotel_confirmed`**: Hotel confirmed, waiting for agent
- **`confirmed`**: Both confirmed, ready for payment
- **`payment_complete`**: Payment successful, booking active
- **`cancelled`**: Booking cancelled by agent, hotel, or user

### Profile Display Status:
- **`Pending Confirmation`**: Still waiting for agent/hotel confirmation
- **`Agent Confirmed - Awaiting Hotel`**: Agent said yes, hotel pending
- **`Hotel Confirmed - Awaiting Agent`**: Hotel said yes, agent pending
- **`Confirmed - Payment Pending`**: Both confirmed, user can pay
- **`Upcoming`**: Payment complete, tour is upcoming
- **`Cancelled`**: Booking was cancelled

## Testing the System

### 1. Test User Booking Flow:
1. Create a booking via POST `/api/bookingformsdata/`
2. Check profile via GET `/api/profile/` - should show pending booking
3. Agent confirms via POST `/api/agentdashboard/bookings/{bookingId}/handle`
4. Check profile - status should update
5. Process payment via POST `/api/payment/{bookingId}/process`
6. Check profile - should show as "Upcoming"

### 2. Test Agent Dashboard:
1. Login as agent/guide user
2. Get pending requests via GET `/api/agentdashboard/bookings/requests`
3. Accept/reject requests via POST `/api/agentdashboard/bookings/{bookingId}/handle`
4. View history via GET `/api/agentdashboard/bookings/history`

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT tokens
2. **Role-based Access**: Agents can only see their assigned bookings
3. **User Isolation**: Users can only see their own bookings
4. **Payment Security**: Sensitive payment data should be handled securely

## Next Steps

1. **Frontend Implementation**: Create React/HTML components using the provided JavaScript examples
2. **Payment Gateway Integration**: Replace simulated payment with real gateway (Razorpay, Stripe)
3. **Email Notifications**: Add email notifications for booking status changes
4. **Hotel Manager Dashboard**: Create similar dashboard for hotel managers
5. **Mobile Responsiveness**: Ensure all pages work well on mobile devices

This system provides a complete booking workflow from submission to payment, with proper status tracking and role-based access control.
