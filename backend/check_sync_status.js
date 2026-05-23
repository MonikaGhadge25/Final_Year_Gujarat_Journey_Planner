const mongoose = require('mongoose');
const Guide = require('./models/guideModel');
const Agent = require('./models/Agent');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gujarat_travel');

async function checkSyncStatus() {
  try {
    console.log('🔍 Checking current sync status...\n');
    
    // Find Sanjay in guides collection
    const guide = await Guide.findOne({ 
      name: { $regex: /sanjay/i }
    });
    
    if (guide) {
      console.log('✅ Guide found:', guide.name);
      console.log('  - District:', guide.district);
      console.log('  - Mobile:', guide.mobile_no);
      console.log('  - Experience:', guide.experience);
      console.log('  - Fees:', guide.fees);
      console.log('  - Language:', guide.language);
    }
    
    // Find Sanjay in agents collection
    const agent = await Agent.findOne({
      $or: [
        { mobile_no: '1234567890' },
        { name: { $regex: /sanjay/i } }
      ]
    });
    
    if (agent) {
      console.log('\n✅ Agent found:', agent.name);
      console.log('  - District:', agent.district);
      console.log('  - Mobile:', agent.mobile_no);
      console.log('  - Experience:', agent.experience);
      console.log('  - Fees:', agent.fees);
      console.log('  - Language:', agent.language);
      console.log('  - Created:', agent.createdAt);
      console.log('  - Updated:', agent.updatedAt);
    } else {
      console.log('\n❌ Agent not found in agents collection');
    }
    
    console.log('\n✅ Status check completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkSyncStatus();