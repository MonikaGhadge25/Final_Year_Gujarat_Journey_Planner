// // import Hotel from "../models/bookinghotel.js";

// // export const searchHotels = async (req, res) => {
// //   try {
// //     const { location, category, rating, priceRange, page = 1, limit = 8 } = req.query;

// //     const filter = {};

// //     // District filter
// //     if (location) {
// //       filter["location.district"] = new RegExp(location, "i");
// //     }

// //     // Category filter
// //     if (category) {
// //       filter.category = category;
// //     }

// //     // Rating filter (min rating and above)
// //     if (rating) {
// //       filter.rating = { $gte: parseInt(rating) };
// //     }

// //     // Price filter
// //     if (priceRange) {
// //       if (priceRange === "under1000") filter.price = { $lt: 1000 };
// //       else if (priceRange === "1000-3000") filter.price = { $gte: 1000, $lte: 3000 };
// //       else if (priceRange === "3000-5000") filter.price = { $gte: 3000, $lte: 5000 };
// //       else if (priceRange === "5000plus") filter.price = { $gt: 5000 };
// //     }

// //     // Pagination
// //     const skip = (parseInt(page) - 1) * parseInt(limit);
// //     const total = await Hotel.countDocuments(filter);
// //     const hotels = await Hotel.find(filter).skip(skip).limit(parseInt(limit)).lean();

// //     // Convert image buffers to base64 URLs
// //     hotels.forEach(hotel => {
// //       if (hotel.image && hotel.imageType) {
// //         hotel.imageUrl = `data:${hotel.imageType};base64,${hotel.image.toString("base64")}`;
// //       } else {
// //         hotel.imageUrl = null;
// //       }
// //     });

// //     res.json({
// //       success: true,
// //       hotels,
// //       totalPages: Math.ceil(total / limit),
// //       currentPage: Number(page)
// //     });
// //   } catch (error) {
// //     console.error("Error searching hotels:", error);
// //     res.status(500).json({ success: false, message: "Server error" });
// //   }
// // };


// const Hotel = require("../models/bookinghotel.js");

// // Search & paginate hotels
// const getHotels = async (req, res) => {
//   try {
//     const { location, category, rating, priceRange, page = 1, limit = 8 } = req.query;

//     const filter = {};

//     // District filter
//     if (location) {
//       filter["location.district"] = new RegExp(location, "i");
//     }

//     // Category filter
//     if (category) {
//       filter.category = category;
//     }

//     // Rating filter (min rating and above)
//     if (rating) {
//       filter.rating = { $gte: parseInt(rating) };
//     }

//     // Price filter
//     if (priceRange) {
//       if (priceRange === "under1000") filter.price = { $lt: 1000 };
//       else if (priceRange === "1000-3000") filter.price = { $gte: 1000, $lte: 3000 };
//       else if (priceRange === "3000-5000") filter.price = { $gte: 3000, $lte: 5000 };
//       else if (priceRange === "5000plus") filter.price = { $gt: 5000 };
//     }

//     // Pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const total = await Hotel.countDocuments(filter);
//     const hotels = await Hotel.find(filter).skip(skip).limit(parseInt(limit)).lean();

//     // Convert image buffers to base64 URLs
//     hotels.forEach(hotel => {
//       if (hotel.image && hotel.imageType) {
//         hotel.imageUrl = `data:${hotel.imageType};base64,${hotel.image.toString("base64")}`;
//       } else {
//         hotel.imageUrl = null;
//       }
//     });

//     res.json({
//       success: true,
//       hotels,
//       totalPages: Math.ceil(total / limit),
//       currentPage: Number(page),
//     });
//   } catch (error) {
//     console.error("Error searching hotels:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// module.exports = { getHotels };



const Hotel = require("../models/bookinghotel.js");

// 🔍 Search & paginate booking hotels
const getHotels = async (req, res) => {
  try {
    const { location, category, rating, priceRange, page = 1, limit = 8 } = req.query;

    const filter = {};

    // District filter
    if (location) {
      filter["hotel_details.location.district"] = new RegExp(location, "i");
    }

    // Category filter
    if (category) {
      filter["hotel_details.category"] = new RegExp(category, "i");
    }

    // Rating filter
    if (rating) {
      filter["hotel_details.rating"] = { $gte: parseInt(rating) };
    }

    // Price filter (applies to any room type)
    if (priceRange) {
      if (priceRange === "under1000") {
        filter["room_types.price_per_night"] = { $lt: 1000 };
      } else if (priceRange === "1000-3000") {
        filter["room_types.price_per_night"] = { $gte: 1000, $lte: 3000 };
      } else if (priceRange === "3000-5000") {
        filter["room_types.price_per_night"] = { $gte: 3000, $lte: 5000 };
      } else if (priceRange === "5000plus") {
        filter["room_types.price_per_night"] = { $gt: 5000 };
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Hotel.countDocuments(filter);

    const hotels = await Hotel.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Format output (image + nested details)
    const hotelsFormatted = hotels.map((hotel) => ({
      _id: hotel._id,
      hotel_details: hotel.hotel_details,
      room_types: hotel.room_types,
      image: hotel.image?.base64 ? { base64: hotel.image.base64 } : null,
      status: hotel.status,
    }));

    res.json({
      success: true,
      hotels: hotelsFormatted,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error searching hotels:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getHotels };
