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
const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

/**
 * Prisma Client Singleton Instance
 * Development'ta hot reload sırasında instance'ı korur
 * Production'da global singleton pattern kullanır
 */
export const prisma = prismaGlobal.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  prismaGlobal.prisma = prisma;
}