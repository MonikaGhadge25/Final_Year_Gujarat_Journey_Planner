const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name:        { type: String, required: true },   // e.g. "Rann of Kutch Festival Tour"
  description: { type: String, default: '' },
  category:    { type: String, default: 'General' },
  image:       { type: String, default: '' },       // image URL or base64

  place: {
    name:     { type: String },
    district: { type: String },
    pincode:  { type: Number },
    category: { type: String },
    price:    { type: String },    // display string e.g. "₹500–₹2000"
    rating:   { type: Number }
  },

  hotel: {
    name:      { type: String },
    hotel_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', default: null }
  },

  agent: {
    name:      { type: String },
    fees:      { type: String },
    rating:    { type: Number },
    agent_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.models.Package || mongoose.model('Package', packageSchema);