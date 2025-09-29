import { Request, Response, NextFunction } from 'express';
import { MENU_CONFIG } from '../config/menu.config';
import { MenuRequest, MenuParams, MenuQueryParams } from '../types/menu.types';

export class ValidationMiddleware {
  static validateDietParam(req: Request, res: Response, next: NextFunction): void {
    const { diet } = req.params;

    if (!diet || !MENU_CONFIG.ALLOWED_CATEGORIES.includes(diet as any)) {
      res.status(400).json({
        success: false,
        message: MENU_CONFIG.ERRORS.INVALID_CATEGORY,
        received: diet,
        allowed: MENU_CONFIG.ALLOWED_CATEGORIES
      });
      return;
    }

    next();
  }

  static validateCategory(req: MenuRequest, res: Response, next: NextFunction): void {
    const { category } = req.body;

    if (!category) {
      res.status(400).json({
        success: false,
        message: MENU_CONFIG.ERRORS.CATEGORY_REQUIRED,
        hint: 'Please provide category as "veg" or "non-veg"',
        receivedFields: Object.keys(req.body)
      });
      return;
    }

    if (!MENU_CONFIG.ALLOWED_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category value',
        hint: 'Category must be either "veg" or "non-veg"',
        received: category,
        allowed: MENU_CONFIG.ALLOWED_CATEGORIES
      });
      return;
    }

    next();
  }

  static validateMenuType(req: Request, res: Response, next: NextFunction): void {
    const { menuType } = req.params;

    if (!menuType || menuType.trim() === '') {
      res.status(400).json({
        success: false,
        message: MENU_CONFIG.ERRORS.MENU_TYPE_REQUIRED,
        received: menuType
      });
      return;
    }

    next();
  }

  static validateFileUpload(req: Request, res: Response, next: NextFunction): void {
    if (!req.file) {
      return next();
    }

    // Validate file type
    const allowedTypes = MENU_CONFIG.ALLOWED_FILE_TYPES as readonly string[];
    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400).json({
        success: false,
        message: MENU_CONFIG.ERRORS.INVALID_FILE_TYPE,
        allowedTypes: MENU_CONFIG.ALLOWED_FILE_TYPES,
        received: req.file.mimetype
      });
      return;
    }

    // Validate file size
    if (req.file.size > MENU_CONFIG.MAX_FILE_SIZE) {
      res.status(400).json({
        success: false,
        message: MENU_CONFIG.ERRORS.FILE_TOO_LARGE,
        maxSize: `${MENU_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
        received: `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`
      });
      return;
    }

    next();
  }

  static sanitizeSearchParams(req: Request, res: Response, next: NextFunction): void {
    if (req.params.category) {
      req.params.category = req.params.category
        .replace(/[^\w\s-+]/g, '')
        .trim()
        .substring(0, MENU_CONFIG.MAX_SEARCH_LENGTH);
    }

    if (req.params.menuType) {
      req.params.menuType = req.params.menuType
        .replace(/[^\w\s-+]/g, '')
        .trim()
        .substring(0, MENU_CONFIG.MAX_SEARCH_LENGTH);
    }

    next();
  }

  static validateQueryParams(req: Request, res: Response, next: NextFunction): void {
    const { page, limit, category, menuType } = req.query as MenuQueryParams;

    // Validate pagination
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      res.status(400).json({
        success: false,
        message: 'Invalid page number. Must be a positive integer.',
        received: page
      });
      return;
    }

    if (limit) {
      const limitNum = Number(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > MENU_CONFIG.MAX_PAGE_SIZE) {
        res.status(400).json({
          success: false,
          message: `Invalid limit. Must be between 1 and ${MENU_CONFIG.MAX_PAGE_SIZE}.`,
          received: limit
        });
        return;
      }
    }

    // Validate category if provided
    if (category && !MENU_CONFIG.ALLOWED_CATEGORIES.includes(category as any)) {
      res.status(400).json({
        success: false,
        message: MENU_CONFIG.ERRORS.INVALID_CATEGORY,
        received: category,
        allowed: MENU_CONFIG.ALLOWED_CATEGORIES
      });
      return;
    }

    next();
  }
}