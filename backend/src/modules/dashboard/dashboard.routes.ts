import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.get('/summary', requireAuth, (req, res, next) =>
  dashboardController.getSummary(req, res, next)
);

export default router;
