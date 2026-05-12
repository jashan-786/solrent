import { PrismaClient } from "@prisma/client";
// Fix BigInt serialization project-wide
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined,
    pool: Pool | undefined,
    adapter: PrismaPg | undefined
};

const createPrismaClient = () => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL is missing");
    }

    if (!globalForPrisma.pool) {
        globalForPrisma.pool = new Pool({
            connectionString,
            max: 1,
            ssl: { rejectUnauthorized: false }
        });
    }

    if (!globalForPrisma.adapter) {
        globalForPrisma.adapter = new PrismaPg(globalForPrisma.pool);
    }

    return new PrismaClient({
        adapter: globalForPrisma.adapter,
        log: ["error", "warn"],
    });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}