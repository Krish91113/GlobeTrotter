import { Request, Response, NextFunction } from 'express';
import { getProfile, updateProfile, getPreferences, upsertPreferences } from './users.service';

/**
 * GET /users/me/profile
 */
export async function getProfileController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const profile = await getProfile(req.user.id);

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /users/me/profile
 */
export async function updateProfileController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const profile = await updateProfile(req.user.id, req.body);

    res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /users/me/preferences
 */
export async function getPreferencesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const preferences = await getPreferences(req.user.id);

    res.status(200).json({ preferences });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /users/me/preferences
 */
export async function upsertPreferencesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    const preferences = await upsertPreferences(req.user.id, req.body);

    res.status(200).json({ preferences });
  } catch (error) {
    next(error);
  }
}