import { env } from './config/env';
import { createApp } from './app';
import { logger } from './lib/logger';
import prisma from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      corsOrigin: env.CORS_ORIGIN,
    },
    '🚀 GlobeTrotter API server started'
  );
});