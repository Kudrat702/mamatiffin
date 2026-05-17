import express, { Router, Request, Response } from 'express';
import { subscribe, unsubscribe, getVapidPublicKey } from '../controllers/notificationController';

const router: Router = express.Router();

const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

router.get('/vapid-public-key', asyncHandler(getVapidPublicKey));
router.post('/subscribe', asyncHandler(subscribe));
router.post('/unsubscribe', asyncHandler(unsubscribe));

export default router;
