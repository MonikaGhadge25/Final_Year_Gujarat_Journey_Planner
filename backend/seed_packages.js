/**
 * seed_packages.js
 * 
 * Imports all 3 tour packages into the 'packages' MongoDB collection.
 * Also looks up the real hotel and agent documents and stores their IDs.
 * 
 * Run from backend/ folder:
 *   node seed_packages.js
 * 
 * Safe to re-run — skips packages that already exist by name.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel';

// ── Package data (mirrors tour_packages.json) ─────────────────────────────────
const PACKAGES = [
  {
    name:        'Rann of Kutch Festival Tour',
    description: 'Experience the magical white desert of Kutch during festival season. Enjoy folk music, cultural performances, and the breathtaking Rann Utsav.',
    category:    'Festival',
    image:       'assets/img/2.jpg',
    place: {
      name:     'Great Rann of Kutch',
      district: 'Kutch',
      pincode:  370001,
      category: 'Festival',
      price:    '₹500–₹2000 (festival & tours)',
      rating:   5
    },
    hotel: { name: 'Hotel Rann of Kachchh' },
    agent: { name: 'Vishva Parmar', fees: '₹500', rating: 4 }
  },
  {
    name:        'Gir Lion Safari Adventure',
    description: 'Witness the majestic Asiatic lions in their natural habitat at Gir National Park. A thrilling wildlife safari experience unlike any other.',
    category:    'Wildlife',
    image:       'assets/img/2.jpg',
    place: {
      name:     'Gir National Park',
      district: 'Amreli',
      pincode:  365460,
      category: 'Wildlife',
      price:    '₹500–₹1500',
      rating:   5
    },
    hotel: { name: 'Hotel Neptune' },
    agent: { name: 'Prathvi Sharma', fees: '₹500', rating: 4.4 }
  },
  {
    name:        'Statue of Unity & Heritage Tour',
    description: 'Visit the world\'s tallest statue and explore the rich heritage of the Narmada valley. Includes valley of flowers and jungle safari.',
    category:    'Heritage',
    image:       'assets/img/2.jpg',
    place: {
      name:     'Statue of Unity',
      district: 'Narmada',
      pincode:  393155,
      category: 'Heritage',
      price:    '₹150–₹450 (entry ticket)',
      rating:   5
    },
    hotel: { name: 'Sarasutha Hotel and Pool' },
    agent: { name: 'Chirag Sharma', fees: '₹400', rating: 4.4 }
  }
];

async function seed() {
  console.log('🔌 Connecting to MongoDB:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  const db         = mongoose.connection.db;
  const packagesCol = db.collection('packages');
  const hotelsCol  = db.collection('hotels');
  const usersCol   = db.collection('users');

  let created = 0, skipped = 0;

  for (const pkg of PACKAGES) {
    // Skip if already exists
    const existing = await packagesCol.findOne({ name: pkg.name });
    if (existing) {
      console.log(`⏭️  Already exists: "${pkg.name}"`);
      skipped++;
      continue;
    }

    // Try to find real hotel document to link hotel_id
    const hotelDoc = await hotelsCol.findOne({
      'hotel_details.hotel_name': { $regex: `^${pkg.hotel.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    });
    if (hotelDoc) {
      pkg.hotel.hotel_id = hotelDoc._id;
      console.log(`  🔗 Linked hotel: "${pkg.hotel.name}" (${hotelDoc._id})`);
    } else {
      console.log(`  ⚠️  Hotel not found: "${pkg.hotel.name}" — will link later`);
    }

    // Try to find agent user by name
    const agentDoc = await usersCol.findOne({
      fullName: { $regex: pkg.agent.name, $options: 'i' },
      role: { $in: ['agent', 'guide'] }
    });
    if (agentDoc) {
      pkg.agent.agent_id = agentDoc._id;
      console.log(`  🔗 Linked agent: "${pkg.agent.name}" (${agentDoc._id})`);
    } else {
      console.log(`  ⚠️  Agent not found: "${pkg.agent.name}" — will store name only`);
    }

    await packagesCol.insertOne({
      ...pkg,
      isActive:  true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`✅ Created package: "${pkg.name}"`);
    created++;
  }

  console.log('\n' + '═'.repeat(55));
  console.log(`📊 Done — Created: ${created}, Skipped: ${skipped}`);
  console.log('═'.repeat(55));
  console.log('\n✅ Packages are now in the DB.');
  console.log('   Add this line to backend/server.js:');
  console.log("   app.use('/api/packages', require('./routes/packageRoutes'));\n");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});