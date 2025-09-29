// routes/vegCatalogRoutes.ts - VEG CATALOG SPECIFIC ROUTES
import express, { Request, Response } from 'express';
import { MenuDetails } from '../models/menuDetails';

const router = express.Router();

/**
 * Get all VEG catalog items
 * GET /api/veg/catalog
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { menuType, page = 1, limit = 20 } = req.query;
    
    const filter: any = { category: 'veg' };
    if (menuType) {
      filter.menuType = menuType;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      MenuDetails.find(filter)
        .select('category menuType title description imageUrl priceMonthly priceTrial deliveryTime weeklyMenu')
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
      type: 'veg',
      message: 'Veg catalog items retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching veg catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching veg catalog',
      error: error.message
    });
  }
});

/**
 * Get VEG catalog by category
 * GET /api/veg/catalog/category/:category
 */
router.get('/category/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    console.log(`Fetching VEG catalog for category: ${category}`);

    const items = await MenuDetails.find({ 
      category: 'veg', 
      menuType: category 
    })
    .select('category menuType title description imageUrl priceMonthly priceTrial deliveryTime weeklyMenu')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
      type: 'veg',
      category: category,
      message: `Veg ${category} catalog items retrieved successfully`
    });
  } catch (error: any) {
    console.error('Error fetching veg catalog by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching veg catalog by category',
      error: error.message
    });
  }
});

/**
 * Get VEG catalog item by ID
 * GET /api/veg/catalog/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await MenuDetails.findOne({ 
      _id: id, 
      category: 'veg' 
    })
    .select('category menuType title description imageUrl priceMonthly priceTrial deliveryTime weeklyMenu');

    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Veg catalog item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: item,
      type: 'veg',
      message: 'Veg catalog item retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching veg catalog item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching veg catalog item',
      error: error.message
    });
  }
});

/**
 * Get VEG categories summary
 * GET /api/veg/catalog/categories/summary
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
          category: 'veg',
          menuType: category
        });
        return { category, count };
      })
    );

    const totalItems = await MenuDetails.countDocuments({ category: 'veg' });

    res.json({
      success: true,
      data: {
        categories: categorySummary,
        totalItems: totalItems,
        type: 'veg'
      },
      message: 'Veg catalog summary retrieved successfully'
    });
  } catch (error: any) {
    console.error('Error fetching veg category summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching veg category summary',
      error: error.message
    });
  }
});

/**
 * Search within VEG catalog
 * GET /api/veg/catalog/search/:searchTerm
 */
router.get('/search/:searchTerm', async (req: Request, res: Response): Promise<void> => {
  try {
    const { searchTerm } = req.params;

    const items = await MenuDetails.find({
      category: 'veg',
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { menuType: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('category menuType title description imageUrl priceMonthly priceTrial deliveryTime')
    .sort({ createdAt: -1 })
    .limit(30);

    res.json({
      success: true,
      data: items,
      count: items.length,
      searchTerm: searchTerm,
      type: 'veg',
      message: `Found ${items.length} veg items matching "${searchTerm}"`
    });
  } catch (error: any) {
    console.error('Error searching veg catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching veg catalog',
      error: error.message
    });
  }
});

/**
 * Get VEG catalog bulk operations by category
 * GET /api/veg/catalog/bulk/:category
 */
router.get('/bulk/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    console.log(`VEG Bulk operation for category: ${category}`);

    const items = await MenuDetails.find({ 
      category: 'veg', 
      menuType: category 
    })
    .select('category menuType title description imageUrl priceMonthly priceTrial deliveryTime weeklyMenu')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: items,
      count: items.length,
      type: 'veg',
      category: category,
      operation: 'bulk',
      message: `Veg ${category} bulk data retrieved successfully`
    });
  } catch (error: any) {
    console.error('Error in veg bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Error in veg bulk operation',
      error: error.message
    });
  }
});

/**
 * VEG catalog health check
 * GET /api/veg/catalog/health
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Veg catalog service is running',
    timestamp: new Date().toISOString(),
    type: 'veg',
    availableEndpoints: [
      'GET /api/veg/catalog',
      'GET /api/veg/catalog/category/:category',
      'GET /api/veg/catalog/:id',
      'GET /api/veg/catalog/categories/summary',
      'GET /api/veg/catalog/search/:searchTerm',
      'GET /api/veg/catalog/bulk/:category'
    ],
    availableCategories: [
      'breakfast', 'lunch', 'dinner',
      'breakfast-lunch', 'breakfast-dinner', 'lunch-dinner',
      'breakfast-lunch-dinner'
    ]
  });
});

export default router;