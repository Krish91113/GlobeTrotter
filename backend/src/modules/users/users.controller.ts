import type { NextFunction, Request, Response } from "express";
import { ValidationError } from "../../errors/AppError";
import { ok } from "../../lib/apiResponse";
import { clearAuthCookies } from "../../lib/cookies";
import {
  deleteAccount,
  getPreferences,
  getProfile,
  getSavedLocations,
  removeProfileImage,
  saveLocation,
  unsaveLocation,
  updateProfile,
  updateProfileImage,
  upsertPreferences,
} from "./users.service";

/**
 * GET /users/me/profile
 */
export async function getProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await getProfile(req.user!.id);
    ok(res, { profile });
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
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await updateProfile(req.user!.id, req.body);
    ok(res, { profile });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /users/me/profile-image
 */
export async function uploadProfileImageController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let imageUrl: string;

    if (req.file) {
      const mime = req.file.mimetype || "image/png";
      const base64 = req.file.buffer.toString("base64");
      imageUrl = `data:${mime};base64,${base64}`;
    } else if (req.body?.image && typeof req.body.image === "string") {
      imageUrl = req.body.image;
    } else {
      throw new ValidationError("No image file or image data provided");
    }

    const profile = await updateProfileImage(req.user!.id, imageUrl);
    ok(res, { profile });
  } catch (error) {
    next(error);
  }
}


/**
 * DELETE /users/me/profile-image
 */
export async function removeProfileImageController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await removeProfileImage(req.user!.id);
    ok(res, { profile });
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
  next: NextFunction,
): Promise<void> {
  try {
    const preferences = await getPreferences(req.user!.id);
    ok(res, { preferences });
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
  next: NextFunction,
): Promise<void> {
  try {
    const preferences = await upsertPreferences(req.user!.id, req.body);
    ok(res, { preferences });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /users/me/saved-locations
 */
export async function getSavedLocationsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const savedLocations = await getSavedLocations(req.user!.id);
    ok(res, { savedLocations });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /users/me/saved-locations/:locationId
 */
export async function saveLocationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { locationId } = req.params;
    const result = await saveLocation(req.user!.id, String(locationId));
    ok(res, result, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /users/me/saved-locations/:locationId
 */
export async function unsaveLocationController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { locationId } = req.params;
    await unsaveLocation(req.user!.id, String(locationId));
    ok(res, { success: true });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /users/me
 */
export async function deleteAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteAccount(req.user!.id);
    clearAuthCookies(res);
    ok(res, { success: true }, 204);
  } catch (error) {
    next(error);
  }
}

