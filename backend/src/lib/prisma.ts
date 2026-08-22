import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "../config/env";

// Prisma 7 requires a driver adapter; the generated client is imported
// from the prisma-client generator output (generated/prisma).
function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== "production") {
  // Cache the instance so tsx/nodemon hot reloads reuse the same connection pool
  globalForPrisma.prisma = prisma;
}

export default prisma;
