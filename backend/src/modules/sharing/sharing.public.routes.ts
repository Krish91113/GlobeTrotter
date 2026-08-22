import { Router } from "express";
import { publicLimiter } from "../../middleware/rateLimit";
import { requireAuth } from "../../middleware/requireAuth";
import { sharingController } from "./sharing.controller";

const router = Router();

// Mounted under /api/v1/public

router.get("/trips/:token", publicLimiter, (req, res, next) =>
  sharingController.getPublicTrip(req, res, next),
);

router.post("/trips/:token/copy", requireAuth, (req, res, next) =>
  sharingController.copyTrip(req, res, next),
);

export default router;
