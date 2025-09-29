// routes/paymentRoutes.ts
import express, { Router, Request, Response } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus
} from '../controllers/paymentController';

const router = express.Router();

// Helper to handle async route controllers
const asyncHandler = (fn: any) => (req: Request, res: Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Payment routes
router.post('/create-order', asyncHandler(createPaymentOrder));
router.post('/verify', asyncHandler(verifyPayment));
router.get('/status/:orderId', asyncHandler(getPaymentStatus));

export default router;