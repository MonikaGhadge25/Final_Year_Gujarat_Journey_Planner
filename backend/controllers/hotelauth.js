// const Hotel = require('../models/hotel');
// const jwt   = require('jsonwebtoken');

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/hotelauth/login
// // Hotel manager logs in using hotel_details.email + hotel_details.password
// // (credentials stored directly inside the Hotel document — no User record needed)
// // ─────────────────────────────────────────────────────────────────────────────
// exports.hotelLogin = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required.' });
//   }

//   try {
//     // Find hotel whose manager email matches (case-insensitive)
//     const hotel = await Hotel.findOne({
//       'hotel_details.email': new RegExp(`^${email.trim()}$`, 'i')
//     });

//     if (!hotel) {
//       return res.status(404).json({ message: 'No hotel found with this email address.' });
//     }

//     // Plain-text password check (as stored in your JSON data)
//     const storedPassword = hotel.hotel_details.password;
//     if (!storedPassword || storedPassword !== password) {
//       return res.status(401).json({ message: 'Incorrect password.' });
//     }

//     // Sign a JWT that carries the hotel's _id and email
//     const token = jwt.sign(
//       {
//         hotelId:    hotel._id.toString(),
//         email:      hotel.hotel_details.email,
//         hotelName:  hotel.hotel_details.hotel_name,
//         role:       'hotel'          // keeps middleware compatible
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '8h' }
//     );

//     // Return everything the dashboard needs
//     return res.status(200).json({
//       success: true,
//       token,
//       hotel: {
//         _id:        hotel._id,
//         hotelName:  hotel.hotel_details.hotel_name,
//         email:      hotel.hotel_details.email,
//         district:   hotel.hotel_details.location?.district || '',
//         rating:     hotel.hotel_details.rating || 0,
//         role:       'hotel'
//       }
//     });

//   } catch (err) {
//     console.error('Hotel login error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/hotelauth/me   (protected — needs verifyHotelToken middleware)
// // Returns the hotel document for the currently logged-in hotel manager
// // ─────────────────────────────────────────────────────────────────────────────
// exports.getMe = async (req, res) => {
//   try {
//     const hotel = await Hotel.findById(req.hotel.hotelId);
//     if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

//     return res.json({
//       success: true,
//       data: {
//         _id:          hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types:   hotel.room_types,
//         image:        hotel.image,
//         img_1:        hotel.img_1,
//         img_2:        hotel.img_2,
//         img_3:        hotel.img_3,
//         img_4:        hotel.img_4,
//         img_5:        hotel.img_5,
//       }
//     });
//   } catch (err) {
//     console.error('getMe error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PUT /api/hotelauth/update   (protected)
// // Hotel manager updates their own hotel details
// // ─────────────────────────────────────────────────────────────────────────────
// exports.updateHotel = async (req, res) => {
//   try {
//     const hotel = await Hotel.findById(req.hotel.hotelId);
//     if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

//     const { hotel_details, room_types } = req.body;

//     // Update hotel_details fields selectively (don't overwrite email/password)
//     if (hotel_details) {
//       const allowed = [
//         'hotel_name', 'description', 'contact',
//         'check_in_time', 'check_out_time', 'amenities', 'rating'
//       ];
//       allowed.forEach(field => {
//         if (hotel_details[field] !== undefined) {
//           hotel.hotel_details[field] = hotel_details[field];
//         }
//       });

//       // Location sub-object
//       if (hotel_details.location) {
//         hotel.hotel_details.location = {
//           ...hotel.hotel_details.location,
//           ...hotel_details.location
//         };
//       }
//     }

//     // Update room types if provided
//     if (room_types && Array.isArray(room_types)) {
//       hotel.room_types = room_types;
//     }

//     hotel.markModified('hotel_details');
//     hotel.markModified('room_types');
//     await hotel.save();

//     return res.json({
//       success: true,
//       message: 'Hotel updated successfully.',
//       data: {
//         _id:           hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types:    hotel.room_types
//       }
//     });

//   } catch (err) {
//     console.error('updateHotel error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };






// const Hotel = require('../models/hotel');
// const jwt   = require('jsonwebtoken');

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/hotelauth/login
// // Hotel manager logs in using hotel_details.email + hotel_details.password
// // (credentials stored directly inside the Hotel document — no User record needed)
// // ─────────────────────────────────────────────────────────────────────────────
// exports.hotelLogin = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required.' });
//   }

//   try {
//     // Find hotel whose manager email matches (case-insensitive)
//     const hotel = await Hotel.findOne({
//       'hotel_details.email': new RegExp(`^${email.trim()}$`, 'i')
//     });

//     if (!hotel) {
//       return res.status(404).json({ message: 'No hotel found with this email address.' });
//     }

//     // Plain-text password check (as stored in your JSON data)
//     const storedPassword = hotel.hotel_details.password;
//     if (!storedPassword || storedPassword !== password) {
//       return res.status(401).json({ message: 'Incorrect password.' });
//     }

//     // Sign a JWT that carries the hotel's _id and email
//     const token = jwt.sign(
//       {
//         hotelId:    hotel._id.toString(),
//         email:      hotel.hotel_details.email,
//         hotelName:  hotel.hotel_details.hotel_name,
//         role:       'hotel'          // keeps middleware compatible
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: '8h' }
//     );

//     // Return everything the dashboard needs
//     return res.status(200).json({
//       success: true,
//       token,
//       hotel: {
//         _id:        hotel._id,
//         hotelName:  hotel.hotel_details.hotel_name,
//         email:      hotel.hotel_details.email,
//         district:   hotel.hotel_details.location?.district || '',
//         rating:     hotel.hotel_details.rating || 0,
//         role:       'hotel'
//       }
//     });

//   } catch (err) {
//     console.error('Hotel login error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/hotelauth/me   (protected — needs verifyHotelToken middleware)
// // Returns the hotel document for the currently logged-in hotel manager
// // ─────────────────────────────────────────────────────────────────────────────
// exports.getMe = async (req, res) => {
//   try {
//     const hotel = await Hotel.findById(req.hotel.hotelId);
//     if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

//     return res.json({
//       success: true,
//       data: {
//         _id:          hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types:   hotel.room_types,
//         image:        hotel.image,
//         img_1:        hotel.img_1,
//         img_2:        hotel.img_2,
//         img_3:        hotel.img_3,
//         img_4:        hotel.img_4,
//         img_5:        hotel.img_5,
//       }
//     });
//   } catch (err) {
//     console.error('getMe error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PUT /api/hotelauth/update   (protected)
// // Hotel manager updates their own hotel details
// // ─────────────────────────────────────────────────────────────────────────────
// exports.updateHotel = async (req, res) => {
//   try {
//     const hotel = await Hotel.findById(req.hotel.hotelId);
//     if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

//     const { hotel_details, room_types } = req.body;

//     // Update hotel_details fields selectively (don't overwrite email/password)
//     if (hotel_details) {
//       const allowed = [
//         'hotel_name', 'description', 'contact',
//         'check_in_time', 'check_out_time', 'amenities', 'rating'
//       ];
//       allowed.forEach(field => {
//         if (hotel_details[field] !== undefined) {
//           hotel.hotel_details[field] = hotel_details[field];
//         }
//       });

//       // Location sub-object
//       if (hotel_details.location) {
//         hotel.hotel_details.location = {
//           ...hotel.hotel_details.location,
//           ...hotel_details.location
//         };
//       }
//     }

//     // Update room types if provided
//     if (room_types && Array.isArray(room_types)) {
//       hotel.room_types = room_types;
//     }

//     hotel.markModified('hotel_details');
//     hotel.markModified('room_types');
//     await hotel.save();

//     return res.json({
//       success: true,
//       message: 'Hotel updated successfully.',
//       data: {
//         _id:           hotel._id,
//         hotel_details: hotel.hotel_details,
//         room_types:    hotel.room_types
//       }
//     });

//   } catch (err) {
//     console.error('updateHotel error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };






const Hotel = require('../models/hotel');
const User  = require('../models/User');
const jwt   = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hotelauth/login
// Hotel manager logs in using email + password.
// Password is stored (bcrypt-hashed) in the User document, NOT in hotel_details.
// The seed script (seed_hotel_managers.js) creates a User record per hotel manager
// and stores hotel_details.password as empty — so we must check User.password.
// ─────────────────────────────────────────────────────────────────────────────
exports.hotelLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Step 1: Find the User record with role 'hotel' matching this email
    const user = await User.findOne({
      email: new RegExp(`^${email.trim()}$`, 'i'),
      role: 'hotel'
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Step 2: Compare bcrypt password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Step 3: Find the linked Hotel document
    const hotel = await Hotel.findOne({
      $or: [
        { manager_id: user._id },
        { manager_email: email.trim().toLowerCase() },
        { 'hotel_details.email': new RegExp(`^${email.trim()}$`, 'i') }
      ]
    });

    if (!hotel) {
      return res.status(404).json({ message: 'No hotel linked to this account.' });
    }

    // Step 4: Sign JWT
    const token = jwt.sign(
      {
        id:        user._id.toString(),   // ← 'id' matches verifyToken & hoteldashboard controller
        hotelId:   hotel._id.toString(),
        email:     user.email,
        hotelName: hotel.hotel_details.hotel_name,
        role:      'hotel'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Step 5: Return token + hotel info
    return res.status(200).json({
      success: true,
      token,
      hotel: {
        _id:       hotel._id,
        hotelName: hotel.hotel_details.hotel_name,
        email:     user.email,
        district:  hotel.hotel_details.location?.district || '',
        rating:    hotel.hotel_details.rating || 0,
        role:      'hotel'
      }
    });

  } catch (err) {
    console.error('Hotel login error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hotelauth/me   (protected — needs verifyHotelToken middleware)
// Returns the hotel document for the currently logged-in hotel manager
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.hotel.hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

    return res.json({
      success: true,
      data: {
        _id:          hotel._id,
        hotel_details: hotel.hotel_details,
        room_types:   hotel.room_types,
        image:        hotel.image,
        gallery:      hotel.gallery || [],
        img_1:        hotel.img_1,
        img_2:        hotel.img_2,
        img_3:        hotel.img_3,
        img_4:        hotel.img_4,
        img_5:        hotel.img_5,
      }
    });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/hotelauth/update   (protected)
// Hotel manager updates their own hotel details
// ─────────────────────────────────────────────────────────────────────────────
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.hotel.hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

    const { hotel_details, room_types } = req.body;

    // Update hotel_details fields selectively (don't overwrite email/password)
    if (hotel_details) {
      const allowed = [
        'hotel_name', 'description', 'contact',
        'check_in_time', 'check_out_time', 'amenities', 'rating'
      ];
      allowed.forEach(field => {
        if (hotel_details[field] !== undefined) {
          hotel.hotel_details[field] = hotel_details[field];
        }
      });

      // Location sub-object
      if (hotel_details.location) {
        hotel.hotel_details.location = {
          ...hotel.hotel_details.location,
          ...hotel_details.location
        };
      }
    }

    // Update room types if provided
    if (room_types && Array.isArray(room_types)) {
      hotel.room_types = room_types;
    }

    // ── Image upload (main image) ────────────────────────────────────────────
    // Frontend sends: { image: { base64: '<pure base64 string>', mimeType: 'image/jpeg' } }
    if (req.body.image && req.body.image.base64) {
      hotel.image = { base64: req.body.image.base64 };
      hotel.markModified('image');
    }

    // ── Gallery images ───────────────────────────────────────────────────────
    // Frontend sends: { gallery: [{ id, base64, mimeType }, ...] }
    if (req.body.gallery && Array.isArray(req.body.gallery)) {
      hotel.gallery = req.body.gallery.map(item => ({
        id:         item.id   || String(Date.now()),
        base64:     item.base64,
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date()
      }));
      hotel.markModified('gallery');
    }

    hotel.markModified('hotel_details');
    hotel.markModified('room_types');

    // Use native updateOne to bypass Mongoose schema validation on room_types
    const db = hotel.db || require('mongoose').connection;
    await db.collection('hotels').updateOne(
      { _id: hotel._id },
      { $set: {
          hotel_details: hotel.hotel_details,
          room_types:    hotel.room_types,
          image:         hotel.image,
          gallery:       hotel.gallery,
          updatedAt:     new Date()
      }}
    );

    return res.json({
      success: true,
      message: 'Hotel updated successfully.',
      data: {
        _id:           hotel._id,
        hotel_details: hotel.hotel_details,
        room_types:    hotel.room_types,
        image:         hotel.image,
        gallery:       hotel.gallery || []
      }
    });

  } catch (err) {
    console.error('updateHotel error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};