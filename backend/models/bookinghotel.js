// // import mongoose from "mongoose";

// // const bookingHotelSchema = new mongoose.Schema(
// //   {
// //     hotel: {
// //       name: { type: String, required: true },
// //       location: { type: String, required: true },
// //       price: { type: Number, required: true },
// //     },
// //     user: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User", // Link booking to a user (if authentication is used)
// //       required: false,
// //     },
// //     status: {
// //       type: String,
// //       enum: ["pending", "confirmed", "cancelled"],
// //       default: "pending",
// //     },
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("BookingHotel", bookingHotelSchema);

// import mongoose from "mongoose";

// const bookingHotelSchema = new mongoose.Schema(
//   {
//     // name: { type: String, required: true },   // ✅ Hotel name
//     // imageUrl: { type: String },               // ✅ Add image for cards
//     // rating: { type: Number, default: 3 },     // ✅ Default rating

//     // // ✅ Structured location (matches controller + frontend)
//     // location: {
//     //   district: { type: String, required: true },
//     //   city: { type: String },
//     //   state: { type: String },
//     // },

//     // price: { type: Number, required: true },

//     // user: {
//     //   type: mongoose.Schema.Types.ObjectId,
//     //   ref: "User",
//     //   required: false,
//     // },

//     // status: {
//     //   type: String,
//     //   enum: ["pending", "confirmed", "cancelled"],
//     //   default: "pending",
//     // },
//     name: {
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
//   },
//   { timestamps: true }
// );

// export default mongoose.model("BookingHotel", bookingHotelSchema);


import mongoose from "mongoose";

const bookingHotelSchema = new mongoose.Schema(
  {
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
    },

    room_types: [
      {
        type: { type: String, required: true },
        price_per_night: { type: String, required: true },
        features: [String],
      },
    ],

    image: {
      base64: { type: String },
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("BookingHotel", bookingHotelSchema);
