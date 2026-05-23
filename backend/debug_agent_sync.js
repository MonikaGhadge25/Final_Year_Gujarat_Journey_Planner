const mongoose = require('mongoose');
const Guide = require('./models/guideModel');
const Agent = require('./models/Agent');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gujarat_travel', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function debugAgentSync() {
  try {
    console.log('🔍 Debugging Agent Profile Sync for Sanjay Chauhan...\n');
    
    // 1. Find Sanjay's guide profile
    const guide = await Guide.findOne({ 
      name: { $regex: /sanjay/i }
    });
    
    if (!guide) {
      console.log('❌ No guide found with name containing "Sanjay"');
      
      // Let's see what guides exist
      const allGuides = await Guide.find({}, 'name email district mobile_no');
      console.log('\n📋 All guides in database:');
      allGuides.forEach(g => {
        console.log(`- ${g.name} (${g.email}) - District: ${g.district}, Phone: ${g.mobile_no}`);
      });
      return;
    }
    
    console.log('✅ Found guide profile:');
    console.log('Guide Data:', {
      _id: guide._id,
      name: guide.name,
      email: guide.email,
      district: guide.district,
      mobile_no: guide.mobile_no,
      experience: guide.experience,
      age: guide.age,
      language: guide.language,
      fees: guide.fees,
      rating: guide.rating,
      gender: guide.gender
    });
    
    // 2. Check profile completeness
    function isProfileComplete(guideData) {
      const requiredFields = ['name', 'gender', 'district', 'mobile_no', 'experience', 'language', 'fees'];
      return requiredFields.every(field => {
        const value = guideData[field];
        console.log(`Checking field '${field}': ${JSON.stringify(value)}`);
        
        if (field === 'language') {
          const isValid = value && Array.isArray(value) && value.length > 0 && 
                         !(value.length === 1 && value[0] === 'English');
          console.log(`  Language validation: ${isValid}`);
          return isValid;
        }
        
        const isValid = value && value !== 'Not specified' && value !== 0;
        console.log(`  Field '${field}' validation: ${isValid}`);
        return isValid;
      });
    }
    
    console.log('\n🔍 Profile Completeness Check:');
    const profileComplete = isProfileComplete(guide);
    console.log(`Profile Complete: ${profileComplete}\n`);
    
    // 3. Check if agent already exists in agents collection
    const existingAgent = await Agent.findOne({
      $or: [
        { mobile_no: guide.mobile_no },
        { name: guide.name, district: guide.district }
      ]
    });
    
    if (existingAgent) {
      console.log('✅ Found existing agent in agents collection:');
      console.log('Agent Data:', {
        _id: existingAgent._id,
        name: existingAgent.name,
        district: existingAgent.district,
        mobile_no: existingAgent.mobile_no,
        experience: existingAgent.experience,
        age: existingAgent.age,
        language: existingAgent.language,
        fees: existingAgent.fees,
        rating: existingAgent.rating,
        gender: existingAgent.gender
      });
    } else {
      console.log('❌ No matching agent found in agents collection');
    }
    
    // 4. If profile is complete, try manual sync
    if (profileComplete) {
      console.log('\n🔄 Attempting manual sync to agents collection...');
      
      const agentData = {
        name: guide.name,
        district: guide.district,
        age: guide.age,
        language: guide.language,
        experience: guide.experience,
        fees: guide.fees ? guide.fees.toString() : '0',
        rating: guide.rating || 3,
        mobile_no: guide.mobile_no,
        gender: guide.gender,
        image: guide.image || 'assets/images/default-avatar.jpg'
      };
      
      console.log('Agent data to sync:', agentData);
      
      try {
        if (existingAgent) {
          const updatedAgent = await Agent.findByIdAndUpdate(
            existingAgent._id,
            agentData,
            { new: true, runValidators: true }
          );
          console.log('✅ Successfully updated agent in agents collection');
          console.log('Updated agent:', updatedAgent);
        } else {
          const newAgent = new Agent(agentData);
          await newAgent.save();
          console.log('✅ Successfully created new agent in agents collection');
          console.log('New agent:', newAgent);
        }
      } catch (error) {
        console.log('❌ Error syncing to agents collection:', error.message);
        if (error.errors) {
          Object.keys(error.errors).forEach(field => {
            console.log(`  - ${field}: ${error.errors[field].message}`);
          });
        }
      }
    } else {
      console.log('⚠️ Profile is incomplete - not syncing to agents collection');
      console.log('Missing or invalid fields need to be filled');
    }
    
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    mongoose.disconnect();
  }
}

debugAgentSync();