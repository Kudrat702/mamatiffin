// server/routes/orderRoutes.ts - PUBLIC CUSTOMER ORDERS ROUTE
import express from 'express';
import { 
  getOrdersByCustomerPhone,
  getOrderById 
} from '../controllers/adminOrderController';

const router = express.Router();

console.log('📱 Loading Customer Order Routes...');

// ✅ PUBLIC ROUTES - Customer ke liye (No admin authentication needed)

// Get customer orders by phone number
// Route: GET /api/orders/customer/:customerPhone
router.get('/customer/:customerPhone', getOrdersByCustomerPhone);

// Get single order by ID
// Route: GET /api/orders/:orderId
router.get('/:orderId', getOrderById);

console.log('✅ Customer order routes configured');
console.log('📋 Available Public Order Endpoints:');
console.log('  GET  /api/orders/customer/:customerPhone');
console.log('  GET  /api/orders/:orderId');

export default router;