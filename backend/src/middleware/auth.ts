import { Request, Response, NextFunction } from 'express';
import { sha256 } from '../lib/crypto';
import { createError } from '../lib/errors';
import prisma from '../lib/prisma';

/**
 * Requires valid authentication
 * Throws AUTH_REQUIRED if no valid session
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies['gt_session'];

    if (!sessionToken) {
      throw createError('AUTH_REQUIRED', 'No session token provided');
    }

    const tokenHash = sha256(sessionToken);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw createError('AUTH_REQUIRED', 'Session expired or invalid');
    }

    if (!session.user.isActive) {
      throw createError('AUTH_REQUIRED', 'User account is inactive');
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication
 * Sets req.user if valid session exists, but doesn't block if missing
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionToken = req.cookies['gt_session'];

    if (!sessionToken) {
      next();
      return;
    }

    const tokenHash = sha256(sessionToken);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            isActive: true,
          },
        },
      },
    });

    if (session && session.expiresAt >= new Date() && session.user.isActive) {
      req.user = {
        id: session.user.id,
        email: session.user.email,
        displayName: session.user.displayName,
      };
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};