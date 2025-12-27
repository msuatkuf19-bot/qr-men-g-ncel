const fetch = require('node-fetch');

async function testQREndpoint() {
  console.log('=== QR ENDPOINT PERFORMANCE TEST ===');
  
  const slug = 'lezzeli-tavuk';
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test 1: Lite mode
    console.log('\n1. Testing LITE MODE...');
    const liteStart = Date.now();
    const liteResponse = await fetch(`${baseUrl}/api/public/menu/${slug}?lite=true`);
    const liteData = await liteResponse.json();
    const liteDuration = Date.now() - liteStart;
    
    console.log(`   ✅ Lite mode response: ${liteDuration}ms`);
    console.log(`   📊 Categories: ${liteData.data?.categories?.length || 0}`);
    console.log(`   📦 Total products: ${liteData.data?._meta?.totalProductsShown || 0}`);
    
    // Test 2: Normal mode
    console.log('\n2. Testing NORMAL MODE...');
    const normalStart = Date.now();
    const normalResponse = await fetch(`${baseUrl}/api/public/menu/${slug}`);
    const normalData = await normalResponse.json();
    const normalDuration = Date.now() - normalStart;
    
    console.log(`   ✅ Normal mode response: ${normalDuration}ms`);
    console.log(`   📊 Categories: ${normalData.data?.categories?.length || 0}`);
    console.log(`   📦 Total products: ${normalData.data?._meta?.totalProductsShown || normalData.data?.categories?.reduce((sum, cat) => sum + (cat.products?.length || 0), 0) || 0}`);
    
    // Test 3: Lazy load a specific category
    if (normalData.data?.categories?.length > 0) {
      const firstCategoryId = normalData.data.categories[0].id;
      console.log(`\n3. Testing LAZY LOAD (categoryId: ${firstCategoryId})...`);
      const lazyStart = Date.now();
      const lazyResponse = await fetch(`${baseUrl}/api/public/menu/${slug}?lazy=true&categoryId=${firstCategoryId}`);
      const lazyData = await lazyResponse.json();
      const lazyDuration = Date.now() - lazyStart;
      
      console.log(`   ✅ Lazy load response: ${lazyDuration}ms`);
      console.log(`   📦 Products in category: ${lazyData.data?.products?.length || 0}`);
    }
    
    console.log('\n=== PERFORMANCE COMPARISON ===');
    console.log(`Lite mode:   ${liteDuration}ms`);
    console.log(`Normal mode: ${normalDuration}ms`);
    console.log(`Improvement: ${((normalDuration - liteDuration) / normalDuration * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Make sure backend is running on http://localhost:5000');
    }
  }
}

// Wait 2 seconds and run test
setTimeout(testQREndpoint, 2000);