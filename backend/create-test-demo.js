const http = require('http');

async function createDemoRequest() {
  const demoData = JSON.stringify({
    fullName: 'Ahmet Yılmaz',
    restaurantName: 'Test Restoran',
    phone: '5551234567',
    email: 'test@restoran.com',
    restaurantType: 'Restoran',
    tableCount: 15
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/demo-requests',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(demoData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('✅ Demo talebi başarıyla oluşturuldu:');
        console.log(JSON.parse(data));
      } else {
        console.log('❌ API Hatası:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Bağlantı hatası:', error.message);
    console.log('\n⚠️  Backend sunucusu çalışmıyor olabilir. Sunucuyu başlatın.');
  });

  req.write(demoData);
  req.end();
}

createDemoRequest();
