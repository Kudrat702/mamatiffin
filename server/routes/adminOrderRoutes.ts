// // routes/adminOrderRoutes.ts - CLEAN VERSION WITHOUT TYPE ROUTE
// import express from 'express';
// import {
//   getAllOrders,
//   getOrdersByCustomerPhone,
//   getNewOrders,
//   getOldOrders,
//   getOrdersByDay,
//   getSkipOrders,
//   getFinalDeliveryOrders,
//   getOrderById,
//   updateOrderStatus,
//   getOrderStatistics,
//   bulkUpdateOrders,
//   deleteOrder,
//   getOrderAnalytics,
//   exportOrders,
//   getCustomerOverview,
//   searchOrders,
//   exportFinalDeliveryOrders
// } from '../controllers/adminOrderController';

// const router = express.Router();

// console.log('🔧 Loading adminOrderRoutes with controllers...');

// // ✅ SPECIFIC STATIC ROUTES FIRST (Most specific to least specific)

// // Statistics and analytics routes
// router.get('/statistics', getOrderStatistics);
// router.get('/analytics', getOrderAnalytics);
// router.get('/customer-overview', getCustomerOverview);

// // Export routes
// router.get('/export-final-delivery', exportFinalDeliveryOrders);
// router.get('/export', exportOrders);

// // Search functionality
// router.get('/search', searchOrders);

// // Order type routes (specific endpoints)
// router.get('/new', getNewOrders);
// router.get('/old', getOldOrders);
// router.get('/skip-orders', getSkipOrders);
// router.get('/final-delivery', getFinalDeliveryOrders);

// // Date-based filtering
// router.get('/by-day', getOrdersByDay);

// // Bulk operations
// router.patch('/bulk-update', bulkUpdateOrders);

// // ✅ PARAMETERIZED ROUTES (More specific first)

// // Customer orders by phone number
// router.get('/customer/:customerPhone', getOrdersByCustomerPhone);

// // Order management routes
// router.patch('/:orderId/status', updateOrderStatus);
// router.delete('/:orderId', deleteOrder);
// router.get('/:orderId', getOrderById);

// // ✅ GENERIC ROUTES LAST

// // All orders with optional query filters
// router.get('/', getAllOrders);

// console.log('✅ Admin order routes configured successfully');
// console.log('📋 Available endpoints:');
// console.log('  GET  /api/admin/orders/statistics');
// console.log('  GET  /api/admin/orders/analytics');
// console.log('  GET  /api/admin/orders/customer-overview');
// console.log('  GET  /api/admin/orders/export-final-delivery');
// console.log('  GET  /api/admin/orders/export');
// console.log('  GET  /api/admin/orders/search');
// console.log('  GET  /api/admin/orders/new');
// console.log('  GET  /api/admin/orders/old');
// console.log('  GET  /api/admin/orders/skip-orders');
// console.log('  GET  /api/admin/orders/final-delivery');
// console.log('  GET  /api/admin/orders/by-day');
// console.log('  PATCH /api/admin/orders/bulk-update');
// console.log('  GET  /api/admin/orders/customer/:customerPhone');
// console.log('  PATCH /api/admin/orders/:orderId/status');
// console.log('  DELETE /api/admin/orders/:orderId');
// console.log('  GET  /api/admin/orders/:orderId');
// console.log('  GET  /api/admin/orders/');

// export default router;

// routes/adminOrderRoutes.ts - FIXED WITH AUTHENTICATION
import express from 'express';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware'; // ✅ ADDED
import {
  getAllOrders,
  getOrdersByCustomerPhone,
  getNewOrders,
  getOldOrders,
  getOrdersByDay,
  getSkipOrders,
  getFinalDeliveryOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStatistics,
  bulkUpdateOrders,
  deleteOrder,
  getOrderAnalytics,
  exportOrders,
  getCustomerOverview,
  searchOrders,
  exportFinalDeliveryOrders
} from '../controllers/adminOrderController';

const router = express.Router();

console.log('🔧 Loading adminOrderRoutes with authentication middleware...');

// ✅ ALL ROUTES PROTECTED WITH verifyAdminToken MIDDLEWARE

/**
 * ADMIN ONLY ROUTES - All Protected with verifyAdminToken
 * These routes require authentication token in headers
 */

// ✅ SPECIFIC STATIC ROUTES FIRST (Most specific to least specific)

// Statistics and analytics routes
router.get('/statistics', verifyAdminToken, getOrderStatistics);
router.get('/analytics', verifyAdminToken, getOrderAnalytics);
router.get('/customer-overview', verifyAdminToken, getCustomerOverview);

// Export routes
router.get('/export-final-delivery', verifyAdminToken, exportFinalDeliveryOrders);
router.get('/export', verifyAdminToken, exportOrders);

// Search functionality
router.get('/search', verifyAdminToken, searchOrders);

// Order type routes (specific endpoints)
router.get('/new', verifyAdminToken, getNewOrders);
router.get('/old', verifyAdminToken, getOldOrders);
router.get('/skip-orders', verifyAdminToken, getSkipOrders);
router.get('/final-delivery', verifyAdminToken, getFinalDeliveryOrders);

// Date-based filtering
router.get('/by-day', verifyAdminToken, getOrdersByDay);

// Bulk operations
router.patch('/bulk-update', verifyAdminToken, bulkUpdateOrders);

// ✅ PARAMETERIZED ROUTES (More specific first)

// Customer orders by phone number
router.get('/customer/:customerPhone', verifyAdminToken, getOrdersByCustomerPhone);

// Order management routes
router.patch('/:orderId/status', verifyAdminToken, updateOrderStatus);
router.delete('/:orderId', verifyAdminToken, deleteOrder);
router.get('/:orderId', verifyAdminToken, getOrderById);

// ✅ GENERIC ROUTES LAST

// All orders with optional query filters
router.get('/', verifyAdminToken, getAllOrders);

console.log('✅ Admin order routes configured successfully with authentication');
console.log('📋 All endpoints are now PROTECTED and require authentication token:');
console.log('  🔒 GET    /api/admin/orders/statistics');
console.log('  🔒 GET    /api/admin/orders/analytics');
console.log('  🔒 GET    /api/admin/orders/customer-overview');
console.log('  🔒 GET    /api/admin/orders/export-final-delivery');
console.log('  🔒 GET    /api/admin/orders/export');
console.log('  🔒 GET    /api/admin/orders/search');
console.log('  🔒 GET    /api/admin/orders/new');
console.log('  🔒 GET    /api/admin/orders/old');
console.log('  🔒 GET    /api/admin/orders/skip-orders');
console.log('  🔒 GET    /api/admin/orders/final-delivery');
console.log('  🔒 GET    /api/admin/orders/by-day');
console.log('  🔒 PATCH  /api/admin/orders/bulk-update');
console.log('  🔒 GET    /api/admin/orders/customer/:customerPhone');
console.log('  🔒 PATCH  /api/admin/orders/:orderId/status');
console.log('  🔒 DELETE /api/admin/orders/:orderId');
console.log('  🔒 GET    /api/admin/orders/:orderId');
console.log('  🔒 GET    /api/admin/orders/');

export default router;