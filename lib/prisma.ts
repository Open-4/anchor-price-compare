import { PrismaClient } from "@prisma/client";

const cleanUrl = (process.env.DATABASE_URL || "").replace(/^\uFEFF/, "");

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: cleanUrl } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
