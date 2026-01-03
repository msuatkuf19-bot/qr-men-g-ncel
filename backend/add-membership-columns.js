const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Add columns using raw SQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE demo_requests 
      ADD COLUMN IF NOT EXISTS "membershipStartDate" TEXT,
      ADD COLUMN IF NOT EXISTS "membershipEndDate" TEXT;
    `);

    console.log('✅ Membership date columns added successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
