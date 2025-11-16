import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `var` across multiple hot reloads in dev
  var prisma: PrismaClient | undefined;
}

// Use a single instance of PrismaClient with optimized settings
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Graceful shutdown
// process.on('beforeExit', async () => {
//   await prisma.$disconnect();
// });
