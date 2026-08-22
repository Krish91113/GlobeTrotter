import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { logger } from '../../lib/logger';

const router = Router();

/**
 * GET /health/live
 * Liveness probe - service is running
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * GET /health/ready
 * Readiness probe - service is ready to accept traffic
 * Checks database connectivity
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      db: 'connected',
    });
  } catch (error) {
    logger.error({ error }, 'Database health check failed');

    res.status(503).json({
      status: 'error',
      db: 'unreachable',
    });
  }
});

export default router;