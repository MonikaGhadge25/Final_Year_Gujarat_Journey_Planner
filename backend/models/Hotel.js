// const mongoose = require('mongoose');

// const hotelSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   category: String,
//   location: {
//     district: String,
//     state: String,
//   },
//   price: [String],
//   rating: Number,
//   amenities: [String],
//   description: String,

//   // 🖼️ Image as buffer
//   image: {
//     type: Buffer, // This supports base64 conversion
//   },

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model('Hotel', hotelSchema);


const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema(
  {
    // Hotel manager relationship - CRITICAL for linking hotels to users
    manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // For faster lookups
    },
    
    // Manager email for backup lookup (in case of data inconsistencies)
    manager_email: {
      type: String,
      required: true,
      index: true
    },
    
    hotel_details: {
      hotel_name: { type: String, required: true },
      description: { type: String },
      location: {
        district: { type: String, required: true },
        pincode: { type: Number },
      },
      contact: { type: String },
      email: { type: String },
      check_in_time: { type: String },
      check_out_time: { type: String },
      rating: { type: Number },
      amenities: [String],
      username: { type: String },
      password: { type: String },
    },

    room_types: [
      {
        type: { type: String, required: true },
        price_per_night: { type: String, required: true },
        features: [String],
      },
    ],

    // Base64 image storage
    image: {
      base64: { type: String },
    },

    // Gallery images
    gallery: [
      {
        id: { type: String, required: true },
        base64: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }  
);

// Prevent model overwrite error
module.exports = mongoose.models.Hotel || mongoose.model("Hotel", hotelSchema);
