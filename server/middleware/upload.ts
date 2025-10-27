// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { v4 as uuidv4 } from 'uuid';

// // Base upload directory (server/uploads)
// const baseUploadDir = path.join(__dirname, '../uploads');

// // Ensure base upload directory exists
// if (!fs.existsSync(baseUploadDir)) {
//   fs.mkdirSync(baseUploadDir, { recursive: true });
//   console.log('✅ Created base uploads directory:', baseUploadDir);
// }

// // Create ONLY slider-images subdirectory
// const sliderDir = path.join(baseUploadDir, 'slider-images');
// if (!fs.existsSync(sliderDir)) {
//   fs.mkdirSync(sliderDir, { recursive: true });
//   console.log('✅ Created slider-images directory:', sliderDir);
// }

// // Configure multer storage with dynamic destination
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // Slider images go to slider-images subfolder
//     // Everything else (menu, etc.) goes to root uploads folder
//     let uploadPath = baseUploadDir;
   
//     if (req.path.includes('slider') || req.body.type === 'slider') {
//       uploadPath = sliderDir;
//     }
   
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueId = uuidv4();
//     const ext = path.extname(file.originalname);
   
//     // Generate filename based on type
//     let prefix = 'image';
//     if (req.path.includes('slider') || req.body.type === 'slider') {
//       prefix = 'slider';
//     } else if (req.path.includes('menu') || req.body.type === 'menu') {
//       prefix = 'menu';
//     }
   
//     const filename = `${prefix}-${uniqueId}${ext}`;
//     cb(null, filename);
//   }
// });

// // File filter for images only
// const fileFilter = (req: any, file: any, cb: any) => {
//   const allowedTypes = /jpeg|jpg|png|gif|webp/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);
 
//   if (mimetype && extname) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
//   }
// };

// // Main upload middleware
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: fileFilter
// });

// // Export default and named exports
// export default upload;

// // Named export for slider uploads
// export const uploadSlider = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => cb(null, sliderDir),
//     filename: (req, file, cb) => {
//       const uniqueId = uuidv4();
//       const ext = path.extname(file.originalname);
//       cb(null, `slider-${uniqueId}${ext}`);
//     }
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: fileFilter
// });

// // Named export for menu uploads - saves to root uploads folder
// export const uploadMenu = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => cb(null, baseUploadDir), // Root uploads folder
//     filename: (req, file, cb) => {
//       const uniqueId = uuidv4();
//       const ext = path.extname(file.originalname);
//       cb(null, `menu-${uniqueId}${ext}`);
//     }
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: fileFilter
// });

// // Helper function to get upload directory info
// export const getUploadInfo = () => ({
//   baseDir: baseUploadDir,
//   sliderDir,
//   maxSize: '5MB',
//   allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp']
// });

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Check if we should use cloudinary (production) or local storage (development)
const useCloudinary = process.env.NODE_ENV === 'production';

// Base upload directory (server/uploads) - for local development only
const baseUploadDir = path.join(__dirname, '../uploads');

// Setup local directories only in development
if (!useCloudinary) {
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
    console.log('✅ Created base uploads directory:', baseUploadDir);
  }

  const sliderDir = path.join(baseUploadDir, 'slider-images');
  if (!fs.existsSync(sliderDir)) {
    fs.mkdirSync(sliderDir, { recursive: true });
    console.log('✅ Created slider-images directory:', sliderDir);
  }
}

// Storage configuration - memory storage for cloudinary, disk for local
const storage = useCloudinary 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = baseUploadDir;
        
        if (req.path.includes('slider') || req.body.type === 'slider') {
          uploadPath = path.join(baseUploadDir, 'slider-images');
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        
        let prefix = 'image';
        if (req.path.includes('slider') || req.body.type === 'slider') {
          prefix = 'slider';
        } else if (req.path.includes('menu') || req.body.type === 'menu') {
          prefix = 'menu';
        }
        
        const filename = `${prefix}-${uniqueId}${ext}`;
        cb(null, filename);
      }
    });

// File filter for images only
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

// Main upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

export default upload;

// Named exports
export const uploadSlider = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

export const uploadMenu = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Helper function
export const getUploadInfo = () => ({
  mode: useCloudinary ? 'cloudinary' : 'local',
  baseDir: useCloudinary ? 'cloudinary' : baseUploadDir,
  maxSize: '5MB',
  allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp']
});