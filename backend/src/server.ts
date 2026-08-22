import 'dotenv/config';
import { app } from './app';
import { getEnv } from './config/env';
import { logger } from './lib/logger';

const env = getEnv();
const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📝 Health checks: http://localhost:${PORT}/health/live`);
  logger.info(`🔐 Auth endpoints: http://localhost:${PORT}/api/v1/auth`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { server };
