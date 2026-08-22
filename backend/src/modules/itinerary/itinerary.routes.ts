import { Router } from 'express';
import { itineraryController } from './itinerary.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = Router();

// All routes receive :tripId from the mount path (/api/v1/trips/:tripId)
// and are scoped to a specific day via :dayId.

router.post('/days/:dayId/items', requireAuth, (req, res, next) =>
  itineraryController.addItem(req, res, next)
);

router.put('/days/:dayId/items/reorder', requireAuth, (req, res, next) =>
  itineraryController.reorderItems(req, res, next)
);

router.patch('/days/:dayId/items/:itemId', requireAuth, (req, res, next) =>
  itineraryController.updateItem(req, res, next)
);

router.delete('/days/:dayId/items/:itemId', requireAuth, (req, res, next) =>
  itineraryController.removeItem(req, res, next)
);

export default router;
