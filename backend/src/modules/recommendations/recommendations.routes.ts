import { Router } from 'express';
import { recommendationsController } from './recommendations.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

router.post('/generate', requireAuth, (req, res, next) =>
  recommendationsController.generate(req, res, next)
);

router.post('/:recId/feedback', requireAuth, (req, res, next) =>
  recommendationsController.submitFeedback(req, res, next)
);

export default router;
