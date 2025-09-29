import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request interface to include admin property
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        role: string;
      };
    }
  }
}

// Interface for JWT payload
interface JWTPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Get JWT secret from environment variables
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'ee1e5562ddde04d2544f978b9801b0b8d420a3deff21c5dfda8642b44c34d9a8' ;

// Middleware to verify admin token
export const verifyAdminToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check if the role is admin
    if (decoded.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
      return;
    }

    // Add admin info to request object
    req.admin = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Token has expired.'
      });
      return;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// Function to generate JWT token
export const generateAdminToken = (adminId: string = 'admin'): string => {
  const payload = {
    id: adminId,
    role: 'admin'
  };

  // Better way to handle expiration
  const options: jwt.SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN
      ? process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
      : '24h'
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

// Function to verify token (utility function)
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Optional middleware for logging requests (can be used for debugging)
export const logRequest = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
    body: req.body,
    admin: req.admin || 'Not authenticated'
  });
  next();
};

