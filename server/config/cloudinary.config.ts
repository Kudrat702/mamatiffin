// backend/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

// ============================================
// VALIDATE ENV (warn early if not configured)
// ============================================
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    '⚠️  Cloudinary env vars missing! Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env'
  );
}

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true, // ✅ Always returns HTTPS URLs
});

// ============================================
// SHARED FILE FILTER (mime + extension check)
// ============================================
const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = /jpeg|jpg|png|webp/;
  const mimeOk = allowed.test(file.mimetype);
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
};

// ============================================
// BOOK STORAGE (existing — DO NOT change folder/path)
// ============================================
const bookStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'mamatiffin/books',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto' },
    ],
  }),
});

// ============================================
// ROOM STORAGE — FULL IMAGE QUALITY (no resize)
// ============================================
// Original image size preserved. Only smart compression + auto-format applied.
// Max upload size still controlled by multer below (5MB).
const roomStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'mamatiffin/rooms',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { quality: 'auto:good' },   // ✅ Smart compression — doesn't resize
      { fetch_format: 'auto' },   // ✅ Auto serve webp/avif to browsers
      // ❌ width/height/crop removed — image stays at original resolution
    ],
    public_id: `room-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

// ============================================
// MULTER MIDDLEWARES
// ============================================

// ✅ OLD export — used by existing book code (backward compatible)
export const upload = multer({
  storage: bookStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
});

// ✅ NEW export — used by room routes
export const uploadRoomImages = multer({
  storage: roomStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 5,                  // max 5 files per upload
  },
});

// ============================================
// HELPER: DELETE IMAGE FROM CLOUDINARY
// ============================================
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('❌ Cloudinary delete error:', err);
  }
};

// ============================================
// EXPORTS
// ============================================
// Default export — for old imports like: import cloudinary from '...'
export default cloudinary;

// Named export — for: import { cloudinary } from '...'
export { cloudinary };