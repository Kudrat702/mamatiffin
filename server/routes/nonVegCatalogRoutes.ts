// routes/nonVegCatalogRoutes.ts - FIXED VERSION
import express, { Request, Response } from 'express';
import { MenuDetails } from '../models/menuDetails';

const router = express.Router();

console.log('✅ Loading Non-Veg Catalog Routes');

/**
 * ✅ ROUTE ORDER: Specific routes FIRST, parameterized routes LAST
 * 1. /health
 * 2. /categories/summary
 * 3. /search/:searchTerm
 * 4. /bulk/:category
 * 5. /category/:category
 * 6. / (root)
 * 7. /:id (MUST BE LAST!)
 */

/**
 * NON-VEG catalog health check
 * GET /api/non-veg-menus/health
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Non-veg catalog service is running',
    timestamp: new Date().toISOString(),
    type: 'non-veg',
    availableEndpoints: [
      'GET /api/non-veg-menus',
      'GET /api/non-veg-menus/health',
      'GET /api/non-veg-menus/categories/summary',
      'GET /api/non-veg-menus/category/:category',
      'GET /api/non-veg-menus/search/:searchTerm',
      'GET /api/non-veg-menus/bulk/:category',
      'GET /api/non-veg-menus/:id'
    ],
    availableCategories: [
      'breakfast', 'lunch', 'dinner',
      'breakfast-lunch', 'breakfast-dinner', 'lunch-dinner',
      'breakfast-lunch-dinner'
    ]
  });
});

/**
 * Get NON-VEG categories summary
 * GET /api/non-veg-menus/categories/summary
 */
router.get('/categories/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = [
      'breakfast', 'lunch', 'dinner',
      'breakfast-lunch', 'breakfast-dinner', 'lunch-dinner',
      'breakfast-lunch-dinner'
    ];

    const categorySummary = await Promise.all(
      categories.map(async (category) => {
        const count = await MenuDetails.countDocuments({
          category: 'non-veg',
          menuType: category
        });
        return { category, count };
      })
    );

    const totalItems = await MenuDetails.countDocuments({ category: 'non-veg' });

    res.json({
      success: true,
      data: {
        categories: categorySummary,
        totalItems: totalItems,
        type: 'non-veg'
      },
      message: 'Non-veg catalog summary retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching non-veg category summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg category summary',
      error: error.message
    });
  }
});

/**
 * Search within NON-VEG catalog
 * GET /api/non-veg-menus/search/:searchTerm
 */
router.get('/search/:searchTerm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { searchTerm } = req.params;

    const items = await MenuDetails.find({
      category: 'non-veg',
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { menuType: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('category menuType title description imageUrl priceMonthly priceWeekly priceTrial deliveryTime')
    .sort({ createdAt: -1 })
    .limit(30);

    res.json({
      success: true,
      data: items,
      count: items.length,
      searchTerm: searchTerm,
      type: 'non-veg',
      message: `Found ${items.length} non-veg items matching "${searchTerm}"`
    });
  } catch (error: any) {
    console.error('Error searching non-veg catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching non-veg catalog',
      error: error.message
    });
  }
});

/**
 * Get NON-VEG catalog bulk operations by category
 * GET /api/non-veg-menus/bulk/:category
 */
router.get('/bulk/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    console.log(`NON-VEG Bulk operation for category: ${category}`);

    const items = await MenuDetails.find({ 
      category: 'non-veg', 
      menuType: category 
    })
    .select('category menuType title description imageUrl priceMonthly priceWeekly priceTrial deliveryTime weeklyMenu')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
      type: 'non-veg',
      category: category,
      operation: 'bulk',
      message: `Non-veg ${category} bulk data retrieved successfully`
    });
  } catch (error: any) {
    console.error('Error in non-veg bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Error in non-veg bulk operation',
      error: error.message
    });
  }
});

/**
 * Get NON-VEG catalog by category
 * GET /api/non-veg-menus/category/:category
 */
router.get('/category/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    console.log(`Fetching NON-VEG catalog for category: ${category}`);

    const items = await MenuDetails.find({ 
      category: 'non-veg', 
      menuType: category 
    })
    .select('category menuType title description imageUrl priceMonthly priceWeekly priceTrial deliveryTime weeklyMenu')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
      type: 'non-veg',
      category: category,
      message: `Non-veg ${category} catalog items retrieved successfully`
    });
  } catch (error: any) {
    console.error('Error fetching non-veg catalog by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg catalog by category',
      error: error.message
    });
  }
});

/**
 * Get all NON-VEG catalog items
 * GET /api/non-veg-menus
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuType, page = 1, limit = 20 } = req.query;
    
    const filter: any = { category: 'non-veg' };
    if (menuType) {
      filter.menuType = menuType;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      MenuDetails.find(filter)
        .select('category menuType title description imageUrl priceMonthly priceWeekly priceTrial deliveryTime weeklyMenu')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      MenuDetails.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      type: 'non-veg',
      message: 'Non-veg catalog items retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching non-veg catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg catalog',
      error: error.message
    });
  }
});

/**
 * Get NON-VEG catalog item by ID
 * ⚠️ CRITICAL: MUST BE LAST ROUTE - After all specific routes
 * GET /api/non-veg-menus/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await MenuDetails.findOne({ 
      _id: id, 
      category: 'non-veg' 
    })
    .select('category menuType title description imageUrl priceMonthly priceWeekly priceTrial deliveryTime weeklyMenu');

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Non-veg catalog item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: item,
      type: 'non-veg',
      message: 'Non-veg catalog item retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching non-veg catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching non-veg catalog item',
      error: error.message
    });
  }
});

console.log('✅ Non-Veg Catalog Routes Loaded Successfully');
console.log('📋 Available Routes:');
console.log('  1. GET /api/non-veg-menus/health');
console.log('  2. GET /api/non-veg-menus/categories/summary');
console.log('  3. GET /api/non-veg-menus/search/:searchTerm');
console.log('  4. GET /api/non-veg-menus/bulk/:category');
console.log('  5. GET /api/non-veg-menus/category/:category');
console.log('  6. GET /api/non-veg-menus/');
console.log('  7. GET /api/non-veg-menus/:id');

export default router;