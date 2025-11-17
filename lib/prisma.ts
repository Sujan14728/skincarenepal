import { PrismaClient } from '@prisma/client';

function appendPoolParams(url: string | undefined) {
  if (!url) return url;
  try {
    const hasQuery = url.includes('?');
    const sep = hasQuery ? '&' : '?';
    // Add conservative pool settings to reduce timeouts/exhaustion
    const extra = 'connection_limit=5&pool_timeout=30&connect_timeout=30';
    if (url.includes('connection_limit') || url.includes('pool_timeout')) {
      return url; // already tuned
    }
    return `${url}${sep}${extra}`;
  } catch {
    return url;
  }
}

declare global {
  // Allow global `var` across multiple hot reloads in dev
  var prisma: PrismaClient | undefined;
}

// Use a single instance of PrismaClient with optimized settings
const tunedUrl = appendPoolParams(process.env.DATABASE_URL);

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
    datasources: tunedUrl ? { db: { url: tunedUrl } } : undefined
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Graceful shutdown
// process.on('beforeExit', async () => {
//   await prisma.$disconnect();
// });
