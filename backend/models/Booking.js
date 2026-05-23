const mongoose = require('mongoose');

const bookingFormSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: Date, required: true },
  guests: { type: Number, required: true },
  message: { type: String }
});

const BookingForm = mongoose.model("BookingForm", bookingFormSchema);
module.exports = BookingForm;
