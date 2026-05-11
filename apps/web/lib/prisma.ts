import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
    return new PrismaClient({
        log: ["error", "warn"],
    });
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}