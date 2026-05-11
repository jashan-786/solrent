import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
    // For Supabase Pooler (Port 6543), we don't need a manual pg adapter in Next.js
    // We just use the standard PrismaClient with the DATABASE_URL
    return new PrismaClient({
        log: ["error", "warn"],
    });
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}