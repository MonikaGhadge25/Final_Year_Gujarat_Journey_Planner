/**
 * fix_remaining_hotels.js
 * 
 * 1. Renames the 3 hotels that got wrong names (e.g. "Hotel Blueivy's Hotel" → "Hotel Blueivy")
 * 2. Creates manager users for them + the 2 still-missing hotels
 * 3. Removes duplicate hotel documents
 * 
 * Run from backend/ folder:  node fix_remaining_hotels.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI        = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel';
const DEFAULT_PASSWORD = 'Hotel@123';

// The 5 hotels that were missing — map wrong DB name → correct name + email
const FIXES = [
  {
    wrongName:   "Hotel Blueivy's Hotel",
    correctName: 'Hotel Blueivy',
    email:       'hotelblueivyanand@gmail.com',
  },
  {
    wrongName:   "Park Inn by Radisson's Hotel",
    correctName: 'Park Inn by Radisson',
    email:       'parkinnsurat@gmail.com',
  },
  {
    wrongName:   "FabHotel Crystal I - Gandhinagar's Hotel",
    correctName: 'FabHotel Crystal I - Gandhinagar',
    email:       'fabhotel.crystali.gn@gmail.com',
  },
];

// These 2 are completely missing from DB — we'll create fresh hotel docs for them
const MISSING = [
  {
    hotelName: 'Royal Heritage',
    email:     'royalheritage@gmail.com',
    district:  'Ahmedabad',
  },
  {
    hotelName: 'Eastin Residences Vadodara',
    email:     'eastin.vadodara@gmail.com',
    district:  'Vadodara',
  },
];

// Duplicates to remove (keep the first, delete extras by name)
const DUPLICATE_NAMES = [
  'LA CASA Club & Resort',
  'WOODS - Mangalyam Meadows',
  'Uddhav Vilas - A Family Hotel',
];

async function run() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  const db        = mongoose.connection.db;
  const hotelsCol = db.collection('hotels');
  const usersCol  = db.collection('users');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ── Step 1: Remove duplicates (keep the linked one, delete the rest) ─────────
  console.log('🧹 Removing duplicate hotels...');
  for (const name of DUPLICATE_NAMES) {
    const docs = await hotelsCol.find({ 'hotel_details.hotel_name': name }).toArray();
    if (docs.length <= 1) continue;

    // Keep the one that has manager_id set (properly linked), delete others
    const linked   = docs.filter(d => d.manager_id);
    const unlinked = docs.filter(d => !d.manager_id);

    for (const doc of unlinked) {
      await hotelsCol.deleteOne({ _id: doc._id });
      console.log(`  🗑️  Deleted duplicate: "${name}" (id: ${doc._id})`);
    }

    // If all were linked (shouldn't happen), keep first, delete rest
    if (linked.length > 1) {
      for (const doc of linked.slice(1)) {
        await hotelsCol.deleteOne({ _id: doc._id });
        console.log(`  🗑️  Deleted extra linked duplicate: "${name}"`);
      }
    }
  }

  // ── Step 2: Fix wrongly-named hotels ─────────────────────────────────────────
  console.log('\n✏️  Fixing hotel names and linking users...');
  for (const { wrongName, correctName, email } of FIXES) {
    const hotel = await hotelsCol.findOne({ 'hotel_details.hotel_name': wrongName });
    if (!hotel) {
      console.log(`  ⚠️  Not found in DB: "${wrongName}" — skipping`);
      continue;
    }

    // Fix the hotel name
    await hotelsCol.updateOne(
      { _id: hotel._id },
      { $set: { 'hotel_details.hotel_name': correctName, 'hotel_details.email': email } }
    );
    console.log(`  ✏️  Renamed: "${wrongName}" → "${correctName}"`);

    // Create or find user
    let user = await usersCol.findOne({ email });
    let userId;
    if (user) {
      userId = user._id;
      console.log(`  ⏭️  User already exists: ${email}`);
    } else {
      const result = await usersCol.insertOne({
        fullName: correctName + ' Manager',
        email,
        password: hashedPassword,
        gender: 'Other',
        dob: new Date('1985-01-01'),
        age: 40,
        role: 'hotel',
        hotel_id: hotel._id,
        profile_completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = result.insertedId;
      console.log(`  ✅ Created user: ${email}`);
    }

    // Link both ways
    await hotelsCol.updateOne(
      { _id: hotel._id },
      { $set: { manager_id: userId, manager_email: email, updatedAt: new Date() } }
    );
    await usersCol.updateOne(
      { _id: userId },
      { $set: { hotel_id: hotel._id, updatedAt: new Date() } }
    );
    console.log(`  🔗 Linked: "${correctName}" ↔ ${email}`);
  }

  // ── Step 3: Create completely missing hotels ──────────────────────────────────
  console.log('\n🏨 Creating missing hotel documents...');
  for (const { hotelName, email, district } of MISSING) {
    // Check if hotel already exists
    const existing = await hotelsCol.findOne({ 'hotel_details.hotel_name': hotelName });
    if (existing) {
      console.log(`  ⏭️  Hotel already exists: "${hotelName}"`);
      continue;
    }

    // Create user first
    let user = await usersCol.findOne({ email });
    let userId;
    if (user) {
      userId = user._id;
      console.log(`  ⏭️  User already exists: ${email}`);
    } else {
      const result = await usersCol.insertOne({
        fullName: hotelName + ' Manager',
        email,
        password: hashedPassword,
        gender: 'Other',
        dob: new Date('1985-01-01'),
        age: 40,
        role: 'hotel',
        profile_completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userId = result.insertedId;
      console.log(`  ✅ Created user: ${email}`);
    }

    // Create hotel document
    const hotelResult = await hotelsCol.insertOne({
      manager_id:    userId,
      manager_email: email,
      hotel_details: {
        hotel_name:     hotelName,
        description:    'Welcome to ' + hotelName,
        location:       { district, pincode: 0 },
        contact:        'Not specified',
        email:          email,
        check_in_time:  '14:00',
        check_out_time: '11:00',
        rating:         0,
        amenities:      ['WiFi', 'Parking', 'AC'],
        username:       email,
        password:       '',
      },
      room_types: [
        { type: 'Standard Room', price_per_night: '2000', features: ['AC', 'TV', 'WiFi'] },
        { type: 'Deluxe Room',   price_per_night: '3500', features: ['AC', 'TV', 'WiFi', 'Mini Fridge'] },
      ],
      image:   { base64: '' },
      gallery: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Link user → hotel
    await usersCol.updateOne(
      { _id: userId },
      { $set: { hotel_id: hotelResult.insertedId, updatedAt: new Date() } }
    );

    console.log(`  🏨 Created hotel + linked: "${hotelName}" ↔ ${email}`);
  }

  // ── Final check ───────────────────────────────────────────────────────────────
  console.log('\n📊 Final status:');
  const allHotels = await hotelsCol
    .find({}, { projection: { 'hotel_details.hotel_name': 1, manager_email: 1, manager_id: 1 } })
    .toArray();

  console.log(`Total hotels in DB: ${allHotels.length}`);
  console.log('─'.repeat(65));
  allHotels.forEach((h, i) => {
    const name   = h.hotel_details?.hotel_name || 'NO NAME';
    const email  = h.manager_email || '—';
    const status = h.manager_id ? '✅' : '❌';
    console.log(`${String(i+1).padStart(2)}. ${status} ${name.padEnd(42)} ${email}`);
  });

  console.log('\n✅ All done! Password for all managers: Hotel@123');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});