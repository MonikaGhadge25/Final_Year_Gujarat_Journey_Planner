const mongoose = require('mongoose');

// Driver sub-schema
const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  bookedDates: [{
    from: { type: String },
    to: { type: String }
  }]
});

const transportSchema = new mongoose.Schema({
  carName: { type: String, required: true },
  seating_capacity: { type: Number, required: true },
  car_type: { type: String, required: true, enum: ['sedan', 'suv', 'hatchback', 'van', 'ecco', 'tempo'] },
  fuel: { type: String, required: true, enum: ['Petrol', 'Diesel', 'CNG'] },
  ac: { type: Boolean, required: true },
  price: { type: String, required: true }, // e.g., "₹12/km"
  location: { type: String, required: true },
  drivers: [driverSchema]
}, { timestamps: true });

// Virtual field to calculate car type from seating_capacity and car_type
transportSchema.virtual('type').get(function() {
  if (this.seating_capacity <= 7) {
    return `${this.seating_capacity}-Seater`;
  } else {
    // For seating > 7, use car_type field
    switch(this.car_type.toLowerCase()) {
      case 'van': return 'Van';
      case 'ecco': return 'Ecco';
      case 'tempo': return 'Tempo';
      default: return `${this.seating_capacity}-Seater`;
    }
  }
});

// Ensure virtual fields are included when converting to JSON
transportSchema.set('toJSON', { virtuals: true });
transportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Transport', transportSchema);
