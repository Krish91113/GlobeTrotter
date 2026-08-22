import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').pipe(z.coerce.number()),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  SESSION_MAX_AGE: z.string().default('7d'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
  APP_BASE_URL: z.string().url().default('http://localhost:3001'),
  BCRYPT_ROUNDS: z.string().default('12').pipe(z.coerce.number()),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('\n');
      console.error('Environment validation failed:\n', formatted);
      process.exit(1);
    }
    throw error;
  }
}
