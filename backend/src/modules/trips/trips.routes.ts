import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import {
  createTripController,
  deleteTripController,
  getTripController,
  getTripsController,
  updateTripController,
} from "./trips.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getTripsController);
router.post("/", createTripController);
router.get("/:tripId", getTripController);
router.patch("/:tripId", updateTripController);
router.delete("/:tripId", deleteTripController);

export default router;
