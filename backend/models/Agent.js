// const mongoose = require('mongoose');

// const agentSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Agent name is required'],
//     trim: true
//   },
//   district: {
//     type: String,
//     required: [true, 'District is required'],
//     trim: true
//   },
//   age: {
//     type: Number,
//     required: [true, 'Age is required'],
//     min: [18, 'Age must be at least 18'],
//     max: [65, 'Age must be less than 65']
//   },
//   language: [{
//     type: String,
//     required: true,
//     trim: true
//   }],
//   experience: {
//     type: Number,
//     required: [true, 'Experience is required'],
//     min: [0, 'Experience cannot be negative'],
//     max: [50, 'Experience cannot exceed 50 years']
//   },
//   fees: {
//     type: String,
//     required: [true, 'Fees information is required'],
//     trim: true
//   },
//   rating: {
//     type: Number,
//     required: [true, 'Rating is required'],
//     min: [1, 'Rating must be between 1 and 5'],
//     max: [5, 'Rating must be between 1 and 5'],
//     default: 3
//   },
//   mobile_no: {
//     type: mongoose.Schema.Types.Mixed, // Accept both String and Number
//     required: [true, 'Mobile number is required'],
//     validate: {
//       validator: function(v) {
//         // Convert to string if it's a number
//         const mobileStr = v.toString();
//         return /^\d{10}$/.test(mobileStr);
//       },
//       message: 'Mobile number must be 10 digits'
//     }
//   },
//   gender: {
//     type: String,
//     required: [true, 'Gender is required'],
//     enum: ['Male', 'Female', 'Other']
//   },
//   image: {
//     type: String,
//     default: 'assets/images/default-avatar.jpg'
//   }
// }, {
//   timestamps: true
// });

// // Transform function to ensure mobile_no is always returned as string
// agentSchema.set('toJSON', {
//   transform: function(doc, ret) {
//     if (ret.mobile_no) {
//       ret.mobile_no = ret.mobile_no.toString();
//     }
//     return ret;
//   }
// });

// agentSchema.set('toObject', {
//   transform: function(doc, ret) {
//     if (ret.mobile_no) {
//       ret.mobile_no = ret.mobile_no.toString();
//     }
//     return ret;
//   }
// });

// // Pre-save middleware to convert mobile_no to string
// agentSchema.pre('save', function(next) {
//   if (this.mobile_no) {
//     this.mobile_no = this.mobile_no.toString();
//   }
//   next();
// });

// // Create indexes for better query performance
// agentSchema.index({ district: 1 });
// agentSchema.index({ language: 1 });
// agentSchema.index({ experience: 1 });
// agentSchema.index({ rating: -1 });

// module.exports = mongoose.model('Agent', agentSchema);




const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Agent name is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18'],
    max: [65, 'Age must be less than 65']
  },
  language: [{
    type: String,
    required: true,
    trim: true
  }],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  fees: {
    type: String,
    required: [true, 'Fees information is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5'],
    default: 3
  },
  mobile_no: {
    type: mongoose.Schema.Types.Mixed, // Accept both String and Number
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v) {
        // Convert to string if it's a number
        const mobileStr = v.toString();
        return /^\d{10}$/.test(mobileStr);
      },
      message: 'Mobile number must be 10 digits'
    }
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  image: {
    type: String,
    default: 'assets/images/default-avatar.jpg'
  },
  // Link to User account (set by seed / dashboard)
  manager_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  manager_email: {
    type: String,
    required: false,
    default: null
  },
  // Email stored on agent record (from JSON import)
  email: {
    type: String,
    required: false,
    default: null
  }
}, {
  timestamps: true
});

// Transform function to ensure mobile_no is always returned as string
agentSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.mobile_no) {
      ret.mobile_no = ret.mobile_no.toString();
    }
    return ret;
  }
});

agentSchema.set('toObject', {
  transform: function(doc, ret) {
    if (ret.mobile_no) {
      ret.mobile_no = ret.mobile_no.toString();
    }
    return ret;
  }
});

// Pre-save middleware to convert mobile_no to string
agentSchema.pre('save', function(next) {
  if (this.mobile_no) {
    this.mobile_no = this.mobile_no.toString();
  }
  next();
});

// Create indexes for better query performance
agentSchema.index({ district: 1 });
agentSchema.index({ language: 1 });
agentSchema.index({ experience: 1 });
agentSchema.index({ rating: -1 });

module.exports = mongoose.model('Agent', agentSchema);