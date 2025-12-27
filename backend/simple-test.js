const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    const req = http.get(url, (res) => {
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
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function test() {
  console.log('=== QR Performance Test ===\n');
  
  try {
    // Test health check first
    console.log('1. Testing health check...');
    const health = await makeRequest('http://localhost:5000/health');
    console.log(`   ✅ Health: ${health.duration}ms (${health.status})\n`);
    
    // Test lite mode
    console.log('2. Testing LITE mode...');
    const lite = await makeRequest('http://localhost:5000/api/public/menu/lezzeli-tavuk?lite=true');
    console.log(`   ✅ Lite: ${lite.duration}ms (${lite.status})`);
    if (lite.json?.data?._meta) {
      console.log(`   📊 Products: ${lite.json.data._meta.totalProductsShown}`);
    }
    
    // Test normal mode
    console.log('\n3. Testing NORMAL mode...');
    const normal = await makeRequest('http://localhost:5000/api/public/menu/lezzeli-tavuk');
    console.log(`   ✅ Normal: ${normal.duration}ms (${normal.status})`);
    if (normal.json?.data?.categories) {
      const total = normal.json.data.categories.reduce((sum, cat) => sum + (cat.products?.length || 0), 0);
      console.log(`   📊 Products: ${total}`);
    }
    
    console.log(`\n=== RESULTS ===`);
    console.log(`Lite mode:   ${lite.duration}ms`);
    console.log(`Normal mode: ${normal.duration}ms`);
    if (lite.duration > 0 && normal.duration > 0) {
      const improvement = Math.round(((normal.duration - lite.duration) / normal.duration) * 100);
      console.log(`Improvement: ${improvement}%`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setTimeout(test, 2000);