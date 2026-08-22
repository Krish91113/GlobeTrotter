import { type Request, type Response, Router } from "express";
import { logger } from "../../lib/logger";
import prisma from "../../lib/prisma";

const router = Router();

/**
 * GET /health/live
 * Liveness probe - service is running
 */
router.get("/live", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/**
 * GET /health/ready
 * Readiness probe - service is ready to accept traffic
 * Checks database connectivity
 */
router.get("/ready", async (_req: Request, res: Response) => {
  try {
    // Ping database
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      db: "connected",
    });
  } catch (error) {
    logger.error({ error }, "Database health check failed");

    res.status(503).json({
      status: "error",
      db: "unreachable",
    });
  }
});

export default router;
