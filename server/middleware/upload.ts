// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { v4 as uuidv4 } from 'uuid';

// // Check if we should use cloudinary (production) or local storage (development)
// const useCloudinary = process.env.NODE_ENV === 'production';

// // ✅ Base upload directory - ABSOLUTE PATH
// const baseUploadDir = path.join(process.cwd(), 'server', 'uploads');

// // ✅ Helper function to ensure directory exists
// const ensureDirectoryExists = (dirPath: string) => {
//   if (!fs.existsSync(dirPath)) {
//     fs.mkdirSync(dirPath, { recursive: true });
//     console.log('✅ Created directory:', dirPath);
//   }
// };

// // Setup local directories only in development
// if (!useCloudinary) {
//   ensureDirectoryExists(baseUploadDir);
//   ensureDirectoryExists(path.join(baseUploadDir, 'slider-images'));
// }

// // Storage configuration - memory storage for cloudinary, disk for local
// const storage = useCloudinary 
//   ? multer.memoryStorage() 
//   : multer.diskStorage({
//       destination: (req, file, cb) => {
//         let uploadPath = baseUploadDir;
        
//         if (req.path.includes('slider') || req.body.type === 'slider') {
//           uploadPath = path.join(baseUploadDir, 'slider-images');
//         }
        
//         // ✅ CRITICAL: Ensure directory exists before saving
//         ensureDirectoryExists(uploadPath);
        
//         console.log('📁 Upload destination:', uploadPath);
//         cb(null, uploadPath);
//       },
//       filename: (req, file, cb) => {
//         const uniqueId = uuidv4();
//         const ext = path.extname(file.originalname);
        
//         let prefix = 'image';
//         if (req.path.includes('slider') || req.body.type === 'slider') {
//           prefix = 'image'; // ✅ Changed from 'slider' to 'image' to match your existing filename pattern
//         } else if (req.path.includes('menu') || req.body.type === 'menu') {
//           prefix = 'menu';
//         }
        
//         const filename = `${prefix}-${uniqueId}${ext}`;
//         console.log('📝 Generated filename:', filename);
//         cb(null, filename);
//       }
//     });

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

// export default upload;

// // Named exports
// export const uploadSlider = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: fileFilter
// });

// export const uploadMenu = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: fileFilter
// });

// // Helper function
// export const getUploadInfo = () => ({
//   mode: useCloudinary ? 'cloudinary' : 'local',
//   baseDir: useCloudinary ? 'cloudinary' : baseUploadDir,
//   maxSize: '5MB',
//   allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp']
// });

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// ✅ Check if Cloudinary is configured (works in both dev and prod)
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

console.log('☁️ Cloudinary Upload Mode:', useCloudinary ? 'ENABLED' : 'DISABLED');

// ✅ Base upload directory - ABSOLUTE PATH
const baseUploadDir = path.join(process.cwd(), 'server', 'uploads');

// ✅ Helper function to ensure directory exists
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log('✅ Created directory:', dirPath);
  }
};

// Setup local directories only if NOT using Cloudinary
if (!useCloudinary) {
  ensureDirectoryExists(baseUploadDir);
  ensureDirectoryExists(path.join(baseUploadDir, 'slider-images'));
  console.log('💾 Using local disk storage');
} else {
  console.log('☁️ Using Cloudinary memory storage');
}

// ✅ Storage configuration - memory storage for cloudinary, disk for local
const storage = useCloudinary 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = baseUploadDir;
        
        if (req.path.includes('slider') || req.body.type === 'slider') {
          uploadPath = path.join(baseUploadDir, 'slider-images');
        }
        
        // ✅ CRITICAL: Ensure directory exists before saving
        ensureDirectoryExists(uploadPath);
        
        console.log('📁 Upload destination:', uploadPath);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const ext = path.extname(file.originalname);
        
        let prefix = 'image';
        if (req.path.includes('slider') || req.body.type === 'slider') {
          prefix = 'image';
        } else if (req.path.includes('menu') || req.body.type === 'menu') {
          prefix = 'menu';
        }
        
        const filename = `${prefix}-${uniqueId}${ext}`;
        console.log('📝 Generated filename:', filename);
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
