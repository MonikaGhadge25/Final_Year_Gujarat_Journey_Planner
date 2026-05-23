const mongoose = require('mongoose');

const bookingPlaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  intro: { type: String },
  image: { type: Buffer },
  imageType: { type: String },
  destinationType: { type: String },
  ageGroup: { type: String },
  season: { type: String },
  location: {
    district: { type: String, required: true }
  }
}, { timestamps: true });

bookingPlaceSchema.virtual('imageUrl').get(function () {
  if (this.image && this.imageType) {
    return `data:${this.imageType};base64,${this.image.toString('base64')}`;
  }
  return null;
});

bookingPlaceSchema.set('toJSON', { virtuals: true });

// ✅ Fix
module.exports = mongoose.models.Place || mongoose.model('Place', bookingPlaceSchema);
