const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.demoRequest.findMany();
  console.log('Demo Requests:', JSON.stringify(requests, null, 2));
  
  // Mevcut değerleri kontrol et
  const statusCounts = {};
  const potentialCounts = {};
  
  requests.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    if (r.potential) {
      potentialCounts[r.potential] = (potentialCounts[r.potential] || 0) + 1;
    }
  });
  
  console.log('\nStatus counts:', statusCounts);
  console.log('Potential counts:', potentialCounts);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
