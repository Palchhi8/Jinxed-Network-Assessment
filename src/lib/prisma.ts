import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  // Create a connection pool using Node pg
  const pool = new Pool({
    connectionString,
    // Add production-grade configuration options for connection limits if necessary
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Wrap the pg pool in the PrismaPg adapter
  const adapter = new PrismaPg(pool);

  // Initialize the PrismaClient with the driver adapter
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  return {
    pool,
    client,
  };
};

declare const globalThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Initialize or reuse the singleton instance
const globalPrisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = globalPrisma;
}

// Export the pg connection pool for direct/raw queries if ever needed
export const pool = globalPrisma.pool;

// Export the Prisma Client instance
export const prisma = globalPrisma.client;

export default prisma;
