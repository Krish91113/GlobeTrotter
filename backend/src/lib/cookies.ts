import type { Request, Response } from 'express';
import { getEnv } from '../config/env';

const env = getEnv();

const ACCESS_COOKIE = 'gt_access';
const REFRESH_COOKIE = 'gt_refresh';

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge?: number;
  path: string;
}

function getCookieOptions(maxAge?: number): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhdwy])$/);

  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

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

  return num * factors[unit];
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  const accessMaxAge = parseDurationToMs('15m');
  const refreshMaxAge = parseDurationToMs(env.SESSION_MAX_AGE);

  res.cookie(
    ACCESS_COOKIE,
    accessToken,
    getCookieOptions(accessMaxAge)
  );

  res.cookie(
    REFRESH_COOKIE,
    refreshToken,
    getCookieOptions(refreshMaxAge)
  );
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, getCookieOptions());
  res.clearCookie(REFRESH_COOKIE, getCookieOptions());
}

export function getAccessTokenFromCookies(
  req: Request
): string | undefined {
  return req.cookies?.[ACCESS_COOKIE];
}

export function getRefreshTokenFromCookies(
  req: Request
): string | undefined {
  return req.cookies?.[REFRESH_COOKIE];
}