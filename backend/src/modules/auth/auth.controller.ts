import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { registerSchema, loginSchema } from './auth.schema';
import { ok } from '../../lib/apiResponse';
import { ValidationError } from '../../errors/AppError';
import { setAuthCookies, clearAuthCookies, getRefreshTokenFromCookies } from '../../lib/cookies';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        const fieldErrors: Record<string, string[]> = {};
        parsed.error.issues.forEach((err: any) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(err.message);
        });
        throw new ValidationError('Registration validation failed', fieldErrors, String(req.id));
      }

      const tokens = await authService.register(
        parsed.data,
        req.ip,
        req.get('user-agent')
      );

      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      ok(res, { user: tokens.user }, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        const fieldErrors: Record<string, string[]> = {};
        parsed.error.issues.forEach((err: any) => {
          const path = err.path.join('.');
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(err.message);
        });
        throw new ValidationError('Login validation failed', fieldErrors, String(req.id));
      }

      const tokens = await authService.login(
        parsed.data,
        req.ip,
        req.get('user-agent')
      );

      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      ok(res, { user: tokens.user });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = getRefreshTokenFromCookies(req);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      clearAuthCookies(res);
      ok(res, {}, 204);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = getRefreshTokenFromCookies(req);
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required', undefined, String(req.id));
      }

      const tokens = await authService.refresh(
        refreshToken,
        req.ip,
        req.get('user-agent')
      );

      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      ok(res, { user: tokens.user });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.me(req.user!.userId ?? req.user!.id);
      ok(res, { user });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
