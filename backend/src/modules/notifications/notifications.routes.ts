import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import {
  getNotificationsController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "./notifications.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getNotificationsController);
router.patch("/:id/read", markNotificationAsReadController);
router.post("/read-all", markAllNotificationsAsReadController);

export default router;
