// Quick debug of actual transport API response
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const transportController = require('./controllers/transportcontroller');

async function testAPI() {
  try {
    await connectDB();
    
    // Create mock request/response to test controller
    const req = {};
    const res = {
      json: (data) => {
        console.log('\n=== ACTUAL API RESPONSE ===');
        console.log('Total records:', data.length);
        
        if (data.length > 0) {
          console.log('\nFirst record structure:');
          console.log(JSON.stringify(data[0], null, 2));
          
          console.log('\nKey-value analysis:');
          Object.keys(data[0]).forEach(key => {
            console.log(`${key}: ${typeof data[0][key]} = ${data[0][key]}`);
          });
        }
        
        process.exit(0);
      },
      status: (code) => ({
        json: (error) => {
          console.error('Error:', code, error);
          process.exit(1);
        }
      })
    };
    
    console.log('Testing transport controller...');
    await transportController.getTransports(req, res);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testAPI();