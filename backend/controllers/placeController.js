// const Place = require('../models/place');

// // 🔍 Search Places with Filters and Image Decoding
// exports.searchPlaces = async (req, res) => {
//   try {
//     const { location, destinationType, ageGroup, season, page = 1, limit = 6 } = req.query;

//     const filter = {};
    
//     if (location) {
//       filter['location.district'] = new RegExp(location, 'i');
//     }
    
//     if (destinationType) {
//       filter.category = new RegExp(destinationType, 'i');
//     }
    
//     if (ageGroup) {
//       filter['visitor type'] = new RegExp(ageGroup, 'i');
//     }
    
//     if (season) {
//       filter['best season'] = new RegExp(season, 'i');
//     }

//     console.log('Search filter:', filter);

//     const places = await Place.find(filter)
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const totalCount = await Place.countDocuments(filter);
//     const totalPages = Math.ceil(totalCount / limit);

//     const placesWithImageUrls = places.map((place) => {
//       let imageUrl = null;

//       if (place.image) {
//         if (place.image.$binary && place.image.$binary.base64) {
//           imageUrl = `data:image/jpeg;base64,${place.image.$binary.base64}`;
//         } else if (place.image.data && Buffer.isBuffer(place.image.data)) {
//           const base64 = place.image.data.toString('base64');
//           const contentType = place.image.contentType || 'image/jpeg';
//           imageUrl = `data:${contentType};base64,${base64}`;
//         } else if (Buffer.isBuffer(place.image)) {
//           const base64 = place.image.toString('base64');
//           imageUrl = `data:image/jpeg;base64,${base64}`;
//         } else if (typeof place.image === 'object' && place.image.buffer) {
//           const base64 = place.image.buffer.toString('base64');
//           imageUrl = `data:image/jpeg;base64,${base64}`;
//         }
//       }

//       return {
//         _id: place._id,
//         name: place.name,
//         intro: place.intro,
//         details: place.details,
//         location: place.location,
//         category: place.category,
//         'visitor type': place['visitor type'],
//         'best season': place['best season'],
//         price: place.price,
//         rating: place.rating,
//         famous: place.famous,
//         imageUrl
//       };
//     });

//     res.json({ 
//       places: placesWithImageUrls, 
//       totalPages,
//       currentPage: parseInt(page),
//       totalCount
//     });
    
//   } catch (error) {
//     console.error('Search error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // 📍 Get Single Place by Name
// exports.getSinglePlaceByName = async (req, res) => {
//   try {
//     const name = decodeURIComponent(req.params.name);
//     const place = await Place.findOne({ name });

//     if (!place) {
//       return res.status(404).json({ message: 'Place not found' });
//     }

//     let imageUrl = null;

//     if (place.image) {
//       if (place.image.$binary && place.image.$binary.base64) {
//         imageUrl = `data:image/jpeg;base64,${place.image.$binary.base64}`;
//       } else if (place.image.data && Buffer.isBuffer(place.image.data)) {
//         const base64 = place.image.data.toString('base64');
//         const contentType = place.image.contentType || 'image/jpeg';
//         imageUrl = `data:${contentType};base64,${base64}`;
//       } else if (Buffer.isBuffer(place.image)) {
//         const base64 = place.image.toString('base64');
//         imageUrl = `data:image/jpeg;base64,${base64}`;
//       } else if (typeof place.image === 'object' && place.image.buffer) {
//         const base64 = place.image.buffer.toString('base64');
//         imageUrl = `data:image/jpeg;base64,${base64}`;
//       }
//     }

//     res.status(200).json({
//       _id: place._id,
//       name: place.name,
//       intro: place.intro,
//       details: place.details,
//       location: place.location,
//       category: place.category,
//       'visitor type': place['visitor type'],
//       'best season': place['best season'],
//       price: place.price,
//       rating: place.rating,
//       famous: place.famous,
//       imageUrl
//     });

//   } catch (err) {
//     console.error('Get single place error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // 🗺️ Get Nearby Places by District (FIXED VERSION)
// // exports.getNearbyPlaces = async (req, res) => {
// //   try {
// //     // Get district from query parameter (not params)
// //     const { district, exclude } = req.query;
    
// //     if (!district) {
// //       return res.status(400).json({ error: 'District parameter is required' });
// //     }

// //     // Build query - case insensitive district search
// //     let query = {
// //       'location.district': new RegExp(district, 'i')
// //     };
    
// //     // Exclude specific place if provided
// //     if (exclude) {
// //       query.name = { $ne: exclude };
// //     }

// //     const places = await Place.find(query).limit(8);

// //     const placesWithImages = places.map(place => {
// //       let imageUrl = null;

// //       if (place.image) {
// //         if (Buffer.isBuffer(place.image)) {
// //           const base64 = place.image.toString('base64');
// //           imageUrl = `data:image/jpeg;base64,${base64}`;
// //         } else if (place.image.buffer) {
// //           const base64 = place.image.buffer.toString('base64');
// //           imageUrl = `data:image/jpeg;base64,${base64}`;
// //         }
// //       }

// //       return {
// //         name: place.name,
// //         intro: place.intro,
// //         imageUrl
// //       };
// //     });

// //     // Return in format expected by frontend
// //     res.json({
// //       success: true,
// //       places: placesWithImages
// //     });

// //   } catch (error) {
// //     console.error('Error fetching nearby places:', error);
// //     res.status(500).json({ 
// //       error: 'Failed to fetch nearby places',
// //       places: []
// //     });
// //   }
// // };



// exports.getNearbyPlaces = async (req, res) => {
//   try {
//     const { district, exclude } = req.query;

//     if (!district) {
//       return res.status(400).json({ error: 'District parameter is required' });
//     }

//     let query = {
//       'location.district': new RegExp(district, 'i')
//     };

//     if (exclude) {
//       query.name = { $ne: exclude };
//     }

//     const places = await Place.find(query).limit(8);

//     const placesWithImages = places.map(place => {
//       let imageUrl = null;

//       if (place.image) {
//         if (place.image.$binary?.base64) {
//           imageUrl = `data:image/jpeg;base64,${place.image.$binary.base64}`;
//         } else if (place.image.data && Buffer.isBuffer(place.image.data)) {
//           imageUrl = `data:${place.image.contentType || 'image/jpeg'};base64,${place.image.data.toString('base64')}`;
//         } else if (Buffer.isBuffer(place.image)) {
//           imageUrl = `data:image/jpeg;base64,${place.image.toString('base64')}`;
//         } else if (place.image.buffer) {
//           imageUrl = `data:image/jpeg;base64,${place.image.buffer.toString('base64')}`;
//         }
//       }

//       return {
//         name: place.name,
//         intro: place.intro,
//         imageUrl,
//         // 👇 THIS IS THE IMPORTANT PART
//         encodedName: encodeURIComponent(place.name)
//       };
//     });

//     res.json({
//       success: true,
//       places: placesWithImages
//     });

//   } catch (error) {
//     console.error('Error fetching nearby places:', error);
//     res.status(500).json({ error: 'Failed to fetch nearby places' });
//   }
// };



const Place = require('../models/place');

// Helper function to decode image from various formats
function decodeImage(place) {
  let imageUrl = null;
  if (place.image) {
    if (place.image.$binary && place.image.$binary.base64) {
      imageUrl = `data:image/jpeg;base64,${place.image.$binary.base64}`;
    } else if (place.image.data && Buffer.isBuffer(place.image.data)) {
      const base64 = place.image.data.toString('base64');
      const contentType = place.image.contentType || 'image/jpeg';
      imageUrl = `data:${contentType};base64,${base64}`;
    } else if (Buffer.isBuffer(place.image)) {
      const base64 = place.image.toString('base64');
      imageUrl = `data:image/jpeg;base64,${base64}`;
    } else if (typeof place.image === 'object' && place.image.buffer) {
      const base64 = place.image.buffer.toString('base64');
      imageUrl = `data:image/jpeg;base64,${base64}`;
    }
  }
  return imageUrl;
}

// 🔍 Search Places with Filters and Image Decoding
exports.searchPlaces = async (req, res) => {
  try {
    // ✅ Fixed: use visitorType and bestSeason to match frontend form field names
    const { location, destinationType, visitorType, bestSeason, page = 1, limit = 6 } = req.query;

    const filter = {};

    if (location) {
      filter['location.district'] = new RegExp(location, 'i');
    }

    if (destinationType) {
      filter.category = new RegExp(destinationType, 'i');
    }

    // ✅ Fixed: field is visitor_type (underscore) and is an Array in DB
    // e.g. ["Kids (0-12)", "Teens (13-17)", "Adults (18-59)"]
    if (visitorType) {
      filter.visitor_type = { $elemMatch: { $regex: new RegExp(visitorType, 'i') } };
    }

    // ✅ Fixed: field is best_season (underscore) and is an Array in DB
    // e.g. ["Winter"]
    if (bestSeason) {
      filter.best_season = { $elemMatch: { $regex: new RegExp(bestSeason, 'i') } };
    }

    console.log('Search filter:', JSON.stringify(filter, null, 2));

    const places = await Place.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCount = await Place.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    const placesWithImageUrls = places.map((place) => {
      return {
        _id: place._id,
        name: place.name,
        intro: place.intro,
        details: place.details,
        location: place.location,
        category: place.category,
        visitor_type: place.visitor_type,   // ✅ Fixed field name
        best_season: place.best_season,     // ✅ Fixed field name
        price: place.price,
        rating: place.rating,
        famous: place.famous,
        imageUrl: decodeImage(place)
      };
    });

    res.json({
      places: placesWithImageUrls,
      totalPages,
      currentPage: parseInt(page),
      totalCount
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};

// 📍 Get Single Place by Name
exports.getSinglePlaceByName = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const place = await Place.findOne({ name });

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.status(200).json({
      _id: place._id,
      name: place.name,
      intro: place.intro,
      details: place.details,
      location: place.location,
      category: place.category,
      visitor_type: place.visitor_type,   // ✅ Fixed field name
      best_season: place.best_season,     // ✅ Fixed field name
      price: place.price,
      rating: place.rating,
      famous: place.famous,
      imageUrl: decodeImage(place)
    });

  } catch (err) {
    console.error('Get single place error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 🗺️ Get Nearby Places by District
exports.getNearbyPlaces = async (req, res) => {
  try {
    const { district, exclude } = req.query;

    if (!district) {
      return res.status(400).json({ error: 'District parameter is required' });
    }

    let query = {
      'location.district': new RegExp(district, 'i')
    };

    if (exclude) {
      query.name = { $ne: exclude };
    }

    const places = await Place.find(query).limit(8);

    const placesWithImages = places.map(place => {
      return {
        name: place.name,
        intro: place.intro,
        imageUrl: decodeImage(place),
        encodedName: encodeURIComponent(place.name)
      };
    });

    res.json({
      success: true,
      places: placesWithImages
    });

  } catch (error) {
    console.error('Error fetching nearby places:', error);
    res.status(500).json({ error: 'Failed to fetch nearby places' });
  }
};