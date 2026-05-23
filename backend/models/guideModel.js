// // // // // const mongoose = require("mongoose");

// // // // // const agentSchema = new mongoose.Schema({
// // // // //   name: { type: String, required: true },
// // // // //   district: { type: String, required: true },
// // // // //   experience: { type: Number, default: 0 },
// // // // //   age: { type: Number, required: true },
// // // // //   language: [{ type: String }],
// // // // //   fees: { type: String, required: true },
// // // // //   rating: { type: Number, default: 0 },
// // // // //   mobile_no: { type: String, required: true }, // stored as string
// // // // //   gender: { type: String, enum: ["Male", "Female", "Other"], required: true }
// // // // // }, { timestamps: true });

// // // // // module.exports = mongoose.model("Agent", agentSchema);

// // // // const mongoose = require("mongoose");

// // // // const agentSchema = new mongoose.Schema({
// // // //   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to login user
// // // //   name: { type: String, default: "Not updated yet" },
// // // //   district: { type: String, default: "Not updated yet" },
// // // //   experience: { type: Number, default: 0 },
// // // //   age: { type: Number, default: 0 },
// // // //   language: [{ type: String, default: ["Not updated yet"] }],
// // // //   fees: { type: String, default: "0" },
// // // //   rating: { type: Number, default: 0 },
// // // //   mobile_no: { type: String, default: "Not updated yet" },
// // // //   gender: { type: String, enum: ["Male", "Female", "Other"], default: "Other" }
// // // // }, { timestamps: true });

// // // // module.exports = mongoose.model("Agent", agentSchema);


// // // // models/Agent.js
// // // const mongoose = require("mongoose");

// // // const agentSchema = new mongoose.Schema({
// // //   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// // //   name: String,
// // //   district: String,
// // //   experience: Number,
// // //   age: Number,
// // //   language: [String],
// // //   fees: String,
// // //   rating: Number,
// // //   mobile_no: String,
// // //   gender: String
  
// // //   // name: { type: String, required: true },
// // //   // gender: String,
// // //   // address: String,
// // //   // mobile_no: { type: String, required: true },
// // //   // email: { type: String, required: true, unique: true },
// // //   // experience: Number,
// // //   // age: Number,
// // //   // language: [String],
// // //   // fees: String,
// // //   // rating: Number,
// // //   // password: { type: String, required: true }, // for login
// // //   // district: String
// // // }, { timestamps: true });

// // // module.exports = mongoose.model("Agent", agentSchema);

// // import mongoose from "mongoose";

// // const agentDashboardSchema = new mongoose.Schema({
// //   fullName: { type: String, required: true },
// //   gender: String,
// //   address: String,
// //   phone: String,
// //   email: { type: String, required: true, unique: true },
// //   experience: Number,
// //   languages: [String],
// //   rating: { type: Number, default: 0 },
// //   fees: Number
// // }, { timestamps: true });

// // export default mongoose.model("AgentDashboard", agentDashboardSchema);


// import mongoose from "mongoose";

// const guideSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   district: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   address: {
//     type: String,
//     trim: true
//   },
//   experience: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   age: {
//     type: Number,
//     min: 18
//   },
//   language: {
//     type: [String], // Array of languages
//     required: true
//   },
//   fees: {
//     type: Number, // store as number for filtering/sorting
//     required: true
//   },
//   rating: {
//     type: Number,
//     min: 0,
//     max: 5,
//     default: 0
//   },
//   mobile_no: {
//     type: String, // keep as string to avoid formatting issues
//     required: true,
//     unique: true
//   },
//   gender: {
//     type: String,
//     enum: ["Male", "Female", "Other"],
//     required: true
//   },
//   username: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   password: {
//     type: String, // bcrypt hashed password
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   role: {
//     type: String,
//     enum: ["guide", "admin", "manager"], // extend if needed
//     default: "guide"
//   }
// }, {
//   timestamps: true // adds createdAt and updatedAt
// });

// export default mongoose.model("Agent", guideSchema);



// import mongoose from "mongoose";

// const guideSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     district: { type: String, required: true, trim: true },
//     address: { type: String, trim: true },
//     experience: { type: Number, required: true, min: 0 },
//     age: { type: Number, min: 18 },
//     language: { type: [String], required: true },
//     fees: { type: Number, required: true },
//     rating: { type: Number, min: 0, max: 5, default: 0 },
//     mobile_no: { type: String, required: true, unique: true },
//     gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
//     username: { type: String, required: true, unique: true },
//     password: { type: String, required: true }, // bcrypt hashed password
//     email: { type: String, required: true, unique: true },
//     role: { type: String, enum: ["guide", "admin", "manager"], default: "guide" }
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Guide", guideSchema);


const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const guideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    experience: { type: Number, required: true, min: 0 },
    age: { type: Number, min: 18 },
    language: { type: [String], required: true },
    fees: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    mobile_no: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed password
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["guide", "admin", "manager"], default: "guide" }
  },
  { timestamps: true }
);

// Hash password before saving
guideSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Guide", guideSchema);
