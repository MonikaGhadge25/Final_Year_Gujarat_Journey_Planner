const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

// Import models
const User = require('./models/User');

// Clean up old/duplicate user accounts
const cleanupOldUsers = async () => {
  try {
    await connectDB();

    console.log('🧹 Cleaning Up Old/Duplicate User Accounts\n');

    // Find all users with Hotel Blueivy email
    const managerEmail = 'hotelblueivyanand@gmail.com';
    const users = await User.find({ email: managerEmail });

    console.log(`Found ${users.length} user(s) with email: ${managerEmail}`);

    if (users.length <= 1) {
      console.log('✅ No duplicate users found, nothing to clean up');
      return;
    }

    // Identify which user to keep (the one with properly hashed password)
    let keepUser = null;
    let deleteUsers = [];

    for (const user of users) {
      console.log(`\n👤 User ID: ${user._id}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.fullName}`);
      console.log(`🔐 Password: ${user.password ? user.password.substring(0, 30) + '...' : 'NONE'}`);
      
      // Check if password is properly hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
        console.log('✅ Password is properly hashed');
        if (!keepUser) {
          keepUser = user;
          console.log('🔒 This user will be KEPT');
        } else {
          console.log('⚠️ This user will be DELETED (duplicate with hashed password)');
          deleteUsers.push(user);
        }
      } else {
        console.log('❌ Password is NOT properly hashed');
        console.log('🗑️ This user will be DELETED');
        deleteUsers.push(user);
      }
    }

    if (keepUser) {
      console.log(`\n✅ Keeping user: ${keepUser.fullName} (${keepUser._id})`);
    } else {
      console.log('\n❌ No user with properly hashed password found!');
      return;
    }

    // Delete old/duplicate users
    for (const user of deleteUsers) {
      console.log(`🗑️ Deleting user: ${user.fullName} (${user._id})`);
      await User.findByIdAndDelete(user._id);
      console.log('   ✅ Deleted');
    }

    console.log(`\n🎯 Cleanup Summary:`);
    console.log(`- Users found: ${users.length}`);
    console.log(`- Users kept: 1`);
    console.log(`- Users deleted: ${deleteUsers.length}`);

    if (keepUser) {
      console.log(`\n📋 Final Login Credentials:`);
      console.log(`📧 Email: ${keepUser.email}`);
      console.log(`🔐 Password: temporary_password_123`);
      console.log(`🎭 Role: ${keepUser.role}`);
      console.log(`🆔 User ID: ${keepUser._id}`);
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Check for any users with plain text passwords
const findPlainTextPasswords = async () => {
  try {
    await connectDB();

    console.log('🔍 Checking for Users with Plain Text Passwords\n');

    // Find all hotel role users
    const hotelUsers = await User.find({ role: 'hotel' });
    console.log(`Found ${hotelUsers.length} hotel users`);

    for (const user of hotelUsers) {
      console.log(`\n👤 ${user.fullName} (${user.email})`);
      console.log(`🆔 ID: ${user._id}`);
      
      if (!user.password) {
        console.log('❌ No password set!');
      } else if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log('✅ Password properly hashed');
      } else {
        console.log('❌ Password appears to be plain text!');
        console.log(`🔐 Password: ${user.password}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking passwords:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0] || 'cleanup';

  switch (command) {
    case 'cleanup':
      await cleanupOldUsers();
      break;
    case 'check':
      await findPlainTextPasswords();
      break;
    case 'both':
      await findPlainTextPasswords();
      console.log('\n' + '='.repeat(50) + '\n');
      await cleanupOldUsers();
      break;
    default:
      console.log('Usage: node cleanup_old_users.js [cleanup|check|both]');
      console.log('  cleanup - Remove duplicate/old user accounts');
      console.log('  check   - Check for plain text passwords');
      console.log('  both    - Run both operations');
      break;
  }
};

// Run if called directly
if (require.main === module) {
  main();
}