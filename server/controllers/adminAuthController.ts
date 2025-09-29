import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateAdminToken } from '../middleware/adminAuthMiddleware';

// Admin login controller
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    // Validate input
    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required'
      });
      return;
    }

    // Get admin password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD ; // Change in production
    const hashedAdminPassword = process.env.ADMIN_PASSWORD_HASH;

    let isPasswordValid = false;

    // Check if we have a hashed password in environment
    if (hashedAdminPassword) {
      // Compare with hashed password
      isPasswordValid = await bcrypt.compare(password, hashedAdminPassword);
    } else {
      // Fallback to plain text comparison (not recommended for production)
      isPasswordValid = password === adminPassword;
      
      // Log warning about using plain text password
      console.warn('WARNING: Using plain text admin password. Please set ADMIN_PASSWORD_HASH for production.');
    }

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
      return;
    }

    // Generate JWT token
    const token = generateAdminToken();

    // Successful login
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      redirectUrl: '/super-admin'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get admin profile (optional endpoint)
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Admin info is available from the middleware
    const admin = req.admin;

    res.status(200).json({
      success: true,
      admin: {
        id: admin?.id,
        role: admin?.role,
        loginTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify token endpoint (to check if token is still valid)
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // If we reach here, the token is valid (verified by middleware)
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      admin: req.admin
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Logout endpoint (optional - mainly for logging purposes)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Since we're using stateless JWT, we can't really "logout" on the server side
    // The client should remove the token from localStorage
    console.log(`Admin ${req.admin?.id} logged out at ${new Date().toISOString()}`);
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// Utility function to hash password (for setting up admin password)
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Function to generate hashed password for environment setup
export const generateHashedPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        message: 'Password is required'
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    res.status(200).json({
      success: true,
      message: 'Password hashed successfully',
      hashedPassword,
      note: 'Set this as ADMIN_PASSWORD_HASH in your environment variables'
    });
  } catch (error) {
    console.error('Hash password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};