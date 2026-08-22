import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import {
  createAdminCatalogItemController,
  deleteAdminCatalogItemController,
  getAnalyticsSummaryController,
  getBudgetTrendsController,
  getRecommendationsAnalyticsController,
  getTopActivitiesController,
  getTopLocationsController,
  listAdminCatalogItemsController,
  listUsersController,
  updateAdminCatalogItemController,
  updateUserRoleController,
} from "./admin.controller";

const router = Router();

// Enforce authentication & ADMIN role on every admin route
router.use(requireAuth);
router.use(requireRole("ADMIN"));

/**
 * Analytics endpoints
 */
router.get("/analytics/summary", getAnalyticsSummaryController);
router.get("/analytics/top-locations", getTopLocationsController);
router.get("/analytics/top-activities", getTopActivitiesController);
router.get("/analytics/recommendations", getRecommendationsAnalyticsController);
router.get("/analytics/budget-trends", getBudgetTrendsController);

/**
 * User management endpoints
 */
router.get("/users", listUsersController);
router.patch("/users/:userId/role", updateUserRoleController);

/**
 * Catalog management endpoints
 */
router.get("/catalog/items", listAdminCatalogItemsController);
router.post("/catalog/items", createAdminCatalogItemController);
router.patch("/catalog/items/:itemId", updateAdminCatalogItemController);
router.delete("/catalog/items/:itemId", deleteAdminCatalogItemController);

export default router;
