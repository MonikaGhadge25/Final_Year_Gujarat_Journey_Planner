# Gujarat Travel Backend API

A comprehensive Node.js backend API for the Gujarat Travel application with authentication, role-based access control, and full CRUD operations.

## 🚀 Features

- **JWT Authentication** with role-based access control
- **MongoDB Integration** with Mongoose ODM
- **Input Validation** using express-validator
- **Error Handling** with comprehensive error middleware
- **Security Features** including Helmet, CORS, and rate limiting
- **Pagination & Filtering** for all list endpoints
- **Search Functionality** across multiple fields

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/gujarat_travel
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=2h
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "client"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Hotel Endpoints

#### Get All Hotels (with filtering & pagination)
```http
GET /api/hotels?category=luxury&minPrice=1000&maxPrice=5000&location=Ahmedabad&page=1&limit=10&sortBy=price&order=desc
```

#### Get Hotel by ID
```http
GET /api/hotels/:id
```

#### Search Hotels
```http
GET /api/hotels/search?q=Ahmedabad
```

#### Add Hotel (Protected - Hotel/Admin role)
```http
POST /api/hotels/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Taj Hotel",
  "location": "Ahmedabad",
  "category": "luxury",
  "price": 5000,
  "rating": 4.5,
  "imageUrl": "https://example.com/image.jpg",
  "details": "Luxury hotel in the heart of Ahmedabad"
}
```

#### Update Hotel (Protected - Hotel/Admin role)
```http
PUT /api/hotels/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "price": 5500,
  "rating": 4.8
}
```

#### Delete Hotel (Protected - Hotel/Admin role)
```http
DELETE /api/hotels/:id
Authorization: Bearer <jwt_token>
```

### Booking Endpoints

#### Create Booking
```http
POST /api/booking
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "serviceType": "hotel",
  "serviceId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "date": "2024-01-15T10:00:00.000Z"
}
```

#### Get User Bookings
```http
GET /api/booking/user/:userId
Authorization: Bearer <jwt_token>
```

### Transport Endpoints

#### Get All Transports
```http
GET /api/transport
```

#### Add Transport (Protected - Transport role)
```http
POST /api/transport/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Gujarat Express",
  "type": "bus",
  "route": "Ahmedabad to Surat",
  "price": 500
}
```

### Agent Endpoints

#### Get All Agents
```http
GET /api/agents
```

#### Add Agent (Protected - Agent role)
```http
POST /api/agents/add
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Travel Guide Pro",
  "specialization": "Heritage Tours",
  "experience": 5,
  "contact": "+91-9876543210"
}
```

## 🔐 Authentication & Authorization

### User Roles
- **client**: Can view services and make bookings
- **guide**: Can manage tour guides and services
- **hotel**: Can manage hotel listings
- **transport**: Can manage transport services
- **admin**: Full access to all features

### JWT Token Usage
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📊 Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "details": [ ... ]
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs are validated
- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Different permissions per role

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 2h |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set strong JWT secret
4. Configure CORS for production domain
5. Use PM2 or similar for process management

## 📞 Support

For support and questions, please contact the development team.

## 📄 License

This project is licensed under the MIT License. 