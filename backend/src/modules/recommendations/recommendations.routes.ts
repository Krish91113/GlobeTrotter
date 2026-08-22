import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { recommendationsController } from "./recommendations.controller";

const router = Router();

router.get("/options", (req, res, next) =>
  recommendationsController.getFilterOptions(req, res, next),
);

router.post("/generate", requireAuth, (req, res, next) =>
  recommendationsController.generate(req, res, next),
);

router.post("/:recId/feedback", requireAuth, (req, res, next) =>
  recommendationsController.submitFeedback(req, res, next),
);

export default router;
