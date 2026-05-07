// backend/routes/roomRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  getAllRooms,
  getRoomById,
  getAllRoomsAdmin,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomAvailability,
  getRoomStats,
} from '../controllers/roomControllers'; // ✅ adjust if your file is roomController (singular)
import { uploadRoomImages } from '../config/cloudinary.config';
// import { adminAuthMiddleware } from '../middleware/adminAuth'; // 🔐 enable when ready

const router = Router();

// ==========================================
// MULTER ERROR HANDLER
// ==========================================
// Wraps the multer middleware so file-size / file-type errors become clean
// JSON responses instead of unhandled errors that crash the request.
const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadRoomImages.array('images', 5)(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      let message = err.message;
      if (err.code === 'LIMIT_FILE_SIZE') message = 'Each image must be under 5MB';
      if (err.code === 'LIMIT_FILE_COUNT') message = 'Maximum 5 images allowed';
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field — use "images" as the field name';
      }
      return res.status(400).json({ success: false, message });
    }
    if (err instanceof Error) {
      // Custom file filter errors (e.g. "Only image files are allowed")
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ==========================================
// PUBLIC ROUTES (no auth)
// ==========================================
router.get('/rooms', getAllRooms);          // GET  /api/rooms
router.get('/rooms/:id', getRoomById);      // GET  /api/rooms/:id

// ==========================================
// ADMIN ROUTES (protected — uncomment middleware when ready)
// ==========================================
// router.use('/admin/rooms', adminAuthMiddleware);

// IMPORTANT: handleUpload uses field name 'images' — must match frontend
// FormData → fd.append('images', file)

router.get('/admin/rooms/stats', getRoomStats);
router.get('/admin/rooms', getAllRoomsAdmin);

router.post('/admin/rooms', handleUpload, createRoom);
router.put('/admin/rooms/:id', handleUpload, updateRoom);

router.patch('/admin/rooms/:id/toggle', toggleRoomAvailability);
router.delete('/admin/rooms/:id', deleteRoom);

export default router;