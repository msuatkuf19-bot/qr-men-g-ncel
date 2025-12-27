const fetch = require('node-fetch');

async function createTestDemoRequest() {
    try {
        const response = await fetch('http://localhost:5000/api/demo-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: 'Test Kullanıcı',
                restaurantName: 'Test Restoran',
                phone: '+905551234567',
                email: 'test@example.com',
                restaurantType: 'Cafe',
                tableCount: 10
            })
        });

        const result = await response.json();
        console.log('Demo request created:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

createTestDemoRequest();