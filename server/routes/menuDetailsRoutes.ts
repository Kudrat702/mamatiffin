import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  createOrUpdateVegMenu,
  createOrUpdateNonVegMenu,
  getAllVegMenus,
  getAllNonVegMenus,
  getVegMenusByCategory,
  getNonVegMenusByCategory,
  deleteMenuByCategoryAndType,
  uploadImage
} from '../controllers/menuController';

import { uploadMenu } from '../middleware/upload';
import { MenuSearchService } from '../services/menuSearch.service';
import { MenuAdminService } from '../services/menuAdmin.service';
import { ValidationMiddleware } from '../middleware/validation.middleware';
import { SecurityMiddleware } from '../middleware/security.middleware';

type AllowedCategory = 'veg' | 'non-veg';

interface MenuQueryParams {
  category?: string;
  menuType?: string;
  page?: string;
  limit?: string;
}

const router = express.Router();
const menuSearchService = new MenuSearchService();

// Apply global security middleware
router.use(SecurityMiddleware.securityHeaders);
router.use(SecurityMiddleware.sanitizeLogging);
router.use(SecurityMiddleware.rateLimit);

/**
 * FRONTEND: Get menu by diet and category
 * GET /api/menus/:diet/:category
 */
router.get(
  '/menus/:diet/:category',
  ValidationMiddleware.validateDietParam,
  ValidationMiddleware.sanitizeSearchParams,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { diet, category } = req.params;

      console.log(`🔍 Searching for menu: ${diet} - ${category}`);

      const searchResult = await menuSearchService.searchMenu(diet as AllowedCategory, category!);

      if (searchResult.found) {
        res.json({
          success: true,
          message: 'Menu retrieved successfully',
          data: searchResult.data,
          matchType: searchResult.matchType,
          searchedFor: { diet, category },
          foundMenuType: searchResult.data.menuType
        });
        return;
      }

      const availableMenus = await menuSearchService.getAvailableMenus(diet as AllowedCategory);
      res.status(404).json({
        success: false,
        message: `Menu not found for ${diet} ${category}`,
        searchedFor: { diet, category },
        availableMenus: availableMenus.map(m => m.menuType),
        suggestions: availableMenus.length > 0 ? [
          `Try one of these available ${diet} menus:`,
          ...availableMenus.slice(0, 3).map(m => `• ${m.menuType}`)
        ] : [`No ${diet} menus available in database`]
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * ADMIN: Get all menus for admin panel
 * GET /api/admin/menu-details?category=veg&menuType=breakfast&page=1&limit=10
 */
router.get(
  '/admin/menu-details',
  ValidationMiddleware.validateQueryParams,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, menuType, page = '1', limit = '10' } = req.query as MenuQueryParams;

      const result = await MenuAdminService.getMenusForAdmin(
        category,
        menuType,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        message: 'Menus retrieved successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * ADMIN: Create/Update menu (unified endpoint)
 * POST /api/admin/menu
 */
router.post(
  '/admin/menu',
  uploadMenu.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🚀 Admin menu CRUD endpoint called');
      console.log('📦 Request received with category:', req.body.category);
      console.log('📎 File upload:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'None');

      const mappedBody = MenuAdminService.mapRequestBody(req.body);
      req.body = mappedBody;

      console.log('✅ Processed request:', {
        category: req.body.category,
        menuType: req.body.menuType,
        title: req.body.title,
        priceMonthly: req.body.priceMonthly,
        priceTrial: req.body.priceTrial,
        hasImage: !!req.file
      });

      menuSearchService.clearCache();

      if (req.body.category === 'non-veg') {
        console.log('🥩 Processing Non-Veg menu');
        await createOrUpdateNonVegMenu(req, res);
      } else {
        console.log('🥬 Processing Veg menu');
        await createOrUpdateVegMenu(req, res);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DATABASE FETCH ENDPOINTS
 */
router.get('/veg-menus', getAllVegMenus);
router.get('/non-veg-menus', getAllNonVegMenus);
router.get(
  '/veg-menus/category/:category',
  ValidationMiddleware.sanitizeSearchParams,
  getVegMenusByCategory
);
router.get(
  '/non-veg-menus/category/:category',
  ValidationMiddleware.sanitizeSearchParams,
  getNonVegMenusByCategory
);

/**
 * CREATE/UPDATE ENDPOINTS
 */
router.post(
  '/veg-menu-details',
  uploadMenu.single('image'),
  ValidationMiddleware.validateFileUpload,
  createOrUpdateVegMenu
);
router.post(
  '/non-veg-menu-details',
  uploadMenu.single('image'),
  ValidationMiddleware.validateFileUpload,
  createOrUpdateNonVegMenu
);

/**
 * DELETE ENDPOINT
 */
router.delete(
  '/admin/:category/:menuType',
  ValidationMiddleware.validateDietParam,
  ValidationMiddleware.validateMenuType,
  ValidationMiddleware.sanitizeSearchParams,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, menuType } = req.params;

      console.log(`🗑️ Delete request for: ${category} - ${menuType}`);

      menuSearchService.clearCache();

      await deleteMenuByCategoryAndType(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * IMAGE UPLOAD ENDPOINT
 */
router.post(
  '/upload-image',
  uploadMenu.single('image'),
  ValidationMiddleware.validateFileUpload,
  uploadImage
);

/**
 * HEALTH CHECK ENDPOINT
 */
router.get(
  '/health',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const healthStatus = await MenuAdminService.getHealthStatus();
      res.json(healthStatus);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 404 HANDLER
 */
router.use((req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/menus/:diet/:category',
      'GET /api/admin/menu-details',
      'GET /api/veg-menus',
      'GET /api/non-veg-menus',
      'POST /api/admin/menu',
      'POST /api/veg-menu-details',
      'POST /api/non-veg-menu-details',
      'DELETE /api/admin/:category/:menuType'
    ]
  });
});

/**
 * GLOBAL ERROR HANDLING MIDDLEWARE
 */
router.use((error: any, req: Request, res: Response, _next: NextFunction): void => {
  console.error('Route error:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    path: req.path,
    method: req.method
  });

  if (error.message?.includes('Only image files are allowed')) {
    res.status(400).json({
      success: false,
      message: 'Invalid file type. Only image files are allowed.',
      allowedTypes: ['JPEG', 'PNG', 'WebP', 'GIF']
    });
    return;
  }

  if (error.message?.includes('File too large')) {
    res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 5MB.',
      maxSize: '5MB'
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      error: error.message
    });
    return;
  }

  if (error.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid data format',
      error: 'Invalid ID format'
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default router;