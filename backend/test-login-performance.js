const http = require('http');

function makeLoginRequest(email, password) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    const postData = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        try {
          const json = JSON.parse(data);
          resolve({ duration, json, status: res.statusCode });
        } catch (e) {
          resolve({ duration, data, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Login timeout'));
    });
    
    req.write(postData);
    req.end();
  });
}

async function testLogin() {
  console.log('=== LOGIN PERFORMANCE TEST ===\n');
  
  try {
    // Test 1: Valid login
    console.log('1. Testing VALID login...');
    const validLogin = await makeLoginRequest('admin@qrmenu.com', 'admin123');
    console.log(`   ✅ Valid login: ${validLogin.duration}ms (${validLogin.status})`);
    if (validLogin.json?.success) {
      console.log(`   👤 User: ${validLogin.json.data?.user?.name} (${validLogin.json.data?.user?.role})`);
    }
    
    // Test 2: Invalid login
    console.log('\n2. Testing INVALID login...');
    const invalidLogin = await makeLoginRequest('invalid@test.com', 'wrongpassword');
    console.log(`   ❌ Invalid login: ${invalidLogin.duration}ms (${invalidLogin.status})`);
    if (invalidLogin.json?.message) {
      console.log(`   📝 Message: ${invalidLogin.json.message}`);
    }
    
    console.log(`\n=== LOGIN RESULTS ===`);
    console.log(`Valid login:   ${validLogin.duration}ms`);
    console.log(`Invalid login: ${invalidLogin.duration}ms`);
    
    // Performance analysis
    if (validLogin.duration < 1000) {
      console.log('🚀 EXCELLENT: Login is fast!');
    } else if (validLogin.duration < 2000) {
      console.log('✅ GOOD: Login is acceptable');
    } else if (validLogin.duration < 5000) {
      console.log('⚠️  SLOW: Login needs optimization');
    } else {
      console.log('🐌 VERY SLOW: Critical performance issue');
    }
    
  } catch (error) {
    console.error('❌ Login test error:', error.message);
  }
}

setTimeout(testLogin, 1000);