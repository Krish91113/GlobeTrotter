import { Router, Request, Response } from 'express';
import { ok } from '../../lib/apiResponse';

const router = Router();

router.get('/live', (req: Request, res: Response) => {
  ok(res, { status: 'ok' });
});

router.get('/ready', (req: Request, res: Response) => {
  // TODO: check database connection, redis, etc.
  ok(res, { status: 'ready' });
});

export default router;
