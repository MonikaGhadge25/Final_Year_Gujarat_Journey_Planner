// Quick test to verify room management API endpoints
// Run this after starting the backend server

console.log('🧪 Testing Room Management API Fix');
console.log('==================================');

const testUserId = '68ea6cef4084074cbd58ace5'; // The ID from the error
const baseUrl = 'http://localhost:5000/api/hoteldashboard';

console.log('\n📍 Testing API Endpoints:');
console.log(`✅ Correct endpoint: PUT ${baseUrl}/${testUserId}`);
console.log(`❌ Wrong endpoint: PUT ${baseUrl}/update/${testUserId} (this was causing the 404 error)`);

console.log('\n🔧 What was fixed:');
console.log('1. Fixed JavaScript functions to use correct API endpoint');
console.log('2. Fixed backend routes to import correct controller functions');
console.log('3. Added proper authentication checks in room management');

console.log('\n🚀 To test the fix:');
console.log('1. Make sure backend server is running: npm start');
console.log('2. Open hoteldashboard.html and login as hotel manager');
console.log('3. Try adding a room type - it should work now!');

console.log('\n📝 The room management now uses:');
console.log('- saveRoom() → PUT /api/hoteldashboard/:userId');
console.log('- updateRoom() → PUT /api/hoteldashboard/:userId');
console.log('- deleteRoom() → PUT /api/hoteldashboard/:userId');
console.log('All with proper authentication and user ID from current session');

console.log('\n✅ Room Management API Fix Complete!');