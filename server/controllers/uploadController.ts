// controllers/uploadController.ts - CLEAN CLOUDINARY VERSION
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload';

// ============================================
// ENVIRONMENT DETECTION
// ============================================
const useCloudinary = process.env.NODE_ENV === 'production';

console.log(`📸 Upload Mode: ${useCloudinary ? 'CLOUDINARY (Production)' : 'LOCAL (Development)'}`);

// ============================================
// LOCAL STORAGE SETUP (Development Only)
// ============================================
const baseUploadDir = path.join(__dirname, '../uploads');

if (!useCloudinary) {
  // Create directories only in development
  const directories = [
    baseUploadDir,
    path.join(baseUploadDir, 'slider-images'),
    path.join(baseUploadDir, 'menus'),
    path.join(baseUploadDir, 'catalog')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// ============================================
// MULTER STORAGE CONFIGURATION
// ============================================
const storage = useCloudinary 
  ? multer.memoryStorage() // Cloudinary uses buffer
  : multer.diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = baseUploadDir;
        
        // Route-based folder selection
        if (req.path.includes('slider') || req.body.type === 'slider') {
          uploadPath = path.join(baseUploadDir, 'slider-images');
        } else if (req.path.includes('menu') || req.body.type === 'menu') {
          uploadPath = path.join(baseUploadDir, 'menus');
        } else if (req.path.includes('catalog') || req.body.type === 'catalog') {
          uploadPath = path.join(baseUploadDir, 'catalog');
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        
        let prefix = 'image';
        if (req.path.includes('slider')) prefix = 'slider';
        else if (req.path.includes('menu')) prefix = 'menu';
        else if (req.path.includes('catalog')) prefix = 'catalog';
        
        const filename = `${prefix}-${uniqueId}${ext}`;
        cb(null, filename);
      }
    });

// ============================================
// FILE FILTER (Image Validation)
// ============================================
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// ============================================
// MULTER UPLOAD MIDDLEWARE
// ============================================
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

export default upload;

// ============================================
// NAMED EXPORTS (Backward Compatibility)
// ============================================
export const uploadSlider = upload;
export const uploadMenu = upload;
export const uploadCatalog = upload;

// ============================================
// UPLOAD INFO UTILITY
// ============================================
export const getUploadInfo = () => ({
  mode: useCloudinary ? 'cloudinary' : 'local',
  baseDir: useCloudinary ? 'cloudinary' : baseUploadDir,
  maxSize: '5MB',
  allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  folders: {
    slider: useCloudinary ? 'slider-images' : path.join(baseUploadDir, 'slider-images'),
    menus: useCloudinary ? 'menus' : path.join(baseUploadDir, 'menus'),
    catalog: useCloudinary ? 'catalog' : path.join(baseUploadDir, 'catalog')
  }
});

// ============================================
// IMAGE UPLOAD HANDLER
// ============================================
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    let imageUrl: string;
    let imagePublicId: string | undefined;

    if (useCloudinary) {
      // CLOUDINARY UPLOAD
      const folder = req.body.folder || 'general';
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: folder,
        publicId: `${folder}-${Date.now()}`
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;

      console.log('☁️ Cloudinary upload success:', imagePublicId);
    } else {
      // LOCAL UPLOAD
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('💾 Local upload success:', req.file.filename);
    }

    res.json({
      success: true,
      imageUrl: imageUrl,
      imagePublicId: imagePublicId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      message: 'Image uploaded successfully',
      storage: useCloudinary ? 'cloudinary' : 'local'
    });
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// ============================================
// DELETE IMAGE HANDLER
// ============================================
export const deleteImageFile = async (
  imageUrl: string, 
  imagePublicId?: string
): Promise<boolean> => {
  try {
    if (useCloudinary && imagePublicId) {
      // DELETE FROM CLOUDINARY
      await deleteFromCloudinary(imagePublicId);
      console.log('☁️ Cloudinary delete success:', imagePublicId);
      return true;
    } else if (!useCloudinary && imageUrl && imageUrl.includes('/uploads/')) {
      // DELETE FROM LOCAL
      const filename = imageUrl.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(baseUploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('💾 Local delete success:', filename);
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    return false;
  }
};