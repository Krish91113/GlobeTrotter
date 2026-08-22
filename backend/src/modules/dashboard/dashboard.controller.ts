import type { NextFunction, Request, Response } from "express";
import { ok } from "../../lib/apiResponse";
import { dashboardService } from "./dashboard.service";

export class DashboardController {
  async getSummary(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const summary = await dashboardService.getDashboardSummary(req.user!.id);
      ok(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
