/**
 * seed_agents_users.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates a User (role:'agent') record for every agent in the agent_infos
 * collection that has an email.  Also stamps agent_id onto User so the
 * dashboard can look up the agent profile with a single query.
 *
 * Password default  →  Name@123   (e.g. Rakesh Mehta  →  RakeshMehta@123)
 * Run once:  node backend/seed_agents_users.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const Agent    = require('./models/Agent');
const User     = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gujarat_tour_travel';

function makePassword(name) {
  // "Rakesh Mehta" → "RakeshMehta@123"
  const clean = name.replace(/\s+/g, '');
  return `${clean}@123`;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  const agents = await Agent.find({ $or: [{ email: { $exists: true, $ne: '' } }] });
  console.log(`📋 Found ${agents.length} agents in agent_infos collection`);

  let created = 0, skipped = 0, errors = 0;

  for (const agent of agents) {
    if (!agent.email) { skipped++; continue; }

    try {
      // Check if User already exists for this email
      const existing = await User.findOne({ email: agent.email });
      if (existing) {
        // Stamp agent_id if missing
        if (!existing.agent_id) {
          existing.agent_id = agent._id;
          await existing.save();
          console.log(`🔗 Linked existing user ${agent.email} → agent ${agent._id}`);
        } else {
          console.log(`⏭  User already exists: ${agent.email}`);
        }
        skipped++;
        continue;
      }

      const rawPassword = makePassword(agent.name);
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // Build DOB from age (approximate)
      const year = new Date().getFullYear() - (agent.age || 30);
      const dob  = new Date(`${year}-01-01`);

      const user = new User({
        fullName : agent.name,
        email    : agent.email,
        password : hashedPassword,
        phone    : agent.mobile_no ? agent.mobile_no.toString() : '',
        gender   : agent.gender || 'Other',
        dob      : dob,
        role     : 'agent',
        agent_id : agent._id,   // back-link to Agent collection
        profile_completed: true
      });

      await user.save();

      // Stamp manager_id on agent doc so future lookups are fast
      agent.manager_id = user._id;
      await agent.save();

      console.log(`✅ Created user for ${agent.name} (${agent.email}) | pass: ${rawPassword}`);
      created++;

    } catch (err) {
      console.error(`❌ Error for ${agent.email}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n─────────────────────────────────');
  console.log(`✅ Created : ${created}`);
  console.log(`⏭  Skipped : ${skipped}`);
  console.log(`❌ Errors  : ${errors}`);
  console.log('─────────────────────────────────');

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });