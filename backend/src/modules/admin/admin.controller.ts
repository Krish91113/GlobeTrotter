import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import {
  createAdminCatalogItem,
  deleteAdminCatalogItem,
  getAnalyticsSummary,
  getBudgetTrends,
  getRecommendationsAnalytics,
  getTopActivities,
  getTopLocations,
  listAdminCatalogItems,
  listUsers,
  updateAdminCatalogItem,
  updateUserRole,
} from "./admin.service";

export async function getAnalyticsSummaryController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const summary = await getAnalyticsSummary();
    ok(res, summary);
  } catch (error) {
    next(error);
  }
}

export async function getTopLocationsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const topLocations = await getTopLocations(limit);
    ok(res, topLocations);
  } catch (error) {
    next(error);
  }
}

export async function getTopActivitiesController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const topActivities = await getTopActivities(limit);
    ok(res, topActivities);
  } catch (error) {
    next(error);
  }
}

export async function getRecommendationsAnalyticsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const analytics = await getRecommendationsAnalytics();
    ok(res, analytics);
  } catch (error) {
    next(error);
  }
}

export async function getBudgetTrendsController(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const budgetTrends = await getBudgetTrends();
    ok(res, budgetTrends);
  } catch (error) {
    next(error);
  }
}

export async function listUsersController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
    const search = req.query.search as string | undefined;
    const role = req.query.role as string | undefined;

    const result = await listUsers({ page, limit, search, role });
    ok(res, { users: result.users, total: result.meta.total }, 200, result.meta);
  } catch (error) {
    next(error);
  }
}

export async function updateUserRoleController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await updateUserRole(String(userId), role);
    ok(res, { user });
  } catch (error) {
    next(error);
  }
}

export async function listAdminCatalogItemsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
    const search = req.query.search as string | undefined;
    const locationId = req.query.locationId as string | undefined;

    const result = await listAdminCatalogItems({ page, limit, search, locationId });
    ok(res, { items: result.items, total: result.meta.total }, 200, result.meta);
  } catch (error) {
    next(error);
  }
}


export async function createAdminCatalogItemController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const item = await createAdminCatalogItem(req.body);
    ok(res, { item }, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCatalogItemController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { itemId } = req.params;
    const item = await updateAdminCatalogItem(String(itemId), req.body);
    ok(res, { item });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminCatalogItemController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { itemId } = req.params;
    await deleteAdminCatalogItem(String(itemId));
    ok(res, { success: true });
  } catch (error) {
    next(error);
  }
}
