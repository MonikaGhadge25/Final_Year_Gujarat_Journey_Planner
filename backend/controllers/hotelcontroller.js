// const fs = require('fs');
// const Hotel = require('../models/hotel');

// // 🔍 Search Hotels with filters, pagination, and image formatting
// exports.searchHotels = async (req, res) => {
//   try {
//     const { location, category, priceRange, amenities, ratings, page = 1, limit = 6 } = req.query;

//     const filter = {};

//     // Handle location filter
//     if (location) {
//       filter.$or = [
//         { 'hotel_details.location.district': new RegExp(location, 'i') },
//         { 'location.district': new RegExp(location, 'i') }
//       ];
//     }

//     // Handle category filter
//     if (category) {
//       filter.$or = [
//         { 'hotel_details.category': new RegExp(category, 'i') },
//         { category: new RegExp(category, 'i') }
//       ];
//     }

//     // Handle rating filter
//     if (ratings) {
//       filter.$or = [
//         { 'hotel_details.rating': { $gte: Number(ratings) } },
//         { ratings: { $gte: Number(ratings) } }
//       ];
//     }

//     // Handle price range filter
//     if (priceRange) {
//       let priceFilter;

//       if (priceRange === 'under1000') {
//         priceFilter = { 'room_types': { $elemMatch: { price_per_night: { $regex: /^₹([1-9][0-9]{0,2})$/ } } } };
//       } else if (priceRange === '1000-3000') {
//         priceFilter = { 'room_types': { $elemMatch: { price_per_night: { $regex: /^₹(1[0-9]{3}|2[0-9]{3}|3000)$/ } } } };
//       } else if (priceRange === '3000-5000') {
//         priceFilter = { 'room_types': { $elemMatch: { price_per_night: { $regex: /^₹(3[0-9]{3}|4[0-9]{3}|5000)$/ } } } };
//       } else if (priceRange === '5000plus') {
//         priceFilter = { 'room_types': { $elemMatch: { price_per_night: { $regex: /^₹([5-9][0-9]{3}|[1-9][0-9]{4,})$/ } } } };
//       }

//       if (priceFilter) {
//         if (filter.$or) {
//           filter.$and = [{ $or: filter.$or }, priceFilter];
//           delete filter.$or;
//         } else {
//           Object.assign(filter, priceFilter);
//         }
//       }
//     }

//     // Handle amenities filter
//     if (amenities) {
//       filter.$or = [
//         { 'hotel_details.amenities': { $in: [new RegExp(amenities, 'i')] } },
//         { amenities: { $in: [new RegExp(amenities, 'i')] } }
//       ];
//     }

//     const hotels = await Hotel.find(filter)
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ 'hotel_details.ratings': -1, ratings: -1 });

//     const totalCount = await Hotel.countDocuments(filter);
//     const totalPages = Math.ceil(totalCount / limit);

//     // Dynamic image processing
//     const processImage = (imageField) => {
//       if (!imageField) return null;

//       if (imageField._bsontype === 'Binary' && imageField.buffer) {
//         return `data:image/jpeg;base64,${imageField.buffer.toString('base64')}`;
//       }
//       if (imageField.$binary && imageField.$binary.base64) {
//         return `data:image/jpeg;base64,${imageField.$binary.base64}`;
//       }
//       if (imageField.base64) {
//         return `data:image/jpeg;base64,${imageField.base64}`;
//       }
//       if (Buffer.isBuffer(imageField)) {
//         return `data:image/jpeg;base64,${imageField.toString('base64')}`;
//       }
//       if (imageField.data && Buffer.isBuffer(imageField.data)) {
//         return `data:image/jpeg;base64,${imageField.data.toString('base64')}`;
//       }
//       if (typeof imageField === 'string' && fs.existsSync(imageField)) {
//         const fileBuffer = fs.readFileSync(imageField);
//         return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
//       }

//       return imageField; // fallback (URL, etc.)
//     };

//     const hotelsFormatted = hotels.map(hotel => {
//       const hotelObj = hotel.toObject();
//       const imageKeys = ['image', 'img_1', 'img_2', 'img_3', 'img_4', 'img_5'];
//       const images = {};
//       imageKeys.forEach(key => {
//         images[key] = processImage(hotelObj[key]);
//       });

//       return {
//         _id: hotelObj._id,
//         name: hotelObj.name,
//         hotel_details: hotelObj.hotel_details,
//         room_types: hotelObj.room_types,
//         location: hotelObj.location,
//         category: hotelObj.category,
//         price: hotelObj.price,
//         ratings: hotelObj.ratings,
//         amenities: hotelObj.amenities,
//         description: hotelObj.description,
//         ...images
//       };
//     });

//     res.json({
//       hotels: hotelsFormatted,
//       totalPages,
//       currentPage: parseInt(page),
//       totalCount
//     });

//   } catch (error) {
//     console.error('Search error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // 📄 Get Hotel by ID
// exports.getHotelById = async (req, res) => {
//   try {
//     const hotel = await Hotel.findById(req.params.id);
//     if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

//     const hotelObj = hotel.toObject();

//     const processImage = (imageField) => {
//       if (!imageField) return null;

//       if (imageField._bsontype === 'Binary' && imageField.buffer) {
//         return `data:image/jpeg;base64,${imageField.buffer.toString('base64')}`;
//       }
//       if (imageField.$binary && imageField.$binary.base64) {
//         return `data:image/jpeg;base64,${imageField.$binary.base64}`;
//       }
//       if (imageField.base64) {
//         return `data:image/jpeg;base64,${imageField.base64}`;
//       }
//       if (Buffer.isBuffer(imageField)) {
//         return `data:image/jpeg;base64,${imageField.toString('base64')}`;
//       }
//       if (imageField.data && Buffer.isBuffer(imageField.data)) {
//         return `data:image/jpeg;base64,${imageField.data.toString('base64')}`;
//       }
//       if (typeof imageField === 'string' && fs.existsSync(imageField)) {
//         const fileBuffer = fs.readFileSync(imageField);
//         return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
//       }

//       return imageField;
//     };

//     const imageKeys = ['image', 'img_1', 'img_2', 'img_3', 'img_4', 'img_5'];
//     const images = {};
//     imageKeys.forEach(key => {
//       images[key] = processImage(hotelObj[key]);
//     });

//     res.json({
//       _id: hotelObj._id,
//       name: hotelObj.name,
//       hotel_details: hotelObj.hotel_details,
//       room_types: hotelObj.room_types,
//       location: hotelObj.location,
//       category: hotelObj.category,
//       price: hotelObj.price,
//       ratings: hotelObj.ratings,
//       amenities: hotelObj.amenities,
//       description: hotelObj.description,
//       ...images
//     });

//   } catch (err) {
//     console.error('Get hotel by ID error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // 📍 Get Nearby Hotels in Same District (excluding current)
// exports.getNearbyHotels = async (req, res) => {
//   const { district } = req.query;
//   const excludeId = req.query.exclude;

//   try {
//     const hotels = await Hotel.find({
//       $or: [
//         { 'hotel_details.location.district': district },
//         { 'location.district': district }
//       ],
//       _id: { $ne: excludeId },
//     }).limit(5);

//     const processImage = (imageField) => {
//       if (!imageField) return null;

//       if (imageField._bsontype === 'Binary' && imageField.buffer) {
//         return `data:image/jpeg;base64,${imageField.buffer.toString('base64')}`;
//       }
//       if (imageField.$binary && imageField.$binary.base64) {
//         return `data:image/jpeg;base64,${imageField.$binary.base64}`;
//       }
//       if (imageField.base64) {
//         return `data:image/jpeg;base64,${imageField.base64}`;
//       }
//       if (Buffer.isBuffer(imageField)) {
//         return `data:image/jpeg;base64,${imageField.toString('base64')}`;
//       }
//       if (imageField.data && Buffer.isBuffer(imageField.data)) {
//         return `data:image/jpeg;base64,${imageField.data.toString('base64')}`;
//       }
//       if (typeof imageField === 'string' && fs.existsSync(imageField)) {
//         const fileBuffer = fs.readFileSync(imageField);
//         return `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;
//       }

//       return imageField;
//     };

//     const hotelsFormatted = hotels.map(hotel => {
//       const hotelObj = hotel.toObject();
//       return {
//         _id: hotelObj._id,
//         name: hotelObj.name,
//         hotel_details: hotelObj.hotel_details,
//         location: hotelObj.location,
//         price: hotelObj.price,
//         ratings: hotelObj.ratings,
//         description: hotelObj.description,
//         image: processImage(hotelObj.image)
//       };
//     });

//     res.status(200).json({ hotels: hotelsFormatted });

//   } catch (err) {
//     console.error('Get nearby hotels error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // 🛠️ Admin function to find orphaned hotels
// exports.getOrphanedHotels = async (req, res) => {
//   try {
//     const orphanedHotels = await Hotel.find({
//       $or: [
//         { manager_id: { $exists: false } },
//         { manager_id: null },
//         { manager_email: { $exists: false } },
//         { manager_email: null }
//       ]
//     }).select('hotel_details.hotel_name hotel_details.email hotel_details.contact manager_id manager_email createdAt');

//     const hotelsWithInvalidManagers = await Hotel.aggregate([
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'manager_id',
//           foreignField: '_id',
//           as: 'manager'
//         }
//       },
//       {
//         $match: {
//           $and: [
//             { manager_id: { $exists: true, $ne: null } },
//             { manager: { $size: 0 } }
//           ]
//         }
//       },
//       {
//         $project: {
//           'hotel_details.hotel_name': 1,
//           'hotel_details.email': 1,
//           'hotel_details.contact': 1,
//           'manager_id': 1,
//           'manager_email': 1,
//           'createdAt': 1
//         }
//       }
//     ]);

//     const allOrphanedHotels = [...orphanedHotels, ...hotelsWithInvalidManagers];

//     res.json({
//       success: true,
//       count: allOrphanedHotels.length,
//       orphanedHotels: allOrphanedHotels,
//       message: `Found ${allOrphanedHotels.length} hotels that need manager assignment`
//     });

//   } catch (err) {
//     console.error('Get orphaned hotels error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };






const fs = require('fs');
const Hotel = require('../models/hotel');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: convert any image field stored in MongoDB into a base64 data URL
// ─────────────────────────────────────────────────────────────────────────────
const processImage = (imageField) => {
  if (!imageField) return null;

  // Mongoose Binary (BSON)
  if (imageField._bsontype === 'Binary' && imageField.buffer) {
    return `data:image/jpeg;base64,${imageField.buffer.toString('base64')}`;
  }
  // JSON import format  { $binary: { base64: '...' } }
  if (imageField.$binary && imageField.$binary.base64) {
    return `data:image/jpeg;base64,${imageField.$binary.base64}`;
  }
  // Dashboard upload format  { base64: '...' }
  if (imageField.base64) {
    return `data:image/jpeg;base64,${imageField.base64}`;
  }
  // Raw Buffer
  if (Buffer.isBuffer(imageField)) {
    return `data:image/jpeg;base64,${imageField.toString('base64')}`;
  }
  // Buffer wrapped in .data
  if (imageField.data && Buffer.isBuffer(imageField.data)) {
    return `data:image/jpeg;base64,${imageField.data.toString('base64')}`;
  }
  // File path on disk
  if (typeof imageField === 'string' && fs.existsSync(imageField)) {
    return `data:image/jpeg;base64,${fs.readFileSync(imageField).toString('base64')}`;
  }

  return imageField; // already a URL or data-URL string
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: format a raw hotel document for the frontend
// ─────────────────────────────────────────────────────────────────────────────
const formatHotel = (hotelObj) => {
  const imageKeys = ['image', 'img_1', 'img_2', 'img_3', 'img_4', 'img_5'];
  const images = {};
  imageKeys.forEach(key => {
    images[key] = processImage(hotelObj[key]);
  });

  return {
    _id: hotelObj._id,
    name: hotelObj.name,
    hotel_details: hotelObj.hotel_details,
    room_types: hotelObj.room_types,
    location: hotelObj.location,
    category: hotelObj.category,
    price: hotelObj.price,
    rating: hotelObj.rating,
    amenities: hotelObj.amenities,
    description: hotelObj.description,
    ...images
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔍  Search Hotels  –  GET /api/hotels/search
//
// Query params:
//   location   – district name  (stored as "Ahmedabad", case-insensitive match)
//   category   – room type      (Single | Double | Suite | Deluxe)
//   rating     – minimum stars  (3 | 4 | 5)
//   priceRange – under1000 | 1000-3000 | 3000-5000 | 5000plus
//   amenities  – single amenity string
//   page       – page number (default 1)
//   limit      – results per page (default 6)
// ─────────────────────────────────────────────────────────────────────────────
exports.searchHotels = async (req, res) => {
  try {
    const {
      location,
      category,
      priceRange,
      amenities,
      rating,
      page  = 1,
      limit = 6
    } = req.query;

    // Each active filter becomes one element in $and so they never overwrite each other
    const andConditions = [];

    // ── Location (district) ──────────────────────────────────────────────────
    // Stored as: hotel_details.location.district = "Ahmedabad"
    if (location) {
      andConditions.push({
        'hotel_details.location.district': new RegExp(location, 'i')
      });
    }

    // ── Category (room type) ─────────────────────────────────────────────────
    // NOTE: your data has NO "category" field on the hotel.
    // room_types[].type = "Single" | "Double" | "Suite" | "Deluxe"
    //
    // IMPORTANT: $elemMatch: { type: ... } is unreliable here because "type"
    // is a reserved keyword in Mongoose schema definitions. Instead we use
    // the dot-notation path 'room_types.type' which bypasses that conflict.
    if (category) {
      req._filterByCategory = true;
      req._categoryValue = category.trim();
    }

    // ── Rating ───────────────────────────────────────────────────────────────
    // Stored as: hotel_details.rating = 3 | 4 | 5
    // Filter returns hotels with rating >= selected value
    if (rating) {
      andConditions.push({
        'hotel_details.rating': { $gte: Number(rating) }
      });
    }

    // ── Price Range ──────────────────────────────────────────────────────────
    // Stored as: room_types[].price_per_night = "₹3000"  (string with ₹ prefix)
    // We strip the ₹ and compare numerically inside an aggregation-style $elemMatch.
    // Using a JS post-filter because $expr inside $elemMatch has MongoDB version limits.
    if (priceRange) {
      let min = 0, max = Infinity;

      // if      (priceRange === 'under1000')   { min = 0;    max = 999;    }
      // else if (priceRange === '1000-3000')   { min = 1000; max = 3000;   }
      // else if (priceRange === '3000-5000')   { min = 3000; max = 5000;   }
      // else if (priceRange === '5000plus')    { min = 5001; max = Infinity;}

      if      (priceRange === 'under2000')    { min = 0;     max = 1999;  }
      else if (priceRange === '2000-5000')    { min = 2000;  max = 5000;  }
      else if (priceRange === '5000-10000')   { min = 5000;  max = 10000; }
      else if (priceRange === '10000plus')    { min = 10001; max = Infinity; }

      // We fetch candidate hotels then post-filter by price (safe for any MongoDB version)
      // The _priceMin/_priceMax values are stored on req so we can use them after the query
      req._priceMin = min;
      req._priceMax = max;
      req._filterByPrice = true;

      // Pre-filter: only hotels that have at least one room_type (keeps the query fast)
      andConditions.push({
        'room_types.0': { $exists: true }
      });
    }

    // ── Amenities ────────────────────────────────────────────────────────────
    // Stored as: hotel_details.amenities = ["WiFi", "Pool", ...]
    if (amenities) {
      andConditions.push({
        'hotel_details.amenities': { $in: [new RegExp(amenities, 'i')] }
      });
    }

    // Build the final MongoDB filter
    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    // ── Query ────────────────────────────────────────────────────────────────
    let hotels = await Hotel.find(filter)
      .sort({ 'hotel_details.rating': -1 })
      .lean(); // lean() returns plain JS objects – faster

    // ── Post-filter by room type ─────────────────────────────────────────────
    // Done in JS to avoid Mongoose "type" reserved-keyword conflict in $elemMatch
    if (req._filterByCategory) {
      const catRegex = new RegExp(req._categoryValue, 'i');
      hotels = hotels.filter(hotel => {
        if (!hotel.room_types || hotel.room_types.length === 0) return false;
        return hotel.room_types.some(room => catRegex.test(room.type || ''));
      });
    }

    // ── Post-filter by price (strips ₹ and compares as number) ───────────────
    if (req._filterByPrice) {
      const min = req._priceMin;
      const max = req._priceMax;

      hotels = hotels.filter(hotel => {
        if (!hotel.room_types || hotel.room_types.length === 0) return false;
        // A hotel passes if ANY of its room types falls in the price range
        return hotel.room_types.some(room => {
          const raw = (room.price_per_night || '').replace(/[₹,\s]/g, '');
          const num = parseInt(raw, 10);
          if (isNaN(num)) return false;
          return num >= min && (max === Infinity ? true : num <= max);
        });
      });
    }

    // ── Pagination (applied after price post-filter for correct counts) ───────
    const totalCount = hotels.length;
    const totalPages = Math.ceil(totalCount / Number(limit));
    const startIdx   = (Number(page) - 1) * Number(limit);
    const pagedHotels = hotels.slice(startIdx, startIdx + Number(limit));

    // ── Format & respond ─────────────────────────────────────────────────────
    const hotelsFormatted = pagedHotels.map(formatHotel);

    res.json({
      hotels: hotelsFormatted,
      totalPages,
      currentPage: parseInt(page),
      totalCount
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📄  Get Hotel by ID  –  GET /api/hotels/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).lean();
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    res.json(formatHotel(hotel));

  } catch (err) {
    console.error('Get hotel by ID error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 📍  Get Nearby Hotels (same district, excluding current)  –  GET /api/hotels/nearby
// ─────────────────────────────────────────────────────────────────────────────
exports.getNearbyHotels = async (req, res) => {
  const { district, exclude } = req.query;

  try {
    const hotels = await Hotel.find({
      'hotel_details.location.district': new RegExp(district, 'i'),
      _id: { $ne: exclude }
    })
      .limit(5)
      .lean();

    const hotelsFormatted = hotels.map(hotelObj => ({
      _id: hotelObj._id,
      name: hotelObj.name,
      hotel_details: hotelObj.hotel_details,
      location: hotelObj.location,
      price: hotelObj.price,
      rating: hotelObj.rating,
      description: hotelObj.description,
      image: processImage(hotelObj.image)
    }));

    res.status(200).json({ hotels: hotelsFormatted });

  } catch (err) {
    console.error('Get nearby hotels error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 🛠️  Get Orphaned Hotels (admin)  –  GET /api/hotels/orphaned
// ─────────────────────────────────────────────────────────────────────────────
exports.getOrphanedHotels = async (req, res) => {
  try {
    const orphanedHotels = await Hotel.find({
      $or: [
        { manager_id: { $exists: false } },
        { manager_id: null },
        { manager_email: { $exists: false } },
        { manager_email: null }
      ]
    }).select('hotel_details.hotel_name hotel_details.email hotel_details.contact manager_id manager_email createdAt');

    const hotelsWithInvalidManagers = await Hotel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'manager_id',
          foreignField: '_id',
          as: 'manager'
        }
      },
      {
        $match: {
          $and: [
            { manager_id: { $exists: true, $ne: null } },
            { manager: { $size: 0 } }
          ]
        }
      },
      {
        $project: {
          'hotel_details.hotel_name': 1,
          'hotel_details.email': 1,
          'hotel_details.contact': 1,
          'manager_id': 1,
          'manager_email': 1,
          'createdAt': 1
        }
      }
    ]);

    const allOrphanedHotels = [...orphanedHotels, ...hotelsWithInvalidManagers];

    res.json({
      success: true,
      count: allOrphanedHotels.length,
      orphanedHotels: allOrphanedHotels,
      message: `Found ${allOrphanedHotels.length} hotels that need manager assignment`
    });

  } catch (err) {
    console.error('Get orphaned hotels error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};