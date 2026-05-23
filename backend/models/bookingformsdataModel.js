const mongoose = require("mongoose");

const bookingformsdataSchema = new mongoose.Schema({
  // Link to the user who made the booking
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookingId: { type: String, unique: true }, // Auto-generated booking ID (not required as it's generated automatically)
  
  user: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  tourist: {
    totalTravellers: { type: Number, required: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  touristPlaces: [{ type: String, required: true }],
  hotel: {
    name: { type: String },
    fromDate: { type: Date },
    toDate: { type: Date },
    address: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Hotel manager reference
  },
  agent: {
    name: { type: String },
    experience: { type: String },
    location: { type: String },
    languages: { type: String },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Selected agent reference
  },
  
  // Transport details (assigned by transport manager)
  transport: {
    vehicleType: { type: String }, // e.g., "4-Seater", "7-Seater", "Van", etc.
    vehicleName: { type: String }, // e.g., "Toyota Etios"
    vehicleNumber: { type: String }, // e.g., "GJ01AB1234"
    driverName: { type: String },
    driverPhone: { type: String },
    driverEmail: { type: String },
    pricePerKm: { type: String }, // e.g., "₹12/km"
    features: { type: String }, // e.g., "AC, GPS"
    pickupLocation: { type: String },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Transport manager reference
    assignedAt: { type: Date },
    confirmationStatus: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" }
  },
  
  // Booking status tracking
  status: {
    type: String,
    enum: ["pending", "agent_confirmed", "hotel_confirmed", "transport_confirmed", "confirmed", "payment_complete", "cancelled"],
    default: "pending"
  },
  
  // Confirmation tracking
  agentConfirmed: { type: Boolean, default: false },
  agentConfirmedAt: { type: Date },
  hotelConfirmed: { type: Boolean, default: false },
  hotelConfirmedAt: { type: Date },
  transportConfirmed: { type: Boolean, default: false },
  transportConfirmedAt: { type: Date },
  
  // Payment information
  payment: {
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "pending" },
    paymentMethod: { type: String },
    transactionId: { type: String },
    paidAt: { type: Date }
  },
  
  // Additional booking details
  tourName: { type: String, required: true }, // Name of the tour package
  tourDuration: { type: String }, // Duration of the tour
  specialRequests: { type: String }, // Any special requests from user
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to generate booking ID and update timestamp
bookingformsdataSchema.pre('save', function(next) {
  // Generate booking ID if it doesn't exist
  if (!this.bookingId) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingId = `BK${timestamp.slice(-6)}${random}`;
  }
  
  // Update timestamp
  this.updatedAt = new Date();
  next();
});

// Prevent model overwrite error
module.exports = mongoose.models.BookingFormsData || mongoose.model("BookingFormsData", bookingformsdataSchema);
