import { Router } from 'express';
import { itineraryController } from './itinerary.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

// Mounted under /api/v1/trips

router.post('/:tripId/days/:dayId/items', requireAuth, (req, res, next) =>
  itineraryController.addItem(req, res, next)
);

router.put('/:tripId/days/:dayId/items/reorder', requireAuth, (req, res, next) =>
  itineraryController.reorderItems(req, res, next)
);

router.patch('/:tripId/days/:dayId/items/:itemId', requireAuth, (req, res, next) =>
  itineraryController.updateItem(req, res, next)
);

router.delete('/:tripId/days/:dayId/items/:itemId', requireAuth, (req, res, next) =>
  itineraryController.removeItem(req, res, next)
);

export default router;
