const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL. Add it to your environment variables or .env file."
  );
}

const globalForPrisma = globalThis;

const pool =
  globalForPrisma.__prismaPool ??
  new Pool({
    connectionString,
  });

const prisma =
  globalForPrisma.__prismaClient ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prismaPool = pool;
  globalForPrisma.__prismaClient = prisma;
}

async function connectDB() {
  await prisma.$connect();
  return prisma;
}

async function disconnectDB() {
  await prisma.$disconnect();
  await pool.end();
}

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
};
