// // controllers/menuController.ts - FIXED FOR UPLOADS PATH
// import { Request, Response } from 'express';
// import { MenuDetails, IWeeklyMenuDay } from '../models/menuDetails';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Setup upload directory - FIXED PATH
// const uploadDir = path.join(__dirname, '../uploads'); // ek level upar (server/uploads)
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
//   console.log('Upload directory created:', uploadDir);
// }

// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = 'menu-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
//     cb(null, uniqueName);
//   }
// });

// export const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF)'));
//     }
//   }
// });

// // Helper function to delete image files
// const deleteImageFile = (imageUrl: string): boolean => {
//   try {
//     if (imageUrl && imageUrl.includes('/uploads/')) {
//       const filename = imageUrl.split('/uploads/')[1];
//       if (filename) {
//         const filePath = path.join(uploadDir, filename);
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//           console.log('Image file deleted:', filename);
//           return true;
//         }
//       }
//     }
//     return false;
//   } catch (error) {
//     console.error('Error deleting image file:', error);
//     return false;
//   }
// };

// // FIXED: Handle image URL generation - supports both new upload and existing imageUrl
// const handleImageUrl = (req: Request): string => {
//   // Priority 1: New file upload
//   if (req.file) {
//     const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//     console.log('New image uploaded:', imageUrl);
//     return imageUrl;
//   }
  
//   // Priority 2: Existing imageUrl (for updates when no new image is selected)
//   if (req.body.imageUrl) {
//     console.log('Using existing image URL:', req.body.imageUrl);
//     return req.body.imageUrl;
//   }
  
//   return '';
// };

// // FIXED: Convert any format to proper Array format with better parsing
// const convertToArrayFormat = (weeklyMenu: any): IWeeklyMenuDay[] => {
//   const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
//   // If already array format, validate and return
//   if (Array.isArray(weeklyMenu) && weeklyMenu.length === 7) {
//     return weeklyMenu.map((dayMenu, index) => {
//       if (!dayMenu || typeof dayMenu !== 'object') {
//         return { day: days[index], items: [''] };
//       }
      
//       const items: string[] = Array.isArray(dayMenu.items) 
//         ? dayMenu.items.filter((item: string) => item && item.trim())
//         : [];
      
//       return {
//         day: dayMenu.day || days[index],
//         items: items.length > 0 ? items : ['']
//       };
//     });
//   }
  
//   // Convert object format to array (backward compatibility)
//   if (weeklyMenu && typeof weeklyMenu === 'object') {
//     const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
//     return days.map((day, index) => {
//       const dayKey = dayKeys[index];
//       const dayMenu = weeklyMenu[dayKey] || '';
      
//       // Support multiple separators: ||, |, comma
//       const items = dayMenu
//         .split(/\|\||,|\|/)
//         .map((item: string) => item.trim())
//         .filter((item: string) => item.length > 0);
      
//       return {
//         day,
//         items: items.length > 0 ? items : ['']
//       };
//     });
//   }
  
//   // Default fallback
//   return days.map(day => ({ day, items: [''] }));
// };

// // FIXED: Parse and validate weekly menu with better error handling
// const parseAndValidateWeeklyMenu = (weeklyMenu: any): { isValid: boolean; data?: IWeeklyMenuDay[]; error?: string } => {
//   let parsedMenu;
  
//   // Parse if it's a string
//   if (typeof weeklyMenu === 'string') {
//     try {
//       parsedMenu = JSON.parse(weeklyMenu);
//     } catch (error) {
//       console.log('Failed to parse weeklyMenu JSON, trying as plain string');
//       // If JSON parse fails, treat as simple string and create default structure
//       parsedMenu = null;
//     }
//   } else {
//     parsedMenu = weeklyMenu;
//   }

//   // Convert to proper array format
//   const arrayFormat = convertToArrayFormat(parsedMenu);
  
//   // Validate the array format
//   if (!Array.isArray(arrayFormat) || arrayFormat.length !== 7) {
//     return { 
//       isValid: false, 
//       error: `WeeklyMenu must have exactly 7 days, got ${arrayFormat?.length || 0}` 
//     };
//   }

//   // Validate each day has at least one item
//   const missingDays: string[] = [];
  
//   arrayFormat.forEach((dayMenu, index) => {
//     if (!dayMenu || !dayMenu.day || !Array.isArray(dayMenu.items)) {
//       missingDays.push(`Day ${index + 1}`);
//       return;
//     }
    
//     const validItems = dayMenu.items.filter(item => item && item.trim().length > 0);
//     if (validItems.length === 0) {
//       missingDays.push(dayMenu.day);
//     }
//   });
  
//   if (missingDays.length > 0) {
//     return { 
//       isValid: false, 
//       error: `Missing or empty menu items for days: ${missingDays.join(', ')}` 
//     };
//   }

//   return { isValid: true, data: arrayFormat };
// };

// // FIXED: Create or update VEG menu with all problem fixes
// export const createOrUpdateVegMenu = async (req: Request, res: Response): Promise<void> => {
//   try {
//     console.log('🚀 VEG Menu Controller called');
//     console.log('📦 Received body:', req.body);
//     console.log('📎 Received file:', req.file ? req.file.originalname : 'None');

//     const { 
//       menuType,
//       title,
//       description,
//       deliveryTime,
//       priceMonthly,
//       priceTrial,
//       weeklyMenu
//     } = req.body;

//     // Enhanced validation with specific error messages
//     const missingFields = [];
//     if (!menuType) missingFields.push('menuType');
//     if (!title) missingFields.push('title');
//     if (!description) missingFields.push('description');
//     if (!deliveryTime) missingFields.push('deliveryTime');
//     if (!priceMonthly) missingFields.push('priceMonthly');
//     if (!priceTrial) missingFields.push('priceTrial');

//     if (missingFields.length > 0) {
//       console.log('❌ Missing fields:', missingFields);
//       res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(', ')}`,
//         receivedFields: Object.keys(req.body)
//       });
//       return;
//     }

//     // FIXED: Handle image URL - supports both new upload and existing URL
//     const imageUrl = handleImageUrl(req);
//     if (!imageUrl) {
//       console.log('❌ No image provided');
//       res.status(400).json({
//         success: false,
//         message: 'Image is required. Please upload an image or provide imageUrl.'
//       });
//       return;
//     }

//     // FIXED: Parse and validate weekly menu with better error handling
//     const weeklyMenuValidation = parseAndValidateWeeklyMenu(weeklyMenu);
//     if (!weeklyMenuValidation.isValid) {
//       console.log('❌ Invalid weekly menu:', weeklyMenuValidation.error);
//       res.status(400).json({
//         success: false,
//         message: weeklyMenuValidation.error,
//         hint: 'WeeklyMenu should be an array of 7 objects with day and items properties'
//       });
//       return;
//     }

//     const menuData = {
//       category: 'veg' as const,
//       menuType,
//       title,
//       description,
//       imageUrl,
//       deliveryTime,
//       priceMonthly: parseFloat(priceMonthly.toString()),
//       priceTrial: parseFloat(priceTrial.toString()),
//       weeklyMenu: weeklyMenuValidation.data!
//     };

//     console.log('💾 Saving veg menu data:', {
//       ...menuData,
//       weeklyMenuCount: weeklyMenuValidation.data!.length,
//       hasImage: !!imageUrl
//     });

//     // Check if menu already exists
//     const existingMenu = await MenuDetails.findOne({ category: 'veg', menuType });

//     let savedMenu;
//     if (existingMenu) {
//       console.log('🔄 Updating existing veg menu:', existingMenu._id);
      
//       // Delete old image if new one is uploaded
//       if (req.file && existingMenu.imageUrl && existingMenu.imageUrl !== imageUrl) {
//         deleteImageFile(existingMenu.imageUrl);
//       }

//       savedMenu = await MenuDetails.findOneAndUpdate(
//         { category: 'veg', menuType },
//         menuData,
//         { new: true, runValidators: true }
//       );
//     } else {
//       console.log('✨ Creating new veg menu');
//       savedMenu = new MenuDetails(menuData);
//       await savedMenu.save();
//     }

//     console.log('✅ Veg menu saved successfully:', savedMenu?._id);

//     res.json({
//       success: true,
//       data: savedMenu,
//       message: existingMenu ? 'Veg menu updated successfully' : 'Veg menu created successfully'
//     });

//   } catch (error: any) {
//     console.error('💥 Error saving veg menu:', error);
    
//     // Clean up uploaded file if error occurs
//     if (req.file) {
//       deleteImageFile(`/uploads/${req.file.filename}`);
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Error saving veg menu',
//       error: error.message,
//       ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//     });
//   }
// };

// // FIXED: Create or update NON-VEG menu with all problem fixes
// export const createOrUpdateNonVegMenu = async (req: Request, res: Response): Promise<void> => {
//   try {
//     console.log('🚀 NON-VEG Menu Controller called');
//     console.log('📦 Received body:', req.body);
//     console.log('📎 Received file:', req.file ? req.file.originalname : 'None');

//     const { 
//       menuType,
//       title,
//       description,
//       deliveryTime,
//       priceMonthly,
//       priceTrial,
//       weeklyMenu
//     } = req.body;

//     // Enhanced validation
//     const missingFields = [];
//     if (!menuType) missingFields.push('menuType');
//     if (!title) missingFields.push('title');
//     if (!description) missingFields.push('description');
//     if (!deliveryTime) missingFields.push('deliveryTime');
//     if (!priceMonthly) missingFields.push('priceMonthly');
//     if (!priceTrial) missingFields.push('priceTrial');

//     if (missingFields.length > 0) {
//       console.log('❌ Missing fields:', missingFields);
//       res.status(400).json({
//         success: false,
//         message: `Missing required fields: ${missingFields.join(', ')}`,
//         receivedFields: Object.keys(req.body)
//       });
//       return;
//     }

//     // FIXED: Handle image URL - supports both new upload and existing URL
//     const imageUrl = handleImageUrl(req);
//     if (!imageUrl) {
//       console.log('❌ No image provided');
//       res.status(400).json({
//         success: false,
//         message: 'Image is required. Please upload an image or provide imageUrl.'
//       });
//       return;
//     }

//     // FIXED: Parse and validate weekly menu with better error handling
//     const weeklyMenuValidation = parseAndValidateWeeklyMenu(weeklyMenu);
//     if (!weeklyMenuValidation.isValid) {
//       console.log('❌ Invalid weekly menu:', weeklyMenuValidation.error);
//       res.status(400).json({
//         success: false,
//         message: weeklyMenuValidation.error,
//         hint: 'WeeklyMenu should be an array of 7 objects with day and items properties'
//       });
//       return;
//     }

//     const menuData = {
//       category: 'non-veg' as const,
//       menuType,
//       title,
//       description,
//       imageUrl,
//       deliveryTime,
//       priceMonthly: parseFloat(priceMonthly.toString()),
//       priceTrial: parseFloat(priceTrial.toString()),
//       weeklyMenu: weeklyMenuValidation.data!
//     };

//     console.log('💾 Saving non-veg menu data:', {
//       ...menuData,
//       weeklyMenuCount: weeklyMenuValidation.data!.length,
//       hasImage: !!imageUrl
//     });

//     // Check if menu already exists
//     const existingMenu = await MenuDetails.findOne({ category: 'non-veg', menuType });

//     let savedMenu;
//     if (existingMenu) {
//       console.log('🔄 Updating existing non-veg menu:', existingMenu._id);
      
//       // Delete old image if new one is uploaded
//       if (req.file && existingMenu.imageUrl && existingMenu.imageUrl !== imageUrl) {
//         deleteImageFile(existingMenu.imageUrl);
//       }

//       savedMenu = await MenuDetails.findOneAndUpdate(
//         { category: 'non-veg', menuType },
//         menuData,
//         { new: true, runValidators: true }
//       );
//     } else {
//       console.log('✨ Creating new non-veg menu');
//       savedMenu = new MenuDetails(menuData);
//       await savedMenu.save();
//     }

//     console.log('✅ Non-veg menu saved successfully:', savedMenu?._id);

//     res.json({
//       success: true,
//       data: savedMenu,
//       message: existingMenu ? 'Non-veg menu updated successfully' : 'Non-veg menu created successfully'
//     });

//   } catch (error: any) {
//     console.error('💥 Error saving non-veg menu:', error);
    
//     // Clean up uploaded file if error occurs
//     if (req.file) {
//       deleteImageFile(`/uploads/${req.file.filename}`);
//     }

//     res.status(500).json({
//       success: false,
//       message: 'Error saving non-veg menu',
//       error: error.message,
//       ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//     });
//   }
// };

// // FIXED: Get all VEG menus with proper weeklyMenu array format
// export const getAllVegMenus = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const menus = await MenuDetails.find({ category: 'veg' }).sort({ createdAt: -1 });
    
//     const formattedMenus = menus.map(menu => {
//       const menuObj = menu.toObject();
//       if (menuObj.weeklyMenu) {
//         menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
//       }
//       return menuObj;
//     });
    
//     console.log(`📦 Retrieved ${formattedMenus.length} veg menus with proper weeklyMenu format`);
    
//     res.json({
//       success: true,
//       data: formattedMenus,
//       count: formattedMenus.length,
//       message: 'Veg menus retrieved successfully'
//     });
//   } catch (error: any) {
//     console.error('Error fetching veg menus:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching veg menus',
//       error: error.message
//     });
//   }
// };

// // FIXED: Get all NON-VEG menus with proper weeklyMenu array format
// export const getAllNonVegMenus = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const menus = await MenuDetails.find({ category: 'non-veg' }).sort({ createdAt: -1 });
    
//     const formattedMenus = menus.map(menu => {
//       const menuObj = menu.toObject();
//       if (menuObj.weeklyMenu) {
//         menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
//       }
//       return menuObj;
//     });
    
//     console.log(`📦 Retrieved ${formattedMenus.length} non-veg menus with proper weeklyMenu format`);
    
//     res.json({
//       success: true,
//       data: formattedMenus,
//       count: formattedMenus.length,
//       message: 'Non-veg menus retrieved successfully'
//     });
//   } catch (error: any) {
//     console.error('Error fetching non-veg menus:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching non-veg menus',
//       error: error.message
//     });
//   }
// };

// // Get VEG menus by category (menuType) with proper formatting
// export const getVegMenusByCategory = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { category } = req.params;
//     console.log('Fetching veg menus for category:', category);
    
//     const menus = await MenuDetails.find({ 
//       category: 'veg', 
//       menuType: category 
//     }).sort({ createdAt: -1 });
    
//     const formattedMenus = menus.map(menu => {
//       const menuObj = menu.toObject();
//       menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
//       return menuObj;
//     });
    
//     res.json({
//       success: true,
//       data: formattedMenus,
//       count: formattedMenus.length,
//       category: category,
//       message: `Veg ${category} menus retrieved successfully`
//     });
//   } catch (error: any) {
//     console.error('Error fetching veg menus by category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching veg menus by category',
//       error: error.message
//     });
//   }
// };

// // Get NON-VEG menus by category (menuType) with proper formatting
// export const getNonVegMenusByCategory = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { category } = req.params;
//     console.log('Fetching non-veg menus for category:', category);
    
//     const menus = await MenuDetails.find({ 
//       category: 'non-veg', 
//       menuType: category 
//     }).sort({ createdAt: -1 });
    
//     const formattedMenus = menus.map(menu => {
//       const menuObj = menu.toObject();
//       menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
//       return menuObj;
//     });
    
//     res.json({
//       success: true,
//       data: formattedMenus,
//       count: formattedMenus.length,
//       category: category,
//       message: `Non-veg ${category} menus retrieved successfully`
//     });
//   } catch (error: any) {
//     console.error('Error fetching non-veg menus by category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching non-veg menus by category',
//       error: error.message
//     });
//   }
// };

// // Delete menu by category and menuType
// export const deleteMenuByCategoryAndType = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { category, menuType } = req.params;
//     console.log('Deleting menu:', { category, menuType });

//     if (!['veg', 'non-veg'].includes(category)) {
//       res.status(400).json({
//         success: false,
//         message: 'Invalid category. Must be "veg" or "non-veg"'
//       });
//       return;
//     }

//     const menu = await MenuDetails.findOne({ category, menuType });
//     if (!menu) {
//       res.status(404).json({
//         success: false,
//         message: `Menu not found for ${category} ${menuType}`
//       });
//       return;
//     }

//     if (menu.imageUrl) {
//       const deleted = deleteImageFile(menu.imageUrl);
//       if (deleted) {
//         console.log('Associated image deleted for menu:', menuType);
//       }
//     }

//     await MenuDetails.findOneAndDelete({ category, menuType });
//     console.log('Menu deleted successfully:', { category, menuType });

//     res.json({
//       success: true,
//       message: `${category} ${menuType} menu deleted successfully`
//     });
//   } catch (error: any) {
//     console.error('Error deleting menu:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting menu',
//       error: error.message
//     });
//   }
// };

// // Image upload endpoint
// export const uploadImage = async (req: Request, res: Response): Promise<void> => {
//   try {
//     if (!req.file) {
//       res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//       return;
//     }

//     const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

//     console.log('Image uploaded successfully:', {
//       originalName: req.file.originalname,
//       filename: req.file.filename,
//       size: req.file.size,
//       url: imageUrl
//     });

//     res.json({
//       success: true,
//       imageUrl: imageUrl,
//       filename: req.file.filename,
//       originalName: req.file.originalname,
//       size: req.file.size,
//       message: 'Image uploaded successfully'
//     });
//   } catch (error: any) {
//     console.error('Upload error:', error);
//     if (req.file) {
//       deleteImageFile(`/uploads/${req.file.filename}`);
//     }
//     res.status(500).json({
//       success: false,
//       message: 'Failed to upload image',
//       error: error.message
//     });
//   }
// };

// // FIXED: Get all menus for admin with proper weeklyMenu formatting
// export const getAllMenusForAdmin = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { category, menuType, page = 1, limit = 20 } = req.query;
    
//     const filter: any = {};
//     if (category && ['veg', 'non-veg'].includes(category as string)) {
//       filter.category = category;
//     }
//     if (menuType) {
//       filter.menuType = menuType;
//     }

//     const pageNum = parseInt(page as string);
//     const limitNum = parseInt(limit as string);
//     const skip = (pageNum - 1) * limitNum;

//     const [menus, total] = await Promise.all([
//       MenuDetails.find(filter)
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limitNum),
//       MenuDetails.countDocuments(filter)
//     ]);

//     const formattedMenus = menus.map(menu => {
//       const menuObj = menu.toObject();
//       menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
//       return menuObj;
//     });

//     console.log(`📦 Retrieved ${formattedMenus.length} admin menus with proper formatting`);

//     res.json({
//       success: true,
//       data: formattedMenus,
//       pagination: {
//         page: pageNum,
//         limit: limitNum,
//         total,
//         totalPages: Math.ceil(total / limitNum),
//         hasNext: pageNum * limitNum < total,
//         hasPrev: pageNum > 1
//       },
//       count: formattedMenus.length,
//       message: 'Admin menus fetched successfully'
//     });
//   } catch (error: any) {
//     console.error('Error fetching admin menus:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching admin menus',
//       error: error.message
//     });
//   }
// };

// controllers/menuController.ts - CLOUDINARY INTEGRATED
import { Request, Response } from 'express';
import { MenuDetails, IWeeklyMenuDay } from '../models/menuDetails';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload';

const useCloudinary = process.env.NODE_ENV === 'production';

// Helper function to delete image (Cloudinary or local)
const deleteImage = async (imageUrl: string, imagePublicId?: string): Promise<boolean> => {
  try {
    if (useCloudinary && imagePublicId) {
      await deleteFromCloudinary(imagePublicId);
      console.log('Cloudinary image deleted:', imagePublicId);
      return true;
    }
    // Local deletion logic for development (existing code)
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

// FIXED: Handle image URL generation for Cloudinary or local
const handleImageUrl = async (req: Request): Promise<{ imageUrl: string; imagePublicId?: string }> => {
  // Priority 1: New file upload
  if (req.file) {
    if (useCloudinary) {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'menus',
        publicId: `menu-${Date.now()}`
      });
      console.log('Image uploaded to Cloudinary:', result.secure_url);
      return {
        imageUrl: result.secure_url,
        imagePublicId: result.public_id
      };
    } else {
      // Local development
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('New image uploaded locally:', imageUrl);
      return { imageUrl };
    }
  }
  
  // Priority 2: Existing imageUrl (for updates)
  if (req.body.imageUrl) {
    console.log('Using existing image URL:', req.body.imageUrl);
    return {
      imageUrl: req.body.imageUrl,
      imagePublicId: req.body.imagePublicId
    };
  }
  
  return { imageUrl: '' };
};

// Convert any format to proper Array format
const convertToArrayFormat = (weeklyMenu: any): IWeeklyMenuDay[] => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  if (Array.isArray(weeklyMenu) && weeklyMenu.length === 7) {
    return weeklyMenu.map((dayMenu, index) => {
      if (!dayMenu || typeof dayMenu !== 'object') {
        return { day: days[index], items: [''] };
      }
      
      const items: string[] = Array.isArray(dayMenu.items) 
        ? dayMenu.items.filter((item: string) => item && item.trim())
        : [];
      
      return {
        day: dayMenu.day || days[index],
        items: items.length > 0 ? items : ['']
      };
    });
  }
  
  if (weeklyMenu && typeof weeklyMenu === 'object') {
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    return days.map((day, index) => {
      const dayKey = dayKeys[index];
      const dayMenu = weeklyMenu[dayKey] || '';
      
      const items = dayMenu
        .split(/\|\||,|\|/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
      
      return {
        day,
        items: items.length > 0 ? items : ['']
      };
    });
  }
  
  return days.map(day => ({ day, items: [''] }));
};

// Parse and validate weekly menu
const parseAndValidateWeeklyMenu = (weeklyMenu: any): { isValid: boolean; data?: IWeeklyMenuDay[]; error?: string } => {
  let parsedMenu;
  
  if (typeof weeklyMenu === 'string') {
    try {
      parsedMenu = JSON.parse(weeklyMenu);
    } catch (error) {
      console.log('Failed to parse weeklyMenu JSON');
      parsedMenu = null;
    }
  } else {
    parsedMenu = weeklyMenu;
  }

  const arrayFormat = convertToArrayFormat(parsedMenu);
  
  if (!Array.isArray(arrayFormat) || arrayFormat.length !== 7) {
    return { 
      isValid: false, 
      error: `WeeklyMenu must have exactly 7 days, got ${arrayFormat?.length || 0}` 
    };
  }

  const missingDays: string[] = [];
  
  arrayFormat.forEach((dayMenu, index) => {
    if (!dayMenu || !dayMenu.day || !Array.isArray(dayMenu.items)) {
      missingDays.push(`Day ${index + 1}`);
      return;
    }
    
    const validItems = dayMenu.items.filter(item => item && item.trim().length > 0);
    if (validItems.length === 0) {
      missingDays.push(dayMenu.day);
    }
  });
  
  if (missingDays.length > 0) {
    return { 
      isValid: false, 
      error: `Missing or empty menu items for days: ${missingDays.join(', ')}` 
    };
  }

  return { isValid: true, data: arrayFormat };
};

// Create or update VEG menu
export const createOrUpdateVegMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🚀 VEG Menu Controller called');
    console.log('📦 Received body:', req.body);
    console.log('📎 Received file:', req.file ? req.file.originalname : 'None');

    const { 
      menuType,
      title,
      description,
      deliveryTime,
      priceMonthly,
      priceTrial,
      weeklyMenu
    } = req.body;

    // Validation
    const missingFields = [];
    if (!menuType) missingFields.push('menuType');
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!deliveryTime) missingFields.push('deliveryTime');
    if (!priceMonthly) missingFields.push('priceMonthly');
    if (!priceTrial) missingFields.push('priceTrial');

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedFields: Object.keys(req.body)
      });
      return;
    }

    // Handle image upload
    const imageData = await handleImageUrl(req);
    if (!imageData.imageUrl) {
      console.log('❌ No image provided');
      res.status(400).json({
        success: false,
        message: 'Image is required. Please upload an image or provide imageUrl.'
      });
      return;
    }

    // Validate weekly menu
    const weeklyMenuValidation = parseAndValidateWeeklyMenu(weeklyMenu);
    if (!weeklyMenuValidation.isValid) {
      console.log('❌ Invalid weekly menu:', weeklyMenuValidation.error);
      res.status(400).json({
        success: false,
        message: weeklyMenuValidation.error,
        hint: 'WeeklyMenu should be an array of 7 objects with day and items properties'
      });
      return;
    }

    const menuData: any = {
      category: 'veg' as const,
      menuType,
      title,
      description,
      imageUrl: imageData.imageUrl,
      deliveryTime,
      priceMonthly: parseFloat(priceMonthly.toString()),
      priceTrial: parseFloat(priceTrial.toString()),
      weeklyMenu: weeklyMenuValidation.data!
    };

    // Add imagePublicId only if using Cloudinary
    if (imageData.imagePublicId) {
      menuData.imagePublicId = imageData.imagePublicId;
    }

    console.log('💾 Saving veg menu data');

    // Check if menu already exists
    const existingMenu = await MenuDetails.findOne({ category: 'veg', menuType });

    let savedMenu;
    if (existingMenu) {
      console.log('🔄 Updating existing veg menu:', existingMenu._id);
      
      // Delete old image if new one is uploaded
      if (req.file && existingMenu.imageUrl !== imageData.imageUrl) {
        await deleteImage(existingMenu.imageUrl, existingMenu.imagePublicId);
      }

      savedMenu = await MenuDetails.findOneAndUpdate(
        { category: 'veg', menuType },
        menuData,
        { new: true, runValidators: true }
      );
    } else {
      console.log('✨ Creating new veg menu');
      savedMenu = new MenuDetails(menuData);
      await savedMenu.save();
    }

    console.log('✅ Veg menu saved successfully:', savedMenu?._id);

    res.json({
      success: true,
      data: savedMenu,
      message: existingMenu ? 'Veg menu updated successfully' : 'Veg menu created successfully'
    });

  } catch (error: any) {
    console.error('💥 Error saving veg menu:', error);

    res.status(500).json({
      success: false,
      message: 'Error saving veg menu',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Create or update NON-VEG menu
export const createOrUpdateNonVegMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🚀 NON-VEG Menu Controller called');
    console.log('📦 Received body:', req.body);
    console.log('📎 Received file:', req.file ? req.file.originalname : 'None');

    const { 
      menuType,
      title,
      description,
      deliveryTime,
      priceMonthly,
      priceTrial,
      weeklyMenu
    } = req.body;

    // Validation
    const missingFields = [];
    if (!menuType) missingFields.push('menuType');
    if (!title) missingFields.push('title');
    if (!description) missingFields.push('description');
    if (!deliveryTime) missingFields.push('deliveryTime');
    if (!priceMonthly) missingFields.push('priceMonthly');
    if (!priceTrial) missingFields.push('priceTrial');

    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedFields: Object.keys(req.body)
      });
      return;
    }

    // Handle image upload
    const imageData = await handleImageUrl(req);
    if (!imageData.imageUrl) {
      console.log('❌ No image provided');
      res.status(400).json({
        success: false,
        message: 'Image is required. Please upload an image or provide imageUrl.'
      });
      return;
    }

    // Validate weekly menu
    const weeklyMenuValidation = parseAndValidateWeeklyMenu(weeklyMenu);
    if (!weeklyMenuValidation.isValid) {
      console.log('❌ Invalid weekly menu:', weeklyMenuValidation.error);
      res.status(400).json({
        success: false,
        message: weeklyMenuValidation.error,
        hint: 'WeeklyMenu should be an array of 7 objects with day and items properties'
      });
      return;
    }

    const menuData: any = {
      category: 'non-veg' as const,
      menuType,
      title,
      description,
      imageUrl: imageData.imageUrl,
      deliveryTime,
      priceMonthly: parseFloat(priceMonthly.toString()),
      priceTrial: parseFloat(priceTrial.toString()),
      weeklyMenu: weeklyMenuValidation.data!
    };

    // Add imagePublicId only if using Cloudinary
    if (imageData.imagePublicId) {
      menuData.imagePublicId = imageData.imagePublicId;
    }

    console.log('💾 Saving non-veg menu data');

    // Check if menu already exists
    const existingMenu = await MenuDetails.findOne({ category: 'non-veg', menuType });

    let savedMenu;
    if (existingMenu) {
      console.log('🔄 Updating existing non-veg menu:', existingMenu._id);
      
      // Delete old image if new one is uploaded
      if (req.file && existingMenu.imageUrl !== imageData.imageUrl) {
        await deleteImage(existingMenu.imageUrl, existingMenu.imagePublicId);
      }

      savedMenu = await MenuDetails.findOneAndUpdate(
        { category: 'non-veg', menuType },
        menuData,
        { new: true, runValidators: true }
      );
    } else {
      console.log('✨ Creating new non-veg menu');
      savedMenu = new MenuDetails(menuData);
      await savedMenu.save();
    }

    console.log('✅ Non-veg menu saved successfully:', savedMenu?._id);

    res.json({
      success: true,
      data: savedMenu,
      message: existingMenu ? 'Non-veg menu updated successfully' : 'Non-veg menu created successfully'
    });

  } catch (error: any) {
    console.error('💥 Error saving non-veg menu:', error);

    res.status(500).json({
      success: false,
      message: 'Error saving non-veg menu',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

// Get all VEG menus
export const getAllVegMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const menus = await MenuDetails.find({ category: 'veg' }).sort({ createdAt: -1 });
    
    const formattedMenus = menus.map(menu => {
      const menuObj = menu.toObject();
      if (menuObj.weeklyMenu) {
        menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
      }
      return menuObj;
    });
    
    console.log(`📦 Retrieved ${formattedMenus.length} veg menus`);
    
    res.json({
      success: true,
      data: formattedMenus,
      count: formattedMenus.length,
      message: 'Veg menus retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching veg menus:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching veg menus',
      error: error.message
    });
  }
};

// Get all NON-VEG menus
export const getAllNonVegMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const menus = await MenuDetails.find({ category: 'non-veg' }).sort({ createdAt: -1 });
    
    const formattedMenus = menus.map(menu => {
      const menuObj = menu.toObject();
      if (menuObj.weeklyMenu) {
        menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
      }
      return menuObj;
    });
    
    console.log(`📦 Retrieved ${formattedMenus.length} non-veg menus`);
    
    res.json({
      success: true,
      data: formattedMenus,
      count: formattedMenus.length,
      message: 'Non-veg menus retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching non-veg menus:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg menus',
      error: error.message
    });
  }
};

// Get VEG menus by category
export const getVegMenusByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    console.log('Fetching veg menus for category:', category);
    
    const menus = await MenuDetails.find({ 
      category: 'veg', 
      menuType: category 
    }).sort({ createdAt: -1 });
    
    const formattedMenus = menus.map(menu => {
      const menuObj = menu.toObject();
      menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
      return menuObj;
    });
    
    res.json({
      success: true,
      data: formattedMenus,
      count: formattedMenus.length,
      category: category,
      message: `Veg ${category} menus retrieved successfully`
    });
  } catch (error: any) {
    console.error('Error fetching veg menus by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching veg menus by category',
      error: error.message
    });
  }
};

// Get NON-VEG menus by category
export const getNonVegMenusByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    console.log('Fetching non-veg menus for category:', category);
    
    const menus = await MenuDetails.find({ 
      category: 'non-veg', 
      menuType: category 
    }).sort({ createdAt: -1 });
    
    const formattedMenus = menus.map(menu => {
      const menuObj = menu.toObject();
      menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
      return menuObj;
    });
    
    res.json({
      success: true,
      data: formattedMenus,
      count: formattedMenus.length,
      category: category,
      message: `Non-veg ${category} menus retrieved successfully`
    });
  } catch (error: any) {
    console.error('Error fetching non-veg menus by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg menus by category',
      error: error.message
    });
  }
};

// Delete menu by category and menuType
export const deleteMenuByCategoryAndType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, menuType } = req.params;
    console.log('Deleting menu:', { category, menuType });

    if (!['veg', 'non-veg'].includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category. Must be "veg" or "non-veg"'
      });
      return;
    }

    const menu = await MenuDetails.findOne({ category, menuType });
    if (!menu) {
      res.status(404).json({
        success: false,
        message: `Menu not found for ${category} ${menuType}`
      });
      return;
    }

    // Delete image
    if (menu.imageUrl) {
      await deleteImage(menu.imageUrl, menu.imagePublicId);
    }

    await MenuDetails.findOneAndDelete({ category, menuType });
    console.log('Menu deleted successfully:', { category, menuType });

    res.json({
      success: true,
      message: `${category} ${menuType} menu deleted successfully`
    });
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu',
      error: error.message
    });
  }
};

// Image upload endpoint
export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const imageData = await handleImageUrl(req);

    console.log('Image uploaded successfully:', imageData);

    res.json({
      success: true,
      imageUrl: imageData.imageUrl,
      imagePublicId: imageData.imagePublicId,
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

// Get all menus for admin
export const getAllMenusForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, menuType, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (category && ['veg', 'non-veg'].includes(category as string)) {
      filter.category = category;
    }
    if (menuType) {
      filter.menuType = menuType;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [menus, total] = await Promise.all([
      MenuDetails.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      MenuDetails.countDocuments(filter)
    ]);

    const formattedMenus = menus.map(menu => {
      const menuObj = menu.toObject();
      menuObj.weeklyMenu = convertToArrayFormat(menuObj.weeklyMenu);
      return menuObj;
    });

    console.log(`📦 Retrieved ${formattedMenus.length} admin menus`);

    res.json({
      success: true,
      data: formattedMenus,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      },
      count: formattedMenus.length,
      message: 'Admin menus fetched successfully'
    });
  } catch (error: any) {
    console.error('Error fetching admin menus:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin menus',
      error: error.message
    });
  }
};