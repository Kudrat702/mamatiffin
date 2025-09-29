// routes/uploadRoutes.ts - IMPROVED VERSION
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// IMPROVED: Define upload directory once at the top
const uploadsBaseDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadsBaseDir, 'images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log('✅ Created images directory:', imagesDir);
}

// Enhanced multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir); // Use variable instead of recreating path
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, filename);
  }
});

// File filter for allowed image types
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Upload controller function
const uploadImage = (req: express.Request, res: express.Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
        error: 'FILE_REQUIRED'
      });
      return;
    }

    const fileUrl = `/uploads/images/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl,
        fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: 'UPLOAD_FAILED'
    });
  }
};

// STEP 1: Image upload route
router.post('/image', upload.single('image'), uploadImage);

// STEP 2: Multiple images upload route
router.post('/images', upload.array('images', 5), (req, res) => {
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

    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/images/${file.filename}`,
      fullUrl: `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`
    }));

    res.status(200).json({
      success: true,
      message: `${files.length} images uploaded successfully`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: 'UPLOAD_FAILED'
    });
  }
});

// STEP 3: Delete uploaded image
router.delete('/image/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(imagesDir, filename); // Use variable
    
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found',
        error: 'FILE_NOT_FOUND'
      });
      return;
    }
    
    fs.unlinkSync(filePath);
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      filename: filename
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: 'DELETE_FAILED'
    });
  }
});

// STEP 4: Get upload info
router.get('/info/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(imagesDir, filename); // Use variable
    
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
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/images/${filename}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/images/${filename}`
      }
    });
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: 'INFO_FAILED'
    });
  }
});

// STEP 5: List all uploaded images
router.get('/list', (req, res) => {
  try {
    if (!fs.existsSync(imagesDir)) {
      res.status(200).json({
        success: true,
        message: 'No uploads directory found',
        data: []
      });
      return;
    }
    
    const files = fs.readdirSync(imagesDir); // Use variable
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });
    
    const fileList = imageFiles.map(filename => {
      const filePath = path.join(imagesDir, filename);
      const stats = fs.statSync(filePath);
      
      return {
        filename: filename,
        size: stats.size,
        created: stats.birthtime,
        url: `/uploads/images/${filename}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/images/${filename}`
      };
    });
    
    res.status(200).json({
      success: true,
      message: `Found ${fileList.length} uploaded images`,
      data: fileList
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: 'LIST_FAILED'
    });
  }
});

// STEP 6: Health check route
router.get('/health', (req, res) => {
  const dirExists = fs.existsSync(imagesDir);
  
  res.status(200).json({
    success: true,
    message: 'Upload service is running',
    config: {
      maxFileSize: '5MB',
      allowedTypes: ['JPEG', 'PNG', 'WebP'],
      uploadPath: imagesDir, // Use variable
      directoryExists: dirExists
    },
    endpoints: {
      upload: 'POST /api/upload/image',
      multipleUpload: 'POST /api/upload/images',
      delete: 'DELETE /api/upload/image/:filename',
      info: 'GET /api/upload/info/:filename',
      list: 'GET /api/upload/list',
      health: 'GET /api/upload/health'
    }
  });
});

// Error handling middleware
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size too large. Maximum allowed size is 5MB.',
        error: 'FILE_SIZE_LIMIT_EXCEEDED'
      });
      return;
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.',
        error: 'FILE_COUNT_LIMIT_EXCEEDED'
      });
      return;
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
    return;
  }
  
  res.status(500).json({
    success: false,
    message: 'Upload service error',
    error: 'UPLOAD_SERVICE_ERROR'
  });
});

export default router;