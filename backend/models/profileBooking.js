const mongoose = require("mongoose");

const profileBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tourName: { type: String, required: true },
  status: { type: String, enum: ["Upcoming", "Completed", "Cancelled"], default: "Upcoming" },
  bookingId: { type: String, required: true },
  date: { type: String, required: true },  // can change to Date type if needed
  travelers: { type: String, required: true },
  totalAmount: { type: String, required: true },

  hotel: {
    name: String,
    checkIn: String,
    checkOut: String,
    room: String,
  },

  agent: {
    name: String,
    contact: String,
    email: String,
  }
}, { timestamps: true });

// Prevent model overwrite error
module.exports = mongoose.models.ProfileBooking || mongoose.model("ProfileBooking", profileBookingSchema);
