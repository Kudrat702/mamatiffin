import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  verifyToken,
  logout,
  generateHashedPassword
} from '../controllers/adminAuthController';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware';

const router = express.Router();

// @route   POST /api/admin/auth (base from server.ts)
// @desc    Admin login
// @access  Public
router.post('/', adminLogin);  // ✅ FIXED: Removed /admin-auth prefix

// @route   POST /api/admin/auth/signin
// @desc    Admin signin
// @access  Public
router.post('/signin', adminLogin);  // ✅ Alternative signin endpoint

// @route   POST /api/admin/auth/signup
// @desc    Admin signup (if needed)
// @access  Public (or protected)
// router.post('/signup', adminSignup);  // Uncomment if you have signup

// @route   GET /api/admin/auth/profile
// @desc    Get admin profile
// @access  Private (Admin only)
router.get('/profile', verifyAdminToken, getAdminProfile);  // ✅ FIXED

// @route   POST /api/admin/auth/verify-token
// @desc    Verify if token is still valid
// @access  Private (Admin only)
router.post('/verify-token', verifyAdminToken, verifyToken);  // ✅ FIXED

// @route   POST /api/admin/auth/logout
// @desc    Admin logout (for logging purposes)
// @access  Private (Admin only)
router.post('/logout', verifyAdminToken, logout);  // ✅ FIXED

// @route   POST /api/admin/auth/hash-password
// @desc    Generate hashed password for environment setup
// @access  Public (should be disabled in production)
if (process.env.NODE_ENV !== 'production') {
  router.post('/hash-password', generateHashedPassword);  // ✅ FIXED
}

console.log('✅ Admin Auth Routes Loaded:');
console.log('  POST   /api/admin/auth/');
console.log('  POST   /api/admin/auth/signin');
console.log('  GET    /api/admin/auth/profile');
console.log('  POST   /api/admin/auth/verify-token');
console.log('  POST   /api/admin/auth/logout');
if (process.env.NODE_ENV !== 'production') {
  console.log('  POST   /api/admin/auth/hash-password');
}

export default router;