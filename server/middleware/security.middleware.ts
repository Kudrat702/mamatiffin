import { Request, Response, NextFunction } from 'express';
import { MENU_CONFIG } from '../config/menu.config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class SecurityMiddleware {
  private static rateLimitStore: RateLimitStore = {};

  static rateLimit(req: Request, res: Response, next: NextFunction): void {
    const clientId = req.ip || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    Object.keys(SecurityMiddleware.rateLimitStore).forEach(key => {
      if (SecurityMiddleware.rateLimitStore[key].resetTime < now) {
        delete SecurityMiddleware.rateLimitStore[key];
      }
    });

    // Check rate limit for this client
    if (!SecurityMiddleware.rateLimitStore[clientId]) {
      SecurityMiddleware.rateLimitStore[clientId] = {
        count: 1,
        resetTime: now + MENU_CONFIG.RATE_LIMIT_WINDOW
      };
    } else {
      SecurityMiddleware.rateLimitStore[clientId].count++;
    }

    const clientData = SecurityMiddleware.rateLimitStore[clientId];

    if (clientData.count > MENU_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        limit: MENU_CONFIG.RATE_LIMIT_MAX_REQUESTS,
        window: MENU_CONFIG.RATE_LIMIT_WINDOW / 1000
      });
      return;
    }

    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': MENU_CONFIG.RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': (MENU_CONFIG.RATE_LIMIT_MAX_REQUESTS - clientData.count).toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });

    next();
  }

  static sanitizeLogging(req: Request, res: Response, next: NextFunction): void {
    // Override console.log for this request to sanitize sensitive data
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      const sanitizedArgs = args.map(arg => {
        if (typeof arg === 'string') {
          // Remove potential sensitive patterns
          return arg.replace(/password=[\w\d]+/gi, 'password=***')
                   .replace(/token=[\w\d]+/gi, 'token=***')
                   .replace(/key=[\w\d]+/gi, 'key=***');
        }
        return arg;
      });
      originalLog.apply(console, sanitizedArgs);
    };

    // Restore original console.log after response
    res.on('finish', () => {
      console.log = originalLog;
    });

    next();
  }

  static securityHeaders(req: Request, res: Response, next: NextFunction): void {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    next();
  }

  static validateContentType(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.get('Content-Type') || '';

      if (!contentType.includes('application/json') &&
          !contentType.includes('multipart/form-data') &&
          !contentType.includes('application/x-www-form-urlencoded')) {
        res.status(400).json({
          success: false,
          message: 'Invalid Content-Type',
          expected: ['application/json', 'multipart/form-data', 'application/x-www-form-urlencoded'],
          received: contentType
        });
        return;
      }
    }
    next();
  }
}