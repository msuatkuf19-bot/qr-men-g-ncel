/**
 * Prisma Client Singleton Instance
 * 
 * Bu dosya Prisma Client'ın tek bir instance'ını sağlar.
 * Cold start performansını optimize eder ve memory kullanımını azaltır.
 * 
 * Kullanım: import { prisma } from '../config/prisma';
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../services/logger.service';

// Global tip tanımlaması - Hot reload için
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prismaConnected: boolean | undefined;
}

/**
 * Prisma Client Singleton Instance
 * Development'ta hot reload sırasında instance'ı korur
 * Production'da global singleton pattern kullanır
 */
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // Production: Global singleton
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['error'],
    });
    global.__prismaConnected = false;
  }
  prisma = global.__prisma;
} else {
  // Development: Yeni instance veya global'dan al
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
    global.__prismaConnected = false;
  }
  prisma = global.__prisma;
}

/**
 * Database connection warmup
 * İlk request'i hızlandırmak için bağlantıyı önceden kurar
 */
export async function warmupDatabase(): Promise<void> {
  if (global.__prismaConnected) {
    return; // Zaten bağlı
  }

  try {
    await prisma.$connect();
    global.__prismaConnected = true;
    logger.info('Database connection warmed up');
  } catch (error) {
    logger.error('Database warmup failed:', error);
    global.__prismaConnected = false;
    throw error;
  }
}

/**
 * Graceful shutdown için bağlantıyı kapat
 */
export async function closeDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    global.__prismaConnected = false;
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Database disconnect failed:', error);
  }
}

// Export default prisma instance
export { prisma as default };
export { prisma };