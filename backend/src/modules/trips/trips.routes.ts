import { Router } from 'express';
import { tripsController } from './trips.controller';
import { requireAuth } from '../../middleware/requireAuth';
import stopsRoutes from '../stops/stops.routes';
import daysRoutes from '../days/days.routes';

const router = Router();

router.use(requireAuth);

// Nested child routes
router.use('/:tripId/stops', stopsRoutes);
router.use('/:tripId/days', daysRoutes);

// Trip CRUD routes
router.get('/', (req, res, next) => tripsController.listTrips(req, res, next));
router.post('/', (req, res, next) => tripsController.createTrip(req, res, next));
router.get('/:tripId', (req, res, next) => tripsController.getTrip(req, res, next));
router.patch('/:tripId', (req, res, next) => tripsController.updateTrip(req, res, next));
router.delete('/:tripId', (req, res, next) => tripsController.deleteTrip(req, res, next));

export default router;