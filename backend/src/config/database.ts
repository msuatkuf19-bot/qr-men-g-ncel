/**
 * PostgreSQL Veritabanı Bağlantısı - Prisma Client
 * 
 * Bu dosya Prisma Client'ın tek bir instance'ını (singleton pattern) oluşturur.
 * Böylece uygulama genelinde aynı bağlantı havuzu kullanılır ve
 * gereksiz bağlantı oluşturulması önlenir.
 * 
 * Development ortamında query logları aktif, production'da sadece hata logları
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

// Global tip tanımlaması - Hot reload sırasında prisma instance'ını korumak için
declare global {
  // eslint-disable-next-line no-var
  var prisma: any;
}

/**
 * Prisma Client Instance
 * - Development: Query, error, warn logları aktif
 * - Production: Sadece error logları aktif
 * - Connection pool yönetimi otomatik
 */
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Development ortamında hot reload sırasında yeni instance oluşturulmasını önle
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Graceful Shutdown - Uygulama kapanırken veritabanı bağlantısını temiz kapat
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
