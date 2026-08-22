import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { ok } from '../../lib/apiResponse';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await dashboardService.getDashboardSummary(req.user!.userId);
      ok(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
