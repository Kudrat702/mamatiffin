// routes/uploadRoutes.ts - COMPLETE CLOUDINARY INTEGRATED VERSION
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Import from uploadController for consistency
import upload, { 
  uploadImage, 
  deleteImageFile, 
  getUploadInfo 
} from '../controllers/uploadController';

const router = express.Router();

// ============================================
// ENVIRONMENT DETECTION
// ============================================
const useCloudinary = process.env.NODE_ENV === 'production';
const baseUploadDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(baseUploadDir, 'images');

// Create directory only in development mode
if (!useCloudinary && !fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Upload images directory created:', imagesDir);
}

// ============================================
// ROUTE 1: SINGLE IMAGE UPLOAD
// ============================================
router.post('/image', upload.single('image'), uploadImage);

// ============================================
// ROUTE 2: MULTIPLE IMAGES UPLOAD (Max 5)
// ============================================
router.post('/images', upload.array('images', 5), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files uploaded',
        error: 'FILES_REQUIRED'
      });
      return;
    }

    // Format response based on storage mode
    const uploadedFiles = files.map(file => {
      if (useCloudinary) {
        // Cloudinary response format (if extended in future)
        return {
          filename: file.filename || 'cloudinary-file',
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          storage: 'cloudinary'
        };
      } else {
        // Local storage response
        const fileUrl = `/uploads/images/${file.filename}`;
        return {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          url: fileUrl,
          fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
          storage: 'local'
        };
      }
    });

    res.status(200).json({
      success: true,
      message: `${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully`,
      data: uploadedFiles,
      count: files.length,
      storage: useCloudinary ? 'cloudinary' : 'local'
    });
  } catch (error: any) {
    console.error('❌ Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message || 'UPLOAD_FAILED'
    });
  }
});

// ============================================
// ROUTE 3: DELETE IMAGE
// ============================================
router.delete('/image/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({
        success: false,
        message: 'Filename is required',
        error: 'FILENAME_REQUIRED'
      });
      return;
    }

    // Get imagePublicId from query params (if Cloudinary)
    const imagePublicId = req.query.publicId as string | undefined;

    // Use deleteImageFile from uploadController
    const imageUrl = useCloudinary 
      ? filename // In Cloudinary, filename might be URL
      : `/uploads/images/${filename}`;

    const deleted = await deleteImageFile(imageUrl, imagePublicId);
    
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        filename: filename,
        storage: useCloudinary ? 'cloudinary' : 'local'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found or already deleted',
        error: 'FILE_NOT_FOUND'
      });
    }
  } catch (error: any) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message || 'DELETE_FAILED'
    });
  }
});

// ============================================
// ROUTE 4: GET IMAGE INFO (Development Only)
// ============================================
router.get('/info/:filename', (req: Request, res: Response): void => {
  try {
    const { filename } = req.params;
    
    if (useCloudinary) {
      res.status(200).json({
        success: true,
        message: 'Using Cloudinary storage',
        filename: filename,
        note: 'Image info available in Cloudinary dashboard',
        storage: 'cloudinary'
      });
      return;
    }

    // Local file info
    const filePath = path.join(imagesDir, filename);
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found',
        error: 'FILE_NOT_FOUND'
      });
      return;
    }
    
    const stats = fs.statSync(filePath);
    
    res.status(200).json({
      success: true,
      data: {
        filename: filename,
        size: stats.size,
        sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/images/${filename}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/images/${filename}`,
        storage: 'local'
      }
    });
  } catch (error: any) {
    console.error('❌ File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: error.message || 'INFO_FAILED'
    });
  }
});

// ============================================
// ROUTE 5: LIST ALL UPLOADED IMAGES (Development Only)
// ============================================
router.get('/list', (req: Request, res: Response): void => {
  try {
    if (useCloudinary) {
      res.status(200).json({
        success: true,
        message: 'Using Cloudinary storage',
        note: 'View all images in Cloudinary dashboard',
        dashboardUrl: 'https://cloudinary.com/console/media_library',
        storage: 'cloudinary'
      });
      return;
    }

    // Local file listing
    if (!fs.existsSync(imagesDir)) {
      res.status(200).json({
        success: true,
        message: 'No uploads directory found',
        data: [],
        count: 0,
        storage: 'local'
      });
      return;
    }
    
    const files = fs.readdirSync(imagesDir);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    const fileList = imageFiles.map(filename => {
      const filePath = path.join(imagesDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename: filename,
        size: stats.size,
        sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
        created: stats.birthtime,
        url: `/uploads/images/${filename}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/images/${filename}`
      };
    });
    
    // Sort by creation date (newest first)
    fileList.sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
    
    res.status(200).json({
      success: true,
      message: `Found ${fileList.length} uploaded image${fileList.length !== 1 ? 's' : ''}`,
      data: fileList,
      count: fileList.length,
      storage: 'local'
    });
  } catch (error: any) {
    console.error('❌ List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error.message || 'LIST_FAILED'
    });
  }
});

// ============================================
// ROUTE 6: UPLOAD SYSTEM INFO
// ============================================
router.get('/info', (req: Request, res: Response): void => {
  try {
    const uploadInfo = getUploadInfo();
    
    res.status(200).json({
      success: true,
      message: 'Upload service information',
      data: uploadInfo,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Upload info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload info',
      error: error.message || 'INFO_FAILED'
    });
  }
});

// ============================================
// ROUTE 7: HEALTH CHECK
// ============================================
router.get('/health', (req: Request, res: Response): void => {
  try {
    const uploadInfo = getUploadInfo();
    
    // Check directory exists (for local storage)
    let directoryStatus = true;
    if (!useCloudinary) {
      directoryStatus = fs.existsSync(imagesDir);
    }
    
    // Check Cloudinary configuration (for production)
    let cloudinaryConfigured = false;
    if (useCloudinary) {
      cloudinaryConfigured = !!(
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET
      );
    }
    
    const isHealthy = useCloudinary ? cloudinaryConfigured : directoryStatus;
    
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      message: isHealthy ? 'Upload service is healthy' : 'Upload service has issues',
      status: isHealthy ? 'healthy' : 'unhealthy',
      mode: uploadInfo.mode,
      config: {
        maxFileSize: uploadInfo.maxSize,
        allowedTypes: uploadInfo.allowedTypes,
        folders: uploadInfo.folders,
        storage: useCloudinary ? 'cloudinary' : 'local'
      },
      checks: {
        cloudinary: useCloudinary ? (cloudinaryConfigured ? 'configured' : 'not configured') : 'not used',
        localStorage: !useCloudinary ? (directoryStatus ? 'available' : 'unavailable') : 'not used'
      },
      endpoints: {
        uploadSingle: 'POST /api/upload/image',
        uploadMultiple: 'POST /api/upload/images',
        deleteImage: 'DELETE /api/upload/image/:filename',
        imageInfo: 'GET /api/upload/info/:filename',
        listImages: 'GET /api/upload/list',
        systemInfo: 'GET /api/upload/info',
        health: 'GET /api/upload/health'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message || 'HEALTH_CHECK_FAILED'
    });
  }
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
router.use((error: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('❌ Upload route error:', error);
  
  // Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 5MB.',
        error: 'FILE_SIZE_LIMIT_EXCEEDED',
        maxSize: '5MB'
      });
      return;
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed per upload.',
        error: 'FILE_COUNT_LIMIT_EXCEEDED',
        maxFiles: 5
      });
      return;
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        message: 'Unexpected field name. Use "image" for single upload or "images" for multiple.',
        error: 'UNEXPECTED_FIELD'
      });
      return;
    }
  }
  
  // File type errors
  if (error.message && error.message.includes('Only image files')) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE',
      allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp']
    });
    return;
  }
  
  // Generic error
  res.status(500).json({
    success: false,
    message: 'Upload service error',
    error: error.message || 'UPLOAD_SERVICE_ERROR'
  });
});

// ============================================
// EXPORTS
// ============================================
export default router;