/**
 * PostgreSQL Veritabanı Bağlantısı - Prisma Client
 * 
 * Bu dosya Prisma Client'ın tek bir instance'ını (singleton pattern) oluşturur.
 * Böylece uygulama genelinde aynı bağlantı havuzu kullanılır ve
 * gereksiz bağlantı oluşturulması önlenir.
 * 
 * Development ortamında query logları aktif, production'da sadece hata logları
 * 
 * Supabase Pooler (Supavisor) ile optimize edilmiştir:
 * - connection_limit: Pooler bağlantı limiti (çok yüksek değil)
 * - pool_timeout: Bağlantı havuzu timeout süresi
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');

// Global tip tanımlaması - Hot reload sırasında prisma instance'ını korumak için
declare global {
  // eslint-disable-next-line no-var
  var __prisma: any | undefined;
  // eslint-disable-next-line no-var
  var __prismaConnected: boolean | undefined;
}

/**
 * Prisma Client Instance - Singleton Pattern
 * - Development: Query, error, warn logları aktif
 * - Production: Sadece error logları aktif
 * - Global singleton: Her ortamda tek instance garanti edilir
 */
let prisma: any;

if (global.__prisma) {
  prisma = global.__prisma;
} else {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
  
  // Global'e kaydet - serverless cold start için kritik
  if (process.env.NODE_ENV === 'production') {
    global.__prisma = prisma;
    global.__prismaConnected = false;
  }
}

/**
 * Bağlantıyı önceden ısıtma (warm-up) - OPTIMIZE EDİLDİ
 * İlk isteği hızlandırmak için uygulama başlarken bağlantı kurulur
 * Singleton pattern ile sadece bir kez çalışır
 */
export async function warmupDatabase(): Promise<void> {
  // Zaten bağlı ise hızlıca çık
  if (global.__prismaConnected) {
    return;
  }
  
  const startTime = Date.now();
  console.log('[DB] Veritabanı bağlantısı ısıtılıyor...');
  
  try {
    // Hafif bir query ile bağlantıyı test et
    await prisma.$queryRaw`SELECT 1`;
    global.__prismaConnected = true;
    const duration = Date.now() - startTime;
    console.log(`[DB] Veritabanı bağlantısı hazır (${duration}ms)`);
    
    // İlk bağlantı çok yavaşsa uyar
    if (duration > 2000) {
      console.warn(`[DB][SLOW] Database warmup took ${duration}ms - Check Supabase pooler config`);
    }
  } catch (error) {
    console.error('[DB] Veritabanı bağlantı hatası:', error);
    global.__prismaConnected = false;
    throw error;
  }
}

/**
 * Timing log'lu query wrapper
 * Query performansını ölçmek için kullanılır
 */
export async function timedQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  const result = await queryFn();
  const duration = Date.now() - startTime;
  
  if (duration > 100) {
    console.log(`[DB][SLOW] ${queryName}: ${duration}ms`);
  } else if (process.env.NODE_ENV === 'development') {
    console.log(`[DB] ${queryName}: ${duration}ms`);
  }
  
  return { result, duration };
}

/**
 * Graceful Shutdown - Uygulama kapanırken veritabanı bağlantısını temiz kapat
 */
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
    global.__prismaConnected = false;
    console.log('[DB] Veritabanı bağlantısı kapatıldı');
  } catch (error) {
    console.error('[DB] Bağlantı kapatma hatası:', error);
  }
});

export default prisma;
