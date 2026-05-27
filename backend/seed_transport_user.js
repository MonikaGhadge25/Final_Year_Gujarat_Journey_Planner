/**
 * seed_transport_user.js
 * Creates one User(role:'transport') account for the transport dashboard.
 * Since there are no managers in MongoDB, a single shared account manages
 * all transport booking requests platform-wide.
 *
 * Run:  node backend/seed_transport_user.js
 *
 * Login:  transport@gjt.com  /  Transport@123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gujarat_tour_travel';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  const email = 'transport123@gmail.com';
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'transport';
    await existing.save();
    console.log(`⏭  User already exists for ${email} — role confirmed as 'transport'`);
  } else {
    const hashed = await bcrypt.hash('Transport@123', 10);
    await User.create({
      fullName : 'Transport Manager',
      email,
      password : hashed,
      phone    : '9000000001',
      gender   : 'Other',
      dob      : new Date('1990-01-01'),
      role     : 'transport',
      profile_completed: true
    });
    console.log('✅ Created transport manager account');
    console.log('   Email    : transport123@gmail.com');
    console.log('   Password : Transport@123');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });