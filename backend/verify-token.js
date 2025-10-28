require('dotenv').config();

const verifyToken = async () => {
  const apiToken = process.env.ENGAGESPARK_API_TOKEN;
  
  console.log('🔍 Verifying EngageSpark API Token...');
  console.log('Token:', apiToken);
  console.log('Token length:', apiToken?.length);
  console.log('Token format check:', /^[a-f0-9]{40}$/.test(apiToken) ? '✅ Valid hex format' : '❌ Invalid format');
  
  // Test basic endpoints to see what works
  const testEndpoints = [
    '/sms',
    '/sms/list', 
    '/account',
    '/profile',
    '/user'
  ];
  
  for (const endpoint of testEndpoints) {
    console.log(`\n📡 Testing GET ${endpoint}...`);
    
    try {
      const response = await fetch(`https://openapi.engagespark.com${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Accept': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.status !== 404) {
        const text = await response.text();
        console.log(`Response: ${text.substring(0, 300)}...`);
      }
      
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
  
  // Check if the token might need to be used differently
  console.log('\n🔧 Testing alternative authentication...');
  
  try {
    const response = await fetch('https://openapi.engagespark.com/sms/list', {
      method: 'GET',
      headers: {
        'X-API-Key': apiToken,
        'Accept': 'application/json'
      }
    });
    
    console.log(`X-API-Key method status: ${response.status}`);
    if (response.status !== 401) {
      const text = await response.text();
      console.log(`Response: ${text.substring(0, 300)}...`);
    }
    
  } catch (error) {
    console.log(`X-API-Key error: ${error.message}`);
  }
};

verifyToken();