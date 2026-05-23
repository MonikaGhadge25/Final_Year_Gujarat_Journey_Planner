
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   phone: { type: String },
//   location: { type: String },
//   gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
//   dob: { type: Date, required: true },
//   age: { type: Number },
//   // role: { type: String, enum: ['admin', 'agent', 'client', 'hotel', 'guide'], default: 'client' },
//   role: { type: String, enum: ['admin', 'agent', 'client', 'hotel', 'guide', 'transport'], default: 'client' },
  
//   // Hotel manager relationship
//   hotel_id: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Hotel',
//     required: false, // 🔧 Not required initially, set when hotel is created
//     default: null
//   },
  
//   // Profile completion status for hotel managers
//   profile_completed: {
//     type: Boolean,
//     default: function() { return this.role !== 'hotel'; } // Only hotel managers need to complete profile
//   }
// });

// userSchema.pre('save', function (next) {
//   const today = new Date();
//   const birthDate = new Date(this.dob);
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const m = today.getMonth() - birthDate.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//     age--;
//   }
//   this.age = age;
//   next();
// });

// module.exports = mongoose.model('User', userSchema);



const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob: { type: Date, required: true },
  age: { type: Number },
  // role: { type: String, enum: ['admin', 'agent', 'client', 'hotel', 'guide'], default: 'client' },
  role: { type: String, enum: ['admin', 'agent', 'client', 'hotel', 'guide', 'transport'], default: 'client' },
  
  // Hotel manager relationship
  hotel_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hotel',
    required: false,
    default: null
  },

  // Agent relationship (role:'agent') — links to agent_infos collection
  agent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: false,
    default: null
  },
  
  // Profile completion status for hotel managers
  profile_completed: {
    type: Boolean,
    default: function() { return this.role !== 'hotel'; } // Only hotel managers need to complete profile
  }
});

userSchema.pre('save', function (next) {
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  this.age = age;
  next();
});

module.exports = mongoose.model('User', userSchema);