// controllers/menuController.ts - CLOUDINARY INTEGRATED
import { Request, Response } from 'express';
import { MenuDetails, IWeeklyMenuDay } from '../models/menuDetails';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload';

// ✅ Check if Cloudinary is configured (works in both dev and prod)
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

console.log('🌐 Menu Cloudinary Status:', useCloudinary ? '✅ ENABLED' : '❌ DISABLED');
if (useCloudinary) {
  console.log('☁️ Menu Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
}

// Helper function to delete image (Cloudinary or local)
const deleteImage = async (imageUrl: string, imagePublicId?: string): Promise<boolean> => {
  try {
    if (useCloudinary && imagePublicId) {
      await deleteFromCloudinary(imagePublicId);
      console.log('✅ Menu image deleted from Cloudinary:', imagePublicId);
      return true;
    }
    console.log('ℹ️ Local file deletion skipped');
    return false;
  } catch (error) {
    console.error('❌ Error deleting menu image:', error);
    return false;
  }
};

// FIXED: Handle image URL generation for Cloudinary or local
const handleImageUrl = async (req: Request): Promise<{ imageUrl: string; imagePublicId?: string }> => {
  // Priority 1: New file upload
  if (req.file) {
    console.log('📤 Processing menu image upload...');
    
    if (useCloudinary) {
      // Upload to Cloudinary
      console.log('☁️ Uploading menu image to Cloudinary...');
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'menu-images',
        publicId: `menu-${Date.now()}`
      });
      console.log('✅ Menu image uploaded to Cloudinary:', result.secure_url);
      console.log('✅ Public ID:', result.public_id);
      return {
        imageUrl: result.secure_url,
        imagePublicId: result.public_id
      };
    } else {
      // Local development
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('💾 Menu image saved locally:', imageUrl);
      return { imageUrl };
    }
  }
  
  // Priority 2: Existing imageUrl (for updates)
  if (req.body.imageUrl) {
    console.log('🔄 Using existing image URL:', req.body.imageUrl);
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
    console.log('🌐 Using Cloudinary:', useCloudinary ? 'YES' : 'NO');
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
      console.log('✅ Adding imagePublicId to database:', imageData.imagePublicId);
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
    console.log('📊 Database entry:', {
      title: savedMenu?.title,
      imageUrl: savedMenu?.imageUrl,
      imagePublicId: savedMenu?.imagePublicId
    });

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
    console.log('🌐 Using Cloudinary:', useCloudinary ? 'YES' : 'NO');
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
      console.log('✅ Adding imagePublicId to database:', imageData.imagePublicId);
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
    console.log('📊 Database entry:', {
      title: savedMenu?.title,
      imageUrl: savedMenu?.imageUrl,
      imagePublicId: savedMenu?.imagePublicId
    });

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
    console.log('🗑️ Deleting menu:', { category, menuType });

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
    console.log('✅ Menu deleted successfully:', { category, menuType });

    res.json({
      success: true,
      message: `${category} ${menuType} menu deleted successfully`
    });
  } catch (error: any) {
    console.error('❌ Error deleting menu:', error);
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

    console.log('✅ Image uploaded successfully:', imageData);

    res.json({
      success: true,
      imageUrl: imageData.imageUrl,
      imagePublicId: imageData.imagePublicId,
      originalName: req.file.originalname,
      size: req.file.size,
      message: 'Image uploaded successfully'
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