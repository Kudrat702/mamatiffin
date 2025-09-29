// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user';

// Enhanced JWT Payload interface
interface JwtPayload {
  id?: string;
  _id?: string;
  phone?: string;
  role: string;
  name?: string;
  isAdmin?: boolean;
  [key: string]: any; // Allow additional properties
}

// Enhanced Request interface with user property
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    phone: string;
    role: string;
    isAdmin: boolean;
    address: {
      district: string;
      block: string;
      city: string;
      homeLodgeName: string;
    };
  };
}

// Error constants for consistent error handling
enum AuthError {
  TOKEN_EXPIRED = 'Token expire ho gaya hai. Dubara login karo!',
  INVALID_TOKEN = 'Invalid token. Login karo dubara!',
  AUTH_FAILED = 'Authentication failed. Token verify nahi hua!',
  NO_TOKEN = 'Access token required. Login karo pehle!',
  INVALID_PAYLOAD = 'Invalid token payload - missing user identifier',
  INSUFFICIENT_PERMISSIONS = 'Insufficient permissions. Aap authorized nahi hain!',
  ADMIN_REQUIRED = 'Admin access required. Aap admin nahi hain!',
  SUPER_ADMIN_REQUIRED = 'Super Admin access required. Sirf admin access kar sakta hai!',
  MISSING_SECRET = 'JWT secret not configured',
  USER_NOT_FOUND = 'User nahi mila. Token invalid hai!'
}

// Utility function for consistent error responses
const sendAuthError = (
  res: Response, 
  errorType: AuthError, 
  statusCode: number = 403,
  errorCode?: string,
  additionalData?: any
): void => {
  res.status(statusCode).json({
    success: false,
    error: errorType,
    message: errorType,
    code: errorCode,
    ...additionalData
  });
};

// Enhanced JWT token verify middleware with database user lookup
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Authorization header se token nikalo
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1]; // "Bearer TOKEN" format

    // Token nahi mila
    if (!token) {
      return sendAuthError(res, AuthError.NO_TOKEN, 401);
    }

    // JWT secret environment variable se lo
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable set nahi hai!');
      return sendAuthError(res, AuthError.MISSING_SECRET, 500);
    }

    // Token verify karo
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // User ID extract karo (support both id and _id)
    const userId = decoded.id || decoded._id;
    if (!userId) {
      return sendAuthError(res, AuthError.INVALID_PAYLOAD, 401, 'INVALID_PAYLOAD');
    }

    // Database se current user details fetch karo
    const user = await User.findById(userId).select('-password') as (typeof User.prototype & { _id: any });

    if (!user) {
      return sendAuthError(res, AuthError.USER_NOT_FOUND, 401, 'USER_NOT_FOUND');
    }

    // Request object mein enhanced user details add karo
    req.user = {
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      role: user.role || 'user',
      isAdmin: user.role === 'admin' || user.role === 'moderator',
      address: user.address || {
        district: '',
        block: '',
        city: '',
        homeLodgeName: ''
      }
    };

    // Next middleware ya controller call karo
    next();
    
  } catch (error) {
    console.error('Token verification error:', error);
    
    // JWT specific errors handle karo
    if (error instanceof jwt.TokenExpiredError) {
      return sendAuthError(res, AuthError.TOKEN_EXPIRED, 401, 'TOKEN_EXPIRED');
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return sendAuthError(res, AuthError.INVALID_TOKEN, 401, 'INVALID_TOKEN');
    }

    // Generic error
    return sendAuthError(res, AuthError.AUTH_FAILED, 401, 'AUTH_FAILED');
  }
};

// Role-based access control middleware (factory function)
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return sendAuthError(res, AuthError.NO_TOKEN, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendAuthError(
        res, 
        AuthError.INSUFFICIENT_PERMISSIONS, 
        403, 
        'INSUFFICIENT_PERMISSIONS',
        { userRole: req.user.role, allowedRoles }
      );
    }

    next();
  };
};

// Admin access check middleware (admin ya moderator)
export const adminOnly = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    // Pehle check karo ki user authenticated hai ya nahi
    if (!req.user) {
      return sendAuthError(res, AuthError.NO_TOKEN, 401);
    }

    // Admin ya moderator check karo
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return sendAuthError(
        res, 
        AuthError.ADMIN_REQUIRED, 
        403, 
        'ADMIN_REQUIRED',
        { userRole: req.user.role }
      );
    }

    // Admin hai, next middleware call karo
    next();
    
  } catch (error) {
    console.error('Admin authorization error:', error);
    return sendAuthError(res, AuthError.AUTH_FAILED, 500);
  }
};

// Super Admin (sirf admin, moderator nahi) check middleware
export const superAdminOnly = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      return sendAuthError(res, AuthError.NO_TOKEN, 401);
    }

    // Sirf admin role allowed hai
    if (req.user.role !== 'admin') {
      return sendAuthError(
        res, 
        AuthError.SUPER_ADMIN_REQUIRED, 
        403, 
        'SUPER_ADMIN_REQUIRED',
        { userRole: req.user.role }
      );
    }

    next();
    
  } catch (error) {
    console.error('Super admin authorization error:', error);
    return sendAuthError(res, AuthError.AUTH_FAILED, 500);
  }
};

// Admin-specific middleware using isAdmin flag
export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return sendAuthError(res, AuthError.NO_TOKEN, 401);
  }

  if (!req.user.isAdmin) {
    return sendAuthError(
      res, 
      AuthError.ADMIN_REQUIRED, 
      403, 
      'ADMIN_REQUIRED',
      { userRole: req.user.role }
    );
  }

  next();
};

// Combined authentication and admin check with proper error propagation
export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  authenticateToken(req, res, (err?: any) => {
    if (err) {
      return next(err); // Pass any errors to Express error handler
    }
    adminOnly(req, res, next);
  });
};

// Combined authentication and super admin check
export const authenticateSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  authenticateToken(req, res, (err?: any) => {
    if (err) {
      return next(err);
    }
    superAdminOnly(req, res, next);
  });
};

// Rate limiting middleware for payment APIs
export const paymentRateLimit = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  // Simple rate limiting logic
  // Production mein redis use kar sakte hain
  
  const userKey = req.user?.id || req.ip;
  const rateLimitKey = `payment_rate_${userKey}`;
  
  // Yahan aap redis ya memory store use kar sakte hain
  // For now, simple implementation
  next();
};

// JWT token generate karne ka helper function
export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable nahi hai!');
  }

  try {
    // @ts-ignore - TypeScript overload issue bypass
    return jwt.sign(
      { id: userId },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

// Enhanced token generation with additional payload - FIXED VERSION
export const generateTokenWithPayload = (payload: Record<string, any>): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable nahi hai!');
  }

  // Create a clean payload object without undefined values
  const cleanPayload: Record<string, any> = {};
  
  Object.keys(payload).forEach(key => {
    if (payload[key] !== undefined && payload[key] !== null) {
      cleanPayload[key] = payload[key];
    }
  });

  return jwt.sign(
    cleanPayload,
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    } as jwt.SignOptions
  );
};

// Token decode karne ka helper function
export const decodeToken = (token: string): JwtPayload => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not found');
    }
    
    return jwt.verify(token, jwtSecret) as JwtPayload;
  } catch (error) {
    throw new Error('Token decode nahi hua');
  }
};

// User role check karne ka helper function
export const hasRole = (userRole: string, allowedRoles: string[]): boolean => {
  return allowedRoles.includes(userRole);
};

// Check if user has any admin privileges
export const isAnyAdmin = (userRole: string): boolean => {
  return ['admin', 'moderator'].includes(userRole);
};

// Multiple middleware combine karne ka helper
export const combineMiddleware = (...middlewares: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const runMiddleware = (index: number) => {
      if (index >= middlewares.length) {
        return next();
      }
      
      middlewares[index](req, res, (err?: any) => {
        if (err) {
          return next(err);
        }
        runMiddleware(index + 1);
      });
    };
    
    runMiddleware(0);
  };
};

// Middleware to extract user info without requiring authentication (optional auth)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      // No token provided, continue without user info
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    const userId = decoded.id || decoded._id;

    if (userId) {
      const user = await User.findById(userId).select('-password') as (typeof User.prototype & { _id: any });
      if (user) {
        req.user = {
          id: user._id.toString(),
          name: user.name,
          phone: user.phone,
          role: user.role || 'user',
          isAdmin: user.role === 'admin' || user.role === 'moderator',
          address: user.address || {
            district: '',
            block: '',
            city: '',
            homeLodgeName: ''
          }
        };
      }
    }

    next();
  } catch (error) {
    // Token invalid ho to bhi continue karo, user info nahi milega bas
    next();
  }
};

// Export default object with all functions for convenience
export default {
  authenticateToken,
  adminOnly,
  superAdminOnly,
  requireAdmin,
  requireRole,
  authenticateAdmin,
  authenticateSuperAdmin,
  paymentRateLimit,
  optionalAuth,
  generateToken,
  generateTokenWithPayload,
  decodeToken,
  hasRole,
  isAnyAdmin,
  combineMiddleware,
  // Error constants export
  AuthError
};

// Named exports for specific use cases
export {
  AuthError,
  type JwtPayload
};