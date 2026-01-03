const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting enum migration...');
  
  try {
    // 1. Önce mevcut değerleri yeni değerlere çevir
    console.log('Step 1: Updating existing records...');
    
    // CONTACTED -> FOLLOW_UP
    await prisma.$executeRawUnsafe(`
      UPDATE demo_requests 
      SET status = 'FOLLOW_UP'::\"DemoRequestStatus\"
      WHERE status = 'CONTACTED'::\"DemoRequestStatus\"
    `);
    console.log('  ✓ Updated CONTACTED -> FOLLOW_UP');
    
    // CANCELLED -> NEGATIVE
    await prisma.$executeRawUnsafe(`
      UPDATE demo_requests 
      SET status = 'NEGATIVE'::\"DemoRequestStatus\"
      WHERE status = 'CANCELLED'::\"DemoRequestStatus\"
    `);
    console.log('  ✓ Updated CANCELLED -> NEGATIVE');
    
    // NEGATIVE potential'ı NULL yap
    await prisma.$executeRawUnsafe(`
      UPDATE demo_requests 
      SET potential = NULL
      WHERE potential = 'NEGATIVE'::\"DemoRequestPotential\"
    `);
    console.log('  ✓ Cleared NEGATIVE potential');
    
    // 2. Enum değerlerini güncelle
    console.log('\nStep 2: Updating enum types...');
    
    // Status enum'unu güncelle
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "DemoRequestStatus" RENAME VALUE 'CONTACTED' TO 'CONTACTED_OLD'
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "DemoRequestStatus" RENAME VALUE 'CANCELLED' TO 'CANCELLED_OLD'
    `);
    
    // Yeni değerleri ekle
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "DemoRequestStatus" ADD VALUE IF NOT EXISTS 'FOLLOW_UP'
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "DemoRequestStatus" ADD VALUE IF NOT EXISTS 'NEGATIVE'
    `);
    
    console.log('  ✓ Status enum updated');
    
    // Potential enum'dan NEGATIVE'i kaldıramayız ama önemsemeyiz
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
