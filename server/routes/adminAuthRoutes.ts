import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  verifyToken,
  logout,
  generateHashedPassword
} from '../controllers//adminAuthController';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// @route   POST /admin-auth
// @desc    Admin login
// @access  Public
router.post('/admin-auth', adminLogin);

// @route   GET /admin/profile
// @desc    Get admin profile
// @access  Private (Admin only)
router.get('/admin/profile', verifyAdminToken, getAdminProfile);

// @route   POST /admin/verify-token
// @desc    Verify if token is still valid
// @access  Private (Admin only)
router.post('/admin/verify-token', verifyAdminToken, verifyToken);

// @route   POST /admin/logout
// @desc    Admin logout (for logging purposes)
// @access  Private (Admin only)
router.post('/admin/logout', verifyAdminToken, logout);

// @route   POST /admin/hash-password
// @desc    Generate hashed password for environment setup
// @access  Public (should be disabled in production)
// Note: This route should be commented out or removed in production
// It's only for initial setup to generate ADMIN_PASSWORD_HASH
if (process.env.NODE_ENV !== 'production') {
  router.post('/admin/hash-password', generateHashedPassword);
}

export default router;