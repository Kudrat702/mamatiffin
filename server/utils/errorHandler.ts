import { Request, Response, NextFunction } from 'express';
import { MENU_CONFIG } from '../config/menu.config';
import { MenuResponse } from '../types/menu.types';

export class ErrorHandler {
  static createResponse(
    success: boolean,
    message: string,
    data?: any,
    additionalFields?: Record<string, any>
  ): any {
    return {
      success,
      message,
      ...(data && { data }),
      ...additionalFields
    };
  }

  static handleAsyncRoute(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  static globalErrorHandler(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error('Global error handler:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      path: req.path,
      method: req.method
    });

    // Handle specific error types
    if (error.message?.includes('Only image files are allowed')) {
      res.status(400).json(
        ErrorHandler.createResponse(false, MENU_CONFIG.ERRORS.INVALID_FILE_TYPE, null, {
          allowedTypes: MENU_CONFIG.ALLOWED_FILE_TYPES
        })
      );
      return;
    }

    if (error.message?.includes('File too large')) {
      res.status(400).json(
        ErrorHandler.createResponse(false, MENU_CONFIG.ERRORS.FILE_TOO_LARGE, null, {
          maxSize: `${MENU_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
        })
      );
      return;
    }

    // Handle MongoDB errors
    if (error.name === 'ValidationError') {
      res.status(400).json(
        ErrorHandler.createResponse(false, 'Validation error', null, {
          error: error.message
        })
      );
      return;
    }

    if (error.name === 'CastError') {
      res.status(400).json(
        ErrorHandler.createResponse(false, 'Invalid data format', null, {
          error: 'Invalid ID format'
        })
      );
      return;
    }

    // Default error response
    res.status(500).json(
      ErrorHandler.createResponse(false, MENU_CONFIG.ERRORS.SERVER_ERROR, null, {
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      })
    );
  }

  static notFoundHandler(req: Request, res: Response): void {
    res.status(404).json(
      ErrorHandler.createResponse(false, 'Route not found', null, {
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
      })
    );
  }

  static createNotFoundResponse(diet: string, category: string, availableMenus: any[]): any {
    return {
      success: false,
      message: `${MENU_CONFIG.ERRORS.MENU_NOT_FOUND} for ${diet} ${category}`,
      searchedFor: { diet, category },
      availableMenus: availableMenus.map(m => m.menuType),
      suggestions: availableMenus.length > 0 ? [
        `Try one of these available ${diet} menus:`,
        ...availableMenus.slice(0, 3).map(m => `• ${m.menuType}`)
      ] : [`No ${diet} menus available in database`],
      debugInfo: {
        totalMenusForCategory: availableMenus.length,
        databaseConnected: true
      }
    };
  }
}