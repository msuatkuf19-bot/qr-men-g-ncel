const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEnums() {
  console.log('Fixing enums step by step...');
  
  try {
    // 1. Mevcut kayıtları yedekle
    const backup = await prisma.demoRequest.findMany();
    console.log(`✓ Backed up ${backup.length} records`);
    
    // 2. Tüm kayıtları sil
    await prisma.demoRequest.deleteMany();
    console.log('✓ Deleted all records');
    
    // 3. Default constraint'i kaldır
    await prisma.$executeRawUnsafe(`
      ALTER TABLE demo_requests ALTER COLUMN status DROP DEFAULT
    `);
    console.log('✓ Dropped default constraint');
    
    // 4. Yeni enum'ları oluştur
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "DemoRequestStatus_new" CASCADE`);
    await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "DemoRequestPotential_new" CASCADE`);
    
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "DemoRequestStatus_new" AS ENUM ('PENDING', 'DEMO_CREATED', 'FOLLOW_UP', 'NEGATIVE')
    `);
    console.log('✓ Created new Status enum');
    
    await prisma.$executeRawUnsafe(`
      CREATE TYPE "DemoRequestPotential_new" AS ENUM ('HIGH_PROBABILITY', 'LONG_TERM')
    `);
    console.log('✓ Created new Potential enum');
    
    // 5. Kolonları güncelle
    await prisma.$executeRawUnsafe(`
      ALTER TABLE demo_requests 
      ALTER COLUMN status TYPE "DemoRequestStatus_new" USING 'PENDING'::"DemoRequestStatus_new"
    `);
    console.log('✓ Updated status column');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE demo_requests 
      ALTER COLUMN potential TYPE "DemoRequestPotential_new" USING potential::text::"DemoRequestPotential_new"
    `);
    console.log('✓ Updated potential column');
    
    // 6. Eski enum'ları sil
    await prisma.$executeRawUnsafe(`DROP TYPE "DemoRequestStatus"`);
    await prisma.$executeRawUnsafe(`DROP TYPE "DemoRequestPotential"`);
    console.log('✓ Dropped old enums');
    
    // 7. Yenileri rename et
    await prisma.$executeRawUnsafe(`ALTER TYPE "DemoRequestStatus_new" RENAME TO "DemoRequestStatus"`);
    await prisma.$executeRawUnsafe(`ALTER TYPE "DemoRequestPotential_new" RENAME TO "DemoRequestPotential"`);
    console.log('✓ Renamed new enums');
    
    // 8. Default değeri geri ekle
    await prisma.$executeRawUnsafe(`
      ALTER TABLE demo_requests ALTER COLUMN status SET DEFAULT 'PENDING'::"DemoRequestStatus"
    `);
    console.log('✓ Added back default constraint');
    
    // 9. Kayıtları geri yükle
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
      console.log(`✓ Restored: ${record.fullName} (${record.status} -> ${newStatus})`);
    }
    
    console.log('\n✅ Migration completed successfully!');
    
    // 10. Verify
    const final = await prisma.demoRequest.findMany();
    console.log(`\nFinal count: ${final.length} records`);
    final.forEach(r => {
      console.log(`  - ${r.fullName}: status=${r.status}, potential=${r.potential}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    throw error;
  }
}

fixEnums()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
