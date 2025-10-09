import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var` across multiple hot reloads in dev
  var prisma: PrismaClient | undefined;
}

// Use a single instance of PrismaClient
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
