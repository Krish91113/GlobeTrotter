import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import prisma from "./lib/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      corsOrigin: env.CORS_ORIGIN,
    },
    "🚀 GlobeTrotter API server started",
  );
});

// ========================================
// Graceful Shutdown
// ========================================

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutdown signal received");

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await prisma.$disconnect();
      logger.info("Database connection closed");
      process.exit(0);
    } catch (error) {
      logger.error({ error }, "Error during shutdown");
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  logger.fatal({ error }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.fatal({ reason, promise }, "Unhandled rejection");
  process.exit(1);
});
