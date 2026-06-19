import { PrismaClient } from "@prisma/client";

const rawUrl = process.env.DATABASE_URL || "";
const cleanUrl = rawUrl.replace(/^\uFEFF/, "");

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: { db: { url: cleanUrl } },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
