require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Guide = require('./models/guideModel');
const config = require('./config/config');

// Connect to MongoDB
mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected for sample data creation'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

async function createSampleGuide() {
  try {
    // Sample data similar to the screenshot
    const sampleUserData = {
      fullName: "Priya Sharma",
      email: "priya@travelpro.com", 
      password: "password123",
      role: "guide",
      dob: new Date('1996-03-15'), // This will make her 28 years old
      gender: "Female"
    };

    const sampleGuideData = {
      name: "Priya Sharma",
      district: "Ahmedabad",
      address: "402, Shanti Complex, Ashram Road, Ahmedabad",
      experience: 5,
      age: 28,
      language: ["English", "Hindi", "Gujarati"],
      fees: 2000,
      rating: 4,
      mobile_no: "+91 9876543210",
      gender: "Female",
      username: "priya_sharma_guide",
      password: "password123", // This will be hashed automatically by the model
      email: "priya@travelpro.com",
      role: "guide"
    };

    // Check if user already exists
    let existingUser = await User.findOne({ email: sampleUserData.email });
    if (!existingUser) {
      // Create user first
      console.log('📝 Creating sample user...');
      const hashedPassword = await bcrypt.hash(sampleUserData.password, 10);
      
      const newUser = new User({
        ...sampleUserData,
        password: hashedPassword
      });
      
      existingUser = await newUser.save();
      console.log('✅ Sample user created:', existingUser.fullName);
    } else {
      console.log('ℹ️ User already exists:', existingUser.fullName);
    }

    // Check if guide profile already exists
    let existingGuide = await Guide.findOne({ email: sampleGuideData.email });
    if (!existingGuide) {
      console.log('📝 Creating sample guide profile...');
      
      const newGuide = new Guide(sampleGuideData);
      existingGuide = await newGuide.save();
      console.log('✅ Sample guide profile created:', existingGuide.name);
      console.log('📊 Guide details:', {
        name: existingGuide.name,
        email: existingGuide.email,
        district: existingGuide.district,
        experience: existingGuide.experience + ' years',
        fees: '₹' + existingGuide.fees + ' / day',
        rating: '⭐'.repeat(existingGuide.rating),
        languages: existingGuide.language.join(', ')
      });
    } else {
      console.log('ℹ️ Guide profile already exists:', existingGuide.name);
      console.log('📊 Existing guide details:', {
        name: existingGuide.name,
        email: existingGuide.email,
        district: existingGuide.district,
        experience: existingGuide.experience + ' years',
        fees: '₹' + existingGuide.fees + ' / day',
        rating: '⭐'.repeat(existingGuide.rating),
        languages: existingGuide.language.join(', ')
      });
    }

    console.log('🎉 Sample data creation completed!');
    console.log('💡 You can now login with:');
    console.log('   Email:', sampleUserData.email);
    console.log('   Password:', sampleUserData.password);
    console.log('   User ID:', existingUser._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    process.exit(1);
  }
}

createSampleGuide();
