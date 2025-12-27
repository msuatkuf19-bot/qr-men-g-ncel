const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const admin = await prisma.user.update({
      where: { email: 'admin@qrmenu.com' },
      data: { password: hashedPassword }
    });

    console.log('✅ Admin şifresi sıfırlandı:', admin.email);
    console.log('🔑 Yeni şifre: 123456');
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();