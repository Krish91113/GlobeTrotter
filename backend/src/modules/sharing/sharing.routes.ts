import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { sharingController } from "./sharing.controller";

const router = Router();

// Mounted under /api/v1/trips

router.post("/:tripId/share-links", requireAuth, (req, res, next) =>
  sharingController.createShareLink(req, res, next),
);

router.get("/:tripId/share-links", requireAuth, (req, res, next) =>
  sharingController.listShareLinks(req, res, next),
);

router.delete("/:tripId/share-links/:linkId", requireAuth, (req, res, next) =>
  sharingController.revokeShareLink(req, res, next),
);

export default router;
