// const mongoose = require('mongoose');

// const placeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   intro: { type: String },
//   details: { type: String },
  
//   // Updated to match actual database structure
//   location: {
//     district: { type: String },
//     pincode: { type: Number }
//   },
  
//   // Updated to handle MongoDB binary data
//   image: mongoose.Schema.Types.Mixed, // This allows for flexible image storage
  
//   category: { type: String },
//   'visitor type': { type: String },
//   'best season': { type: String },
//   price: { type: String },
//   rating: { type: Number },
//   famous: { type: String },
  
//   // Keep these for filtering (you might need to map from other fields)
//   type: { type: String },
//   ageGroup: { type: String },
//   season: { type: String }
// }, { timestamps: true });

// module.exports = mongoose.model('Place', placeSchema);


const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  intro: { type: String },
  details: { type: String },

  location: {
    district: { type: String },
    pincode: { type: Number }
  },

  image: mongoose.Schema.Types.Mixed,

  category: { type: String },

  // ✅ Fixed: Arrays with underscore names matching actual DB fields
  visitor_type: [{ type: String }],  // e.g. ["Kids (0-12)", "Teens (13-17)"]
  best_season: [{ type: String }],   // e.g. ["Winter"]

  price: { type: String },
  rating: { type: Number },
  famous: { type: String },

}, { strict: false, timestamps: true });
// strict: false allows MongoDB to return fields even if not defined in schema

module.exports = mongoose.model('Place', placeSchema);