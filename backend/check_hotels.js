require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gujarat_travel')
  .then(async () => {
    const hotels = await mongoose.connection.db.collection('hotels')
      .find({}, { projection: { 'hotel_details.hotel_name': 1, 'manager_email': 1, 'manager_id': 1 } })
      .toArray();
    
    console.log(`\nTotal hotels in DB: ${hotels.length}\n`);
    console.log('All hotel names:');
    console.log('─'.repeat(60));
    hotels.forEach((h, i) => {
      const name = h.hotel_details?.hotel_name || 'NO NAME';
      const linked = h.manager_id ? '✅ linked' : '❌ not linked';
      console.log(`${String(i+1).padStart(2)}. ${name.padEnd(45)} ${linked}`);
    });
    await mongoose.disconnect();
  });