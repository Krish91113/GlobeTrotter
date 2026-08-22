import { Router } from 'express';
import {
  getProfileController,
  updateProfileController,
  getPreferencesController,
  upsertPreferencesController,
} from './users.controller';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { UpdateProfileSchema, UpsertPreferencesSchema } from './users.schema';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * GET /users/me/profile
 * Get current user's profile
 */
router.get('/me/profile', getProfileController);

/**
 * PATCH /users/me/profile
 * Update current user's profile
 */
router.patch(
  '/me/profile',
  validate(UpdateProfileSchema),
  updateProfileController
);

/**
 * GET /users/me/preferences
 * Get current user's preferences
 */
router.get('/me/preferences', getPreferencesController);

/**
 * PUT /users/me/preferences
 * Update or create current user's preferences
 */
router.put(
  '/me/preferences',
  validate(UpsertPreferencesSchema),
  upsertPreferencesController
);

export default router;