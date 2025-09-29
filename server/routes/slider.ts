// import express from 'express';
// import {
//   getSliderImages,
//   getAllSliderImages,
//   createSliderImage,
//   updateSliderImage,
//   deleteSliderImage,
//   toggleSliderImageStatus
// } from '../controllers/sliderController';
// import upload from '../middleware/upload';

// const router = express.Router();

// // Public routes
// router.get('/', getSliderImages);

// // Admin routes
// router.get('/admin', getAllSliderImages);
// router.post('/admin', upload.single('image'), createSliderImage);
// router.put('/admin/:id', upload.single('image'), updateSliderImage);
// router.delete('/admin/:id', deleteSliderImage);
// router.patch('/admin/:id/toggle', toggleSliderImageStatus);

// export default router;

import express from 'express';
import {
  getSliderImages,
  getAllSliderImages,
  createSliderImage,
  updateSliderImage,
  deleteSliderImage,
  toggleSliderImageStatus
} from '../controllers/sliderController';
import { uploadSlider } from '../middleware/upload';

const router = express.Router();

// Public routes - Active sliders only
router.get('/', getSliderImages);

// Admin routes - Full CRUD operations
router.get('/admin', getAllSliderImages);
router.post('/admin', uploadSlider.single('image'), createSliderImage);
router.put('/admin/:id', uploadSlider.single('image'), updateSliderImage);
router.delete('/admin/:id', deleteSliderImage);
router.patch('/admin/:id/toggle', toggleSliderImageStatus);

export default router;