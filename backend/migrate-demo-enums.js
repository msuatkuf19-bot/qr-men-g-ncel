const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Migrating demo requests...');
  
  // Mevcut kayıtları al
  const requests = await prisma.$queryRaw`
    SELECT id, status, potential FROM demo_requests
  `;
  
  console.log(`Found ${requests.length} demo requests`);
  
  // Status mapping: CONTACTED -> FOLLOW_UP, CANCELLED -> NEGATIVE
  for (const req of requests) {
    let newStatus = req.status;
    let newPotential = req.potential;
    
    // Status güncellemeleri
    if (req.status === 'CONTACTED') {
      newStatus = 'FOLLOW_UP';
    } else if (req.status === 'CANCELLED') {
      newStatus = 'NEGATIVE';
    }
    
    // Potential güncellemeleri - NEGATIVE potansiyeli varsa kaldır
    if (req.potential === 'NEGATIVE') {
      newPotential = null;
    }
    
    // Güncelle
    await prisma.$executeRaw`
      UPDATE demo_requests 
      SET status = ${newStatus}::text, potential = ${newPotential}::text
      WHERE id = ${req.id}
    `;
    
    console.log(`Updated ${req.id}: ${req.status} -> ${newStatus}, ${req.potential} -> ${newPotential}`);
  }
  
  console.log('Migration completed!');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
