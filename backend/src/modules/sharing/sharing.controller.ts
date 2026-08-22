import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sharingService } from './sharing.service';
import { createShareLinkSchema, isValidShareToken } from './sharing.schema';
import { ok } from '../../lib/apiResponse';
import { NotFoundError, ValidationError } from '../../errors/AppError';

const uuidSchema = z.string().uuid();

function buildFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.map((segment) => String(segment)).join('.');
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}

function tripIdParam(req: Request): string {
  const value = req.params.tripId;
  if (typeof value !== 'string' || !uuidSchema.safeParse(value).success) {
    throw new ValidationError('Invalid tripId parameter');
  }
  return value;
}

function tokenParam(req: Request): string {
  const value = req.params.token;
  if (typeof value !== 'string' || !isValidShareToken(value)) {
    // Same error as an unknown link: do not reveal whether the token is malformed.
    throw new NotFoundError('Resource not found');
  }
  return value.toLowerCase();
}

export class SharingController {
  async createShareLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createShareLinkSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        throw new ValidationError(
          'Share link validation failed',
          buildFieldErrors(parsed.error)
        );
      }

      const link = await sharingService.createShareLink(
        tripIdParam(req),
        parsed.data,
        req.user!.userId
      );

      ok(res, link, 201);
    } catch (error) {
      next(error);
    }
  }

  async listShareLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const links = await sharingService.listShareLinks(
        tripIdParam(req),
        req.user!.userId
      );
      ok(res, links);
    } catch (error) {
      next(error);
    }
  }

  async revokeShareLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await sharingService.revokeShareLink(
        tripIdParam(req),
        String(req.params.linkId ?? ''),
        req.user!.userId
      );
      ok(res, {}, 204);
    } catch (error) {
      next(error);
    }
  }

  async getPublicTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await sharingService.getPublicTrip(tokenParam(req));
      ok(res, trip);
    } catch (error) {
      next(error);
    }
  }

  async copyTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await sharingService.copyTrip(tokenParam(req), req.user!.userId);
      ok(res, trip, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const sharingController = new SharingController();
