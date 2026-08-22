import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Prisma Client Singleton
 * Ensures only one instance of PrismaClient is created
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query'
      },
      {
        emit: 'stdout',
        level: 'error'
      },
      {
        emit: 'stdout',
        level: 'warn'
      }
    ]
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Log slow queries
prisma.$on('query', (e) => {
  if (e.duration > 3000) {
    // Log queries that take more than 3 seconds
    logger.warn(`Slow query detected: ${e.query} - ${e.duration}ms`);
  }
});

export default prisma;
