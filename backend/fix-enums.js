const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEnums() {
  console.log('Fixing enums with manual SQL...');
  
  try {
    // 1. Mevcut kayıtları yedekle
    const backup = await prisma.demoRequest.findMany();
    console.log(`Backed up ${backup.length} records`);
    console.log(JSON.stringify(backup, null, 2));
    
    // 2. Tüm kayıtları sil
    await prisma.demoRequest.deleteMany();
    console.log('Deleted all records');
    
    // 3. Enum'ları tamamen yeniden oluştur
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "DemoRequestStatus_new" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "DemoRequestPotential_new" CASCADE`);
    
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "DemoRequestStatus_new" AS ENUM ('PENDING', 'DEMO_CREATED', 'FOLLOW_UP', 'NEGATIVE')
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "DemoRequestPotential_new" AS ENUM ('HIGH_PROBABILITY', 'LONG_TERM')
    `);
    
    // 4. Tabloyu güncelle
    await prisma.$executeRawUnsafe(`
      ALTER TABLE demo_requests 
      ALTER COLUMN status TYPE "DemoRequestStatus_new" USING status::text::"DemoRequestStatus_new"
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE demo_requests 
      ALTER COLUMN potential TYPE "DemoRequestPotential_new" USING potential::text::"DemoRequestPotential_new"
    `);
    
    // 5. Eski enum'ları sil, yenileri rename et
    await prisma.$executeRawUnsafe(`DROP TYPE "DemoRequestStatus"`);
    await prisma.$executeRawUnsafe(`DROP TYPE "DemoRequestPotential"`);
    
    await prisma.$executeRawUnsafe(`ALTER TYPE "DemoRequestStatus_new" RENAME TO "DemoRequestStatus"`);
    await prisma.$executeRawUnsafe(`ALTER TYPE "DemoRequestPotential_new" RENAME TO "DemoRequestPotential"`);
    
    console.log('Enums updated successfully');
    
    // 6. Kayıtları geri yükle (değerleri çevirerek)
    for (const record of backup) {
      let newStatus = record.status;
      if (record.status === 'CONTACTED') newStatus = 'FOLLOW_UP';
      if (record.status === 'CANCELLED') newStatus = 'NEGATIVE';
      
      let newPotential = record.potential;
      if (record.potential === 'NEGATIVE') newPotential = null;
      
      await prisma.demoRequest.create({
        data: {
          id: record.id,
          fullName: record.fullName,
          restaurantName: record.restaurantName,
          phone: record.phone,
          email: record.email,
          restaurantType: record.restaurantType,
          tableCount: record.tableCount,
          status: newStatus,
          potential: newPotential,
          followUpMonth: record.followUpMonth,
          createdAt: record.createdAt,
        }
      });
      console.log(`Restored record ${record.id}: ${record.status} -> ${newStatus}`);
    }
    
    console.log('\n✅ All done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

fixEnums()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
