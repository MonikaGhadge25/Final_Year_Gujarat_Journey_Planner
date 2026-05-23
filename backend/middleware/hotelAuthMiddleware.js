// const jwt = require('jsonwebtoken');

// // ─────────────────────────────────────────────────────────────────────────────
// // verifyHotelToken
// // Middleware for routes that only hotel managers can access.
// // Reads the Bearer token, verifies it, and attaches req.hotel = { hotelId, email, hotelName }
// // ─────────────────────────────────────────────────────────────────────────────
// exports.verifyHotelToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Access denied. No token provided.' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Make sure this token was issued for a hotel login
//     if (decoded.role !== 'hotel' || !decoded.hotelId) {
//       return res.status(403).json({ message: 'Forbidden. This token is not for a hotel account.' });
//     }

//     req.hotel = decoded; // { hotelId, email, hotelName, role }
//     next();
//   } catch (err) {
//     console.error('Hotel token error:', err.message);
//     return res.status(401).json({ message: 'Invalid or expired token.' });
//   }
// };




const jwt   = require('jsonwebtoken');
const Hotel = require('../models/Hotel');

// ─────────────────────────────────────────────────────────────────────────────
// verifyHotelToken
// Accepts BOTH token types:
//   1. Token from /api/hotelauth/login  → payload has { hotelId, email, role:'hotel' }
//   2. Token from /api/auth/login       → payload has { id, role:'hotel' }
//      (fallback when hotelauth/login fails — hotel manager exists in User collection)
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyHotelToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Must be hotel role
    if (decoded.role !== 'hotel') {
      return res.status(403).json({ message: 'Forbidden. Not a hotel account.' });
    }

    // Case 1: Token from /api/hotelauth/login — has hotelId directly
    if (decoded.hotelId) {
      req.hotel = decoded; // { hotelId, email, hotelName, role }
      return next();
    }

    // Case 2: Token from /api/auth/login — has 'id' (userId), no hotelId
    // Look up the Hotel document linked to this user
    if (decoded.id) {
      const hotel = await Hotel.findOne({
        $or: [
          { manager_id: decoded.id },
          { manager_email: decoded.email }
        ]
      });

      if (!hotel) {
        return res.status(403).json({ message: 'No hotel linked to this account.' });
      }

      // Attach hotel info so controllers can use req.hotel.hotelId
      req.hotel = {
        hotelId:   hotel._id.toString(),
        userId:    decoded.id,
        email:     decoded.email || hotel.hotel_details.email,
        hotelName: hotel.hotel_details.hotel_name,
        role:      'hotel'
      };
      return next();
    }

    return res.status(403).json({ message: 'Forbidden. Invalid token payload.' });

  } catch (err) {
    console.error('Hotel token error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};