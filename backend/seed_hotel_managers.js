/**
 * seed_hotel_managers_v2.js
 * 
 * Fixed version:
 * - Finds hotels by NAME (not ID) so it works even if IDs changed after re-import
 * - Uses MongoDB updateOne directly to bypass Mongoose schema validation on room_types
 * - Links user ↔ hotel properly via manager_id / manager_email / hotel_id
 * - Safe to re-run (skips existing users, re-links hotels)
 * 
 * HOW TO RUN (from your backend/ folder):
 *   node seed_hotel_managers_v2.js
 * 
 * Password for all managers: Hotel@123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGO_URI        = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel';
const DEFAULT_PASSWORD = 'Hotel@123';

// ── All 34 hotels: find by name, login with email ─────────────────────────────
const HOTELS = [
  { hotelName: 'Royal Heritage',                      email: 'royalheritage@gmail.com' },
  { hotelName: 'Eastin Residences Vadodara',           email: 'eastin.vadodara@gmail.com' },
  { hotelName: 'Park Inn by Radisson',                 email: 'parkinnsurat@gmail.com' },
  { hotelName: 'FabHotel Crystal I - Gandhinagar',    email: 'fabhotel.crystali.gn@gmail.com' },
  { hotelName: 'Hotel Neptune',                        email: 'hotelneptuneamreli@gmail.com' },
  { hotelName: 'Hotel Blueivy',                        email: 'hotelblueivyanand@gmail.com' },
  { hotelName: 'Uddhav Vilas - A Family Hotel',       email: 'uddhavvilasaravalli@gmail.com' },
  { hotelName: 'Hotel Aagman',                         email: 'hotelaagmanbanaskantha@gmail.com' },
  { hotelName: 'Ginger Bharuch',                       email: 'gingerbharuch@gmail.com' },
  { hotelName: 'Nilambag Palace Hotel',               email: 'nilambagpalacebhavnagar@gmail.com' },
  { hotelName: 'Tree of Life Darbargadh Dared',       email: 'treeoflifedared@gmail.com' },
  { hotelName: 'Bhanu The Fern Forest Resort & Spa',  email: 'thefernjambughoda@gmail.com' },
  { hotelName: 'Hotel Caesars Palace',                 email: 'caesarspalacedahod@gmail.com' },
  { hotelName: 'Pension An Bord',                      email: 'pensionanborddang@gmail.com' },
  { hotelName: 'Ginger Dwarka',                        email: 'gingerdwarka@gmail.com' },
  { hotelName: 'FabHotel Siddharth Corporate',        email: 'siddharthcorporate@gmail.com' },
  { hotelName: 'The Sky Imperial Hotel Kailash',      email: 'skyimperialkailash@gmail.com' },
  { hotelName: 'Hotel Rann of Kachchh',               email: 'rannofkachchhhotel@gmail.com' },
  { hotelName: 'Roadies Rostel - Best Adventure Resort', email: 'roadiesrostelkheda@gmail.com' },
  { hotelName: 'Hotel Cypress',                        email: 'hotelcypressmahisagar@gmail.com' },
  { hotelName: 'Lords Eco Inn',                        email: 'lordsecoinnmorbi@gmail.com' },
  { hotelName: 'Sarasutha Hotel and Pool',             email: 'sarasuthahotelpool@gmail.com' },
  { hotelName: 'Nrich Skyotel',                        email: 'nrichskyotelnavsari@gmail.com' },
  { hotelName: 'Hotel Midtown',                        email: 'hotelmidtownpanchmahal@gmail.com' },
  { hotelName: 'Hotel Dolphin Residency',              email: 'dolphinresidencypatan@gmail.com' },
  { hotelName: 'Hotel Balaji Palace',                  email: 'balajipalaceporbandar@gmail.com' },
  { hotelName: 'Nova Park',                            email: 'novaparkrajkot@gmail.com' },
  { hotelName: 'The Aeran Foods & Hospitality',       email: 'aeranhospitalitysabarkantha@gmail.com' },
  { hotelName: 'Dream Inn By Nexottel',                email: 'dreaminnnexottel@gmail.com' },
  { hotelName: 'LA CASA Club & Resort',               email: 'lacasa.tapi@gmail.com' },
  { hotelName: 'WOODS - Mangalyam Meadows',           email: 'woods.mangalyammeadows@gmail.com' },
  { hotelName: 'Hotel Damodar',                        email: 'hoteldamodar.girsomnath@gmail.com' },
  { hotelName: 'Bellevue Sarovar Premiere',            email: 'bellevue.sarovarpremiere.junagadh@gmail.com' },
  { hotelName: 'Hotel Heritage Inn',                   email: 'heritageinn.mehsana@gmail.com' },
];

async function seed() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  // Work directly with native collections — bypasses ALL schema validation
  const db        = mongoose.connection.db;
  const hotelsCol = db.collection('hotels');
  const usersCol  = db.collection('users');

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  console.log(`🔒 Password: "${DEFAULT_PASSWORD}"\n`);

  let created = 0, skipped = 0, linked = 0, notFound = 0;
  const results = [];

  for (const { hotelName, email } of HOTELS) {

    // ── 1. Find hotel by name (case-insensitive) ──────────────────────────────
    const hotel = await hotelsCol.findOne({
      'hotel_details.hotel_name': { $regex: `^${hotelName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    });

    if (!hotel) {
      console.warn(`⚠️  Hotel NOT FOUND in DB: "${hotelName}"`);
      notFound++;
      results.push({ hotelName, email, status: 'HOTEL_NOT_FOUND' });
      continue;
    }

    // ── 2. Create or find the User ────────────────────────────────────────────
    let user = await usersCol.findOne({ email });
    let userId;

    if (user) {
      userId = user._id;
      console.log(`⏭️  User exists: ${email}`);
      skipped++;
      results.push({ hotelName, email, status: 'USER_EXISTED' });
    } else {
      const newUser = {
        fullName:          hotelName + ' Manager',
        email,
        password:          hashedPassword,
        gender:            'Other',
        dob:               new Date('1985-01-01'),
        age:               40,
        role:              'hotel',
        hotel_id:          hotel._id,
        profile_completed: true,
        createdAt:         new Date(),
        updatedAt:         new Date(),
      };
      const insertResult = await usersCol.insertOne(newUser);
      userId = insertResult.insertedId;
      console.log(`✅ Created user: ${email} → "${hotelName}"`);
      created++;
      results.push({ hotelName, email, status: 'CREATED' });
    }

    // ── 3. Link hotel → user using updateOne (bypasses schema validation) ─────
    await hotelsCol.updateOne(
      { _id: hotel._id },
      {
        $set: {
          manager_id:              userId,
          manager_email:           email,
          'hotel_details.email':   email,   // ensure email field is set
          updatedAt:               new Date(),
        }
      }
    );

    // ── 4. Link user → hotel ──────────────────────────────────────────────────
    await usersCol.updateOne(
      { _id: userId },
      { $set: { hotel_id: hotel._id, updatedAt: new Date() } }
    );

    console.log(`🔗 Linked: "${hotelName}" ↔ ${email}`);
    linked++;
  }

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(72));
  console.log('📊 SEEDING COMPLETE');
  console.log('═'.repeat(72));
  console.log(`  ✅ Users created  : ${created}`);
  console.log(`  ⏭️  Already existed: ${skipped}`);
  console.log(`  🔗 Hotels linked  : ${linked}`);
  console.log(`  ⚠️  Hotels not found: ${notFound}`);
  console.log('═'.repeat(72));

  if (notFound > 0) {
    console.log('\n⚠️  Some hotels were not found. Run this in MongoDB Compass to see all hotel names:');
    console.log('   db.hotels.find({}, {"hotel_details.hotel_name": 1})\n');
  }

  console.log('\n📋 LOGIN CREDENTIALS\n');
  console.log('Password for ALL managers: ' + DEFAULT_PASSWORD + '\n');
  console.log('Hotel Name'.padEnd(46) + 'Login Email');
  console.log('─'.repeat(88));

  results
    .filter(r => r.status !== 'HOTEL_NOT_FOUND')
    .forEach(({ hotelName, email }) => {
      console.log(hotelName.padEnd(46) + email);
    });

  if (notFound > 0) {
    console.log('\n❌ NOT LINKED (hotel not found in DB):');
    results
      .filter(r => r.status === 'HOTEL_NOT_FOUND')
      .forEach(({ hotelName, email }) => {
        console.log('  ' + hotelName.padEnd(44) + email);
      });
  }

  await mongoose.disconnect();
  console.log('\n🔌 Done!');
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});