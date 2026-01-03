/**
 * Prisma Client Singleton Instance
 * 
 * Bu dosya Prisma Client'ın tek bir instance'ını sağlar.
 * Cold start performansını optimize eder ve memory kullanımını azaltır.
 * 
 * Kullanım: import { prisma } from '../config/prisma';
 */

import { PrismaClient } from '@prisma/client';

// Global tip tanımlaması - Hot reload için
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma Client Singleton Instance
 * Development'ta hot reload sırasında instance'ı korur
 * Production'da global singleton pattern kullanır
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}