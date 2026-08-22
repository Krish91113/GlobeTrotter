import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors/AppError";
import prisma from "../lib/prisma";

/**
 * Middleware that ensures authenticated user has a specific role (e.g. 'ADMIN').
 */
export function requireRole(allowedRole: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ForbiddenError("Authentication required to access this resource", String(req.id));
      }

      // Check role attached to req.user (from JWT or DB)
      if (req.user.role === allowedRole) {
        return next();
      }

      // Fallback: check database directly
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true },
      });

      if (user && user.role === allowedRole) {
        req.user.role = user.role;
        return next();
      }

      throw new ForbiddenError(`Access denied. Requires ${allowedRole} role.`, String(req.id));
    } catch (error) {
      next(error);
    }
  };
}
