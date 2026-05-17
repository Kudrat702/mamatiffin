import { MenuDetails } from '../models/menuDetails';
import { MENU_CONFIG } from '../config/menu.config';
import { MenuBody } from '../types/menu.types';

type AllowedCategory = 'veg' | 'non-veg';

export class MenuAdminService {
  static mapRequestBody(body: MenuBody): MenuBody {
    return {
      ...body,
      menuType: body.menuType || body.mealCategory || 'breakfast',
      title: body.title || body.name || `${body.category} Menu`,
      description: body.description || 'Delicious menu description',
      deliveryTime: body.deliveryTime || MENU_CONFIG.DEFAULT_DELIVERY_TIME,
      priceMonthly: body.priceMonthly || body.price ||
        (body.category === 'veg' ? MENU_CONFIG.DEFAULT_VEG_PRICE : MENU_CONFIG.DEFAULT_NON_VEG_PRICE),
      // ✅ FIX: priceWeekly explicitly include karo
      // Pehle yeh missing tha — ...body se aata tha lekin
      // multipart/form-data mein string hoti hai toh parseFloat zaroori hai
      // Agar 0 hai toh bhi 0 rakho, undefined nahi
      priceWeekly: body.priceWeekly !== undefined && body.priceWeekly !== null
        ? parseFloat(body.priceWeekly.toString())
        : 0,
      priceTrial: body.priceTrial ||
        (body.price ? Math.floor(body.price * MENU_CONFIG.TRIAL_PRICE_MULTIPLIER) :
        (body.category === 'veg' ?
          Math.floor(MENU_CONFIG.DEFAULT_VEG_PRICE * MENU_CONFIG.TRIAL_PRICE_MULTIPLIER) :
          Math.floor(MENU_CONFIG.DEFAULT_NON_VEG_PRICE * MENU_CONFIG.TRIAL_PRICE_MULTIPLIER))),
      weeklyMenu: this.parseWeeklyMenu(body.weeklyMenu)
    };
  }

  private static parseWeeklyMenu(weeklyMenu: any): any {
    if (typeof weeklyMenu === 'string') {
      try {
        return JSON.parse(weeklyMenu);
      } catch (parseError) {
        console.error('Error parsing weeklyMenu:', parseError);
        return {};
      }
    }
    return weeklyMenu || {};
  }

  static async getMenusForAdmin(
    category?: string,
    menuType?: string,
    page: number = 1,
    limit: number = MENU_CONFIG.DEFAULT_PAGE_SIZE
  ) {
    const query: any = {};

    if (category) query.category = category;
    if (menuType) query.menuType = { $regex: menuType, $options: 'i' };

    const skip = (page - 1) * limit;

    const [menus, total] = await Promise.all([
      MenuDetails.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MenuDetails.countDocuments(query)
    ]);

    return {
      menus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    };
  }

  static async getHealthStatus() {
    const [menuCount, vegCount, nonVegCount, sampleVegMenus, sampleNonVegMenus] = await Promise.all([
      MenuDetails.countDocuments(),
      MenuDetails.countDocuments({ category: 'veg' }),
      MenuDetails.countDocuments({ category: 'non-veg' }),
      MenuDetails.find({ category: 'veg' }).limit(3).lean(),
      MenuDetails.find({ category: 'non-veg' }).limit(3).lean()
    ]);

    return {
      success: true,
      message: 'Menu service running with optimized search and security',
      timestamp: new Date().toISOString(),
      version: '3.0.0-SECURE',
      database: {
        connected: true,
        totalMenus: menuCount,
        vegMenus: vegCount,
        nonVegMenus: nonVegCount
      },
      sampleData: {
        vegMenuTypes: sampleVegMenus.map(m => m.menuType),
        nonVegMenuTypes: sampleNonVegMenus.map(m => m.menuType)
      },
      endpoints: {
        menuDetails: 'GET /menus/:diet/:category (with optimized search)',
        adminMenuDetails: 'GET /admin/menu-details',
        adminMenu: 'POST /admin/menu',
        vegMenus: 'GET /veg-menus',
        nonVegMenus: 'GET /non-veg-menus',
        createVeg: 'POST /veg-menu-details',
        createNonVeg: 'POST /non-veg-menu-details',
        deleteMenu: 'DELETE /admin/:category/:menuType',
        uploadImage: 'POST /upload-image'
      },
      searchFeatures: [
        'Cached exact match search',
        'Secure regex matching with input sanitization',
        'Performance-optimized pattern matching',
        'Fuzzy matching with configurable threshold',
        'Comprehensive error handling',
        'Rate limiting and security headers'
      ],
      securityFeatures: [
        'Input sanitization',
        'Rate limiting',
        'Security headers',
        'File upload validation',
        'NoSQL injection prevention'
      ]
    };
  }
}