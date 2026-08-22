import { Router } from "express";
import { loginLimiter, registerLimiter } from "../../middleware/rateLimit";
import { requireAuth } from "../../middleware/requireAuth";
import { authController } from "./auth.controller";

const router = Router();

router.post("/register", registerLimiter, (req, res, next) =>
  authController.register(req, res, next),
);

router.post("/login", loginLimiter, (req, res, next) =>
  authController.login(req, res, next),
);

router.post("/logout", (req, res, next) =>
  authController.logout(req, res, next),
);

router.post("/refresh", (req, res, next) =>
  authController.refresh(req, res, next),
);

router.post("/forgot-password", (req, res, next) =>
  authController.forgotPassword(req, res, next),
);

router.post("/reset-password", (req, res, next) =>
  authController.resetPassword(req, res, next),
);

router.get("/me", requireAuth, (req, res, next) =>
  authController.me(req, res, next),
);

export default router;
