import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { loginLimiter, registerLimiter } from '../../middleware/rateLimit';

const router = Router();

router.post('/register', registerLimiter, (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', loginLimiter, (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/logout', (req, res, next) =>
  authController.logout(req, res, next)
);

router.post('/refresh', (req, res, next) =>
  authController.refresh(req, res, next)
);

router.get('/me', requireAuth, (req, res, next) =>
  authController.me(req, res, next)
);

export default router;
