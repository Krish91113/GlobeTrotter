import type { Response } from 'express';
import { getEnv } from '../config/env';

const env = getEnv();

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
}

function getCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  };
}

// Convert duration string (e.g., "7d", "15m") to milliseconds
function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhdwy])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  const factors: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  return num * (factors[unit] || 1);
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  const accessMaxAge = parseDurationToMs('15m');
  const refreshMaxAge = parseDurationToMs(env.SESSION_MAX_AGE);

  res.cookie('gt_access', accessToken, getCookieOptions(accessMaxAge));
  res.cookie('gt_refresh', refreshToken, getCookieOptions(refreshMaxAge));
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('gt_access');
  res.clearCookie('gt_refresh');
}

export function getAccessTokenFromCookies(req: any): string | undefined {
  return req.cookies?.gt_access;
}

export function getRefreshTokenFromCookies(req: any): string | undefined {
  return req.cookies?.gt_refresh;
}
