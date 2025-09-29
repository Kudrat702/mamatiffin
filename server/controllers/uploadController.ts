// ===== FILE: controllers/uploadController.ts =====
// UPDATED: Fixed upload path for server/uploads structure
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// STEP 1: Ensure uploads directory exists - FIXED PATH
const uploadDir = path.join(__dirname, '../uploads'); // ek level upar (server/uploads)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Upload directory created:', uploadDir);
}

// STEP 2: Configure multer for image storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // FIXED: Use uploadDir variable
  },
  filename: (req, file, cb) => {
    // Generate unique filename to avoid conflicts
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// STEP 3: Configure multer with file validation
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'));
    }
  }
});

// STEP 4: Image upload controller function
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    // Generate the complete image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
   
    console.log('Image uploaded successfully:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: imageUrl
    });

    res.json({
      success: true,
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      message: 'Image uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// STEP 5: Helper function to delete image files - FIXED PATH
export const deleteImageFile = (imageUrl: string): boolean => {
  try {
    if (imageUrl && imageUrl.includes('/uploads/')) {
      // Extract filename from URL
      const filename = imageUrl.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(uploadDir, filename); // FIXED: Use uploadDir variable
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Image file deleted:', filename);
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting image file:', error);
    return false;
  }
};