import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  deleteAccountController,
  getPreferencesController,
  getProfileController,
  getSavedLocationsController,
  removeProfileImageController,
  saveLocationController,
  unsaveLocationController,
  updateProfileController,
  uploadProfileImageController,
  upsertPreferencesController,
} from "./users.controller";
import { UpdateProfileSchema, UpsertPreferencesSchema } from "./users.schema";

const router = Router();

// Multer memory storage configuration - stores directly in PostgreSQL
const storage = multer.memoryStorage();

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Only JPEG, PNG, WebP, GIF, and SVG are allowed."));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});


// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/v1/users/me/profile
 */
router.get("/me/profile", getProfileController);

/**
 * PATCH /api/v1/users/me/profile
 */
router.patch(
  "/me/profile",
  validate(UpdateProfileSchema),
  updateProfileController,
);

/**
 * POST /api/v1/users/me/profile-image
 */
router.post(
  "/me/profile-image",
  upload.single("image"),
  uploadProfileImageController,
);

/**
 * DELETE /api/v1/users/me/profile-image
 */
router.delete("/me/profile-image", removeProfileImageController);

/**
 * GET /api/v1/users/me/preferences
 */
router.get("/me/preferences", getPreferencesController);

/**
 * PUT /api/v1/users/me/preferences
 */
router.put(
  "/me/preferences",
  validate(UpsertPreferencesSchema),
  upsertPreferencesController,
);

/**
 * GET /api/v1/users/me/saved-locations
 */
router.get("/me/saved-locations", getSavedLocationsController);

/**
 * POST /api/v1/users/me/saved-locations/:locationId
 */
router.post("/me/saved-locations/:locationId", saveLocationController);

/**
 * DELETE /api/v1/users/me/saved-locations/:locationId
 */
router.delete("/me/saved-locations/:locationId", unsaveLocationController);

/**
 * DELETE /api/v1/users/me (Delete Account)
 */
router.delete("/me", deleteAccountController);

export default router;

