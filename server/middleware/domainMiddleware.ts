// middleware/domainMiddleware.ts - FIXED VERSION (NO HTML OVERRIDE)
import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean;
      userType?: 'admin' | 'user';
    }
  }
}

// DOMAIN DETECTION MIDDLEWARE - CLEAN & NON-BLOCKING
export const domainMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const hostname = req.get('host') || '';
    const origin = req.get('origin') || '';
    const userAgent = req.get('user-agent') || '';
    
    // Admin detection logic
    const isAdmin = hostname.includes('admin') || 
                   origin.includes('admin') || 
                   req.path.startsWith('/admin');
    
    // Set request flags for other middlewares to use
    req.isAdmin = isAdmin;
    req.userType = isAdmin ? 'admin' : 'user';
    
    // Optional: Add custom headers (without modifying HTML)
    if (isAdmin) {
      res.setHeader('X-Interface-Type', 'admin');
      res.setHeader('X-Admin-Access', 'true');
    } else {
      res.setHeader('X-Interface-Type', 'user');
      res.setHeader('X-Admin-Access', 'false');
    }
    
    // Development logging (comment out in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 Request: ${hostname}${req.path} → ${isAdmin ? 'Admin' : 'User'} Interface`);
    }
    
    // CRITICAL: Always proceed to next middleware
    next();
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Domain middleware error:', errorMessage);
    // Even on error, continue to next middleware
    next();
  }
};

// ADMIN AUTHORIZATION MIDDLEWARE - SECURE VERSION
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if admin access is required
    const isAdminRoute = req.path.startsWith('/api/admin') || 
                        req.path.startsWith('/admin') ||
                        req.isAdmin;
    
    if (isAdminRoute) {
      // In production, add proper authentication check here
      if (process.env.NODE_ENV === 'production') {
        // Add your admin authentication logic here
        const authToken = req.headers.authorization;
        const isAuthenticated = validateAdminToken(authToken);
        
        if (!isAuthenticated) {
          res.status(403).json({
            success: false,
            message: 'Admin access denied',
            code: 'ADMIN_ACCESS_REQUIRED'
          });
          return;
        }
      }
      
      // Development: Allow all admin requests
      if (process.env.NODE_ENV === 'development') {
        console.log('👑 Admin access granted (development mode)');
      }
    }
    
    next();
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Admin middleware error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Admin middleware error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
    return;
  }
};

// UTILITY FUNCTION FOR TOKEN VALIDATION
const validateAdminToken = (token: string | undefined): boolean => {
  if (!token) return false;
  
  // Add your token validation logic here
  // Example: JWT verification, database check, etc.
  try {
    // Placeholder validation
    return token.startsWith('Bearer ') && token.length > 10;
  } catch {
    return false;
  }
};

// CONFIG ENDPOINT - ENHANCED
export const configEndpoint = (req: Request, res: Response): void => {
  try {
    const config = {
      success: true,
      message: 'Config endpoint operational',
      data: {
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        server: {
          uptime: Math.floor(process.uptime()),
          memory: process.memoryUsage(),
          version: process.version
        },
        request: {
          isAdmin: req.isAdmin || false,
          userType: req.userType || 'user',
          hostname: req.get('host'),
          path: req.path
        }
      }
    };
    
    res.json(config);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Config endpoint error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Config endpoint error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// HEALTH CHECK ENDPOINT - COMPREHENSIVE
export const healthEndpoint = (req: Request, res: Response): void => {
  try {
    const healthStatus = {
      success: true,
      status: 'OK',
      message: 'All systems operational',
      data: {
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} seconds`,
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        },
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform
      }
    };
    
    res.json(healthStatus);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Health check error:', errorMessage);
    res.status(500).json({
      success: false,
      status: 'ERROR',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// CORS CONFIGURATION FOR DIFFERENT DOMAINS
export const corsConfig = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://mamatiffin.com',
      'https://www.mamatiffin.com',
      'https://admin.mamatiffin.com',
      // Add your production domains here
    ];
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// EXPORT ALL MIDDLEWARES
export default {
  domainMiddleware,
  adminOnly,
  configEndpoint,
  healthEndpoint,
  corsConfig
};