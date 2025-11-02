// middleware/domainMiddleware.ts - PRODUCTION READY WITH JWT
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // ✅ ADD THIS IMPORT

// Extend Request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean;
      userType?: 'admin' | 'user';
      admin?: { id: string; role: string }; // match other declaration
      user?: any;  // ✅ ADD THIS
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

// ============================================
// ADMIN AUTHORIZATION MIDDLEWARE - REAL JWT VALIDATION
// ============================================
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  try {
    console.log('🔐 Admin middleware checking...');
    console.log('Path:', req.path);
    console.log('Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      'x-auth-token': req.headers['x-auth-token'] ? 'Present' : 'Missing',
      cookie: req.headers.cookie ? 'Present' : 'Missing'
    });

    // ✅ STEP 1: Extract token from multiple sources
    let token: string | undefined;
    
    // 1. Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log('✅ Token found in Authorization header');
    }
    
    // 2. x-auth-token header
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'] as string;
      console.log('✅ Token found in x-auth-token header');
    }
    
    // 3. Cookie
    if (!token && req.cookies?.adminToken) {
      token = req.cookies.adminToken;
      console.log('✅ Token found in cookie');
    }
    
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
      console.log('✅ Token found in token cookie');
    }

    // ✅ STEP 2: Check if token exists
    if (!token) {
      console.log('❌ No token found in request');
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin authentication required.',
        error: 'NO_TOKEN',
        debug: process.env.NODE_ENV === 'development' ? {
          path: req.path,
          headers: Object.keys(req.headers)
        } : undefined
      });
      return;
    }

    console.log('🔑 Token found:', token.substring(0, 20) + '...');

    // ✅ STEP 3: Verify JWT token with REAL validation
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured!');
      res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'JWT_SECRET_MISSING'
      });
      return;
    }

    try {
      // ✅ REAL JWT VERIFICATION
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      console.log('✅ Token verified successfully');
      console.log('Decoded payload:', {
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        role: decoded.role
      });

      // ✅ STEP 4: Check if user is admin
      if (!decoded.isAdmin && decoded.role !== 'admin') {
        console.log('❌ User is not admin');
        res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
          error: 'NOT_ADMIN',
          debug: process.env.NODE_ENV === 'development' ? {
            isAdmin: decoded.isAdmin,
            role: decoded.role
          } : undefined
        });
        return;
      }

      // ✅ STEP 5: Attach admin data to request
      req.admin = decoded;
      req.user = decoded; // Backward compatibility
      
      console.log('✅ Admin authenticated successfully:', decoded.email);
      next();

    } catch (jwtError: any) {
      console.error('❌ JWT verification failed:', jwtError.message);
      
      // Handle specific JWT errors
      if (jwtError.name === 'JsonWebTokenError') {
        res.status(403).json({
          success: false,
          message: 'Invalid authentication token',
          error: 'INVALID_TOKEN',
          debug: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
        });
        return;
      }
      
      if (jwtError.name === 'TokenExpiredError') {
        res.status(403).json({
          success: false,
          message: 'Authentication token expired. Please login again.',
          error: 'TOKEN_EXPIRED',
          expiredAt: jwtError.expiredAt
        });
        return;
      }

      // Generic JWT error
      res.status(403).json({
        success: false,
        message: 'Token verification failed',
        error: 'TOKEN_VERIFICATION_FAILED',
        debug: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
      return;
    }
    
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Admin middleware error:', errorMessage);
    res.status(500).json({
      success: false,
      message: 'Authentication middleware error',
      error: 'AUTH_MIDDLEWARE_ERROR',
      debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
    return;
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
        },
        jwt: {
          configured: !!process.env.JWT_SECRET
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
      'http://localhost:5174',
      'http://admin.localhost:5173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://mamatiffin.com',
      'https://www.mamatiffin.com',
      'https://admin.mamatiffin.com',
      'https://www.admin.mamatiffin.com',
      'https://mamatiffin.vercel.app',
      'https://admin-mamatiffin.vercel.app',
    ];
    
    // Development mode: Allow all localhost subdomains
    if (process.env.NODE_ENV === 'development' && origin) {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Production: Allow all vercel deployments
    if (process.env.NODE_ENV === 'production' && origin) {
      if (origin.includes('vercel.app')) {
        console.log('✅ Vercel origin allowed:', origin);
        return callback(null, true);
      }
    }
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
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