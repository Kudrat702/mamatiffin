// routes/userRoutes.ts
import express from 'express';
import {
  createFoodSelection,
  getFoodPreferencesByPhone,
  getUserDashboard
} from '../controllers/userController';

const router = express.Router();

// Food preference routes
router.post('/food-selection', createFoodSelection);
router.get('/food-preferences/:customerPhone', getFoodPreferencesByPhone);
router.get('/dashboard/:customerPhone', getUserDashboard);

export default router;