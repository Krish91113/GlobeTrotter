import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/summary", requireAuth, (req, res, next) =>
  dashboardController.getSummary(req, res, next),
);

export default router;
