import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const createPrismaClient = () => {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("CRITICAL: Database connection string missing! Check your .env file.");
    } else {
        console.log("Prisma connecting with:", connectionString.split("@")[1]);
    }
    const pool = new pg.Pool({ 
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ 
        adapter,
        log: ["query"], 
    });
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined; };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") { 
    globalForPrisma.prisma = prisma; 
}