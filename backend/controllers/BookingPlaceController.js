// const Place = require('../models/BookingPlaceModel');

// exports.searchPlaces = async (req, res) => {
//   try {
//     const { location, destinationType, ageGroup, season, page = 1, limit = 8 } = req.query;

//     const filter = {};
//     if (location) filter['location.district'] = new RegExp(location, 'i');
//     if (destinationType) filter.destinationType = destinationType;
//     if (ageGroup) filter.ageGroup = ageGroup;
//     if (season) filter.season = season;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const total = await Place.countDocuments(filter);
//     const places = await Place.find(filter).skip(skip).limit(parseInt(limit)).lean();

//     places.forEach(place => {
//       if (place.image && place.imageType) {
//         place.imageUrl = `data:${place.imageType};base64,${place.image.toString('base64')}`;
//       } else {
//         place.imageUrl = null;
//       }
//     });

//     res.json({ places, totalPages: Math.ceil(total / limit) });
//   } catch (error) {
//     console.error('Error searching places:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// controllers/placeController.js
const Place = require('../models/BookingPlaceModel');

exports.searchPlaces = async (req, res) => {
  try {
    const { location, destinationType, ageGroup, season, page = 1, limit = 8 } = req.query;

    const filter = {};
    if (location) filter['location.district'] = new RegExp(location, 'i');
    if (destinationType) filter.destinationType = destinationType;
    if (ageGroup) filter.ageGroup = ageGroup;
    if (season) filter.season = season;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Place.countDocuments(filter);
    const places = await Place.find(filter).skip(skip).limit(parseInt(limit)).lean();

    places.forEach(place => {
      if (place.image && place.imageType) {
        place.imageUrl = `data:${place.imageType};base64,${place.image.toString('base64')}`;
      } else {
        place.imageUrl = null;
      }
    });

    res.json({ success: true, places, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
