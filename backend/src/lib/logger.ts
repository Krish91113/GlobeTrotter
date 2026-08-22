import pino from 'pino';
import { getEnv } from '../config/env';

const env = getEnv();

const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: env.NODE_ENV === 'production',
      translateTime: 'SYS:standard',
    },
  },
});

export { logger };
