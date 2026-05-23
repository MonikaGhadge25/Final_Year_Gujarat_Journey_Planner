async function debugAuthResponse() {
  console.log('🔍 Debugging Authentication Response Structure');
  
  try {
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bhanu123@gmail.com',
        password: 'bhanu123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('\n=== Full Login Response ===');
    console.log(JSON.stringify(loginData, null, 2));
    
    console.log('\n=== Key Analysis ===');
    console.log('loginData.user:', loginData.user);
    console.log('loginData.user.id:', loginData.user?.id);
    console.log('loginData.user._id:', loginData.user?._id);
    console.log('loginData.token:', !!loginData.token);
    
    // Check all possible ID fields
    const possibleIds = [
      'loginData.user.id',
      'loginData.user._id', 
      'loginData.user.userId',
      'loginData.userId',
      'loginData.id',
      'loginData._id'
    ];
    
    console.log('\n=== All Possible ID Fields ===');
    possibleIds.forEach(path => {
      const value = eval(path.replace('loginData', 'loginData'));
      console.log(`${path}: ${value}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugAuthResponse();