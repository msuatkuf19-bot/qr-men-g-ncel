/**
 * Prisma Client Singleton Instance
 * 
 * Bu dosya Prisma Client'ın tek bir instance'ını sağlar.
 * Cold start performansını optimize eder ve memory kullanımını azaltır.
 * 
 * Kullanım: import { prisma } from '../config/prisma';
 */

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}