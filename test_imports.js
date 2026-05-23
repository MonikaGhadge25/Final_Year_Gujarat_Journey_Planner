// Test script to verify imports work correctly
console.log('🧪 Testing Hotel Dashboard Controller Imports');
console.log('============================================');

try {
    console.log('📋 Loading controller...');
    const controller = require('./backend/controllers/hoteldashboardcontroller.js');
    
    console.log('✅ Controller loaded successfully!');
    console.log('\n📋 Available Functions:');
    
    const functions = Object.keys(controller);
    functions.forEach(func => {
        console.log(`✅ ${func} - ${typeof controller[func]}`);
    });
    
    console.log(`\n📊 Total functions exported: ${functions.length}`);
    
    // Test routes import
    console.log('\n📋 Testing routes import...');
    const router = require('./backend/routes/hoteldashboardroutes.js');
    console.log('✅ Routes loaded successfully!');
    
    console.log('\n🎉 All imports working correctly!');
    console.log('✅ The server should start without import errors now.');
    
} catch (error) {
    console.error('❌ Import Error:', error.message);
    console.error('Stack:', error.stack);
}

console.log('\n🚀 Ready to start server: npm start or node server.js');