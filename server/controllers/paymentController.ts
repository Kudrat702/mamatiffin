// controllers/paymentController.ts - NO FALLBACK - ONLY ADMIN'S EXACT PRICES
import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../models/order';
import { MenuDetails } from '../models/menuDetails';
import { notifyAllAdmins, notifySubscription } from '../services/notificationService';

// Validate required env vars at startup
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables');
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
export const createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Payment order creation started ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      menuId, 
      menuTitle,
      subscriptionType,
      duration,
      totalAmount,
      customerInfo,
      startDate
    } = req.body;

    // Validate required fields
    if (!menuId || !totalAmount || !customerInfo) {
      console.log('❌ Validation failed - missing required fields');
      res.status(400).json({
        success: false,
        message: 'Missing required fields: menuId, totalAmount, customerInfo'
      });
      return;
    }

    console.log('🔍 Finding menu with ID:', menuId);

    const menu = await MenuDetails.findById(menuId);
    if (!menu) {
      console.log('❌ Menu not found for ID:', menuId);
      res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
      return;
    }

    console.log('✅ Menu found:', menu.menuType);
    console.log('💰 Prices - Monthly:', menu.priceMonthly, 'Weekly:', menu.priceWeekly, 'Trial:', menu.priceTrial);

    // ✅ UPDATED: NO FALLBACK - Only use admin's exact prices from database
    let actualPrice = 0;
    
    if (subscriptionType === 'trial') {
      // ✅ Only admin's exact trial price - no fallback calculation
      if (!menu.priceTrial || menu.priceTrial <= 0) {
        console.log('❌ Trial price not set in database');
        res.status(400).json({
          success: false,
          message: 'Trial price not set for this menu. Please contact admin to set the trial price.'
        });
        return;
      }
      actualPrice = menu.priceTrial;
      console.log('📊 Trial price used (admin set):', actualPrice);
      
    } else if (subscriptionType === 'weekly') {
      // ✅ Only admin's exact weekly price - no fallback calculation
      if (!menu.priceWeekly || menu.priceWeekly <= 0) {
        console.log('❌ Weekly price not set in database');
        res.status(400).json({
          success: false,
          message: 'Weekly price not set for this menu. Please contact admin to set the weekly price.'
        });
        return;
      }
      actualPrice = menu.priceWeekly;
      console.log('📊 Weekly price used (admin set):', actualPrice);
      
    } else {
      // monthly
      if (!menu.priceMonthly || menu.priceMonthly <= 0) {
        console.log('❌ Monthly price not set in database');
        res.status(400).json({
          success: false,
          message: 'Monthly price not set for this menu. Please contact admin to set the monthly price.'
        });
        return;
      }
      actualPrice = menu.priceMonthly;
      console.log('📊 Monthly price used (admin set):', actualPrice);
    }

    // Verify price matches (allow small rounding differences of ₹1)
    if (Math.abs(totalAmount - actualPrice) > 1) {
      console.log('❌ Price mismatch:', { expected: actualPrice, received: totalAmount, subscriptionType });
      res.status(400).json({
        success: false,
        message: `Price mismatch. Expected: ₹${actualPrice}, Received: ₹${totalAmount}`
      });
      return;
    }

    console.log('✅ Price validation passed - using admin set price:', actualPrice);

    // Calculate dates based on subscription type
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    
    if (subscriptionType === 'trial') {
      end.setDate(end.getDate() + 1); // 1 day
    } else if (subscriptionType === 'weekly') {
      end.setDate(end.getDate() + 7); // 7 days for weekly
    } else {
      end.setMonth(end.getMonth() + (duration || 1)); // monthly
    }

    console.log('📅 Date calculation:', { start, end, subscriptionType });

    // Generate unique identifiers
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 12);
    const uniqueSuffix = crypto.randomBytes(4).toString('hex');
    
    const shortReceipt = `ord_${timestamp.toString().slice(-8)}_${randomStr.slice(0, 6)}`;
    const orderAttemptId = `order_${timestamp}_${uniqueSuffix}_${uuidv4()}`;

    console.log('🆔 Generated IDs:', { shortReceipt, orderAttemptId });

    // Set duration based on subscription type
    let orderDuration = 1;
    if (subscriptionType === 'trial') {
      orderDuration = 1;
    } else if (subscriptionType === 'weekly') {
      orderDuration = 7;
    } else {
      orderDuration = duration || 1;
    }

    const orderData = {
      customerName: customerInfo.name || 'Unknown Customer',
      customerPhone: customerInfo.phone || '',
      customerEmail: customerInfo.email || '',
      address: customerInfo.address || {
        district: '',
        block: '',
        city: customerInfo.city || '',
        homeLodgeName: ''
      },
      menuId: menu._id,
      menuTitle: menuTitle || menu.title,
      menuCategory: menu.menuType,
      dietaryPreference: menu.category,
      weeklyMenu: menu.weeklyMenu,
      subscriptionType: subscriptionType || 'monthly',
      duration: orderDuration,
      price: actualPrice,
      totalAmount: actualPrice,
      deliveryTime: menu.deliveryTime,
      description: menu.description,
      imageUrl: menu.imageUrl,
      startDate: start,
      endDate: end,
      orderDate: new Date(),
      paymentStatus: 'pending',
      orderStatus: 'pending',
      source: 'web-payment',
      orderAttemptId: orderAttemptId,
      paymentId: null,
      razorpayOrderId: null,
      signature: null,
      paymentMethod: 'upi'
    };

    console.log('💾 Creating database order...');

    let newOrder;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        newOrder = new Order(orderData);
        await newOrder.save();
        console.log('✅ Database order created:', newOrder._id);
        break;
      } catch (error: any) {
        retryCount++;
        console.log(`⚠️ Order creation attempt ${retryCount} failed:`, error.message);
        
        if (error.code === 11000) {
          const newTimestamp = Date.now();
          const newRandomStr = Math.random().toString(36).substring(2, 12);
          const newUniqueSuffix = crypto.randomBytes(4).toString('hex');
          orderData.orderAttemptId = `order_${newTimestamp}_${newUniqueSuffix}_${uuidv4()}`;
          console.log(`🔄 Regenerated orderAttemptId: ${orderData.orderAttemptId}`);
        }
        
        if (retryCount >= maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }

    if (!newOrder) {
      throw new Error('Failed to create order after multiple attempts');
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(actualPrice * 100),
      currency: 'INR',
      receipt: shortReceipt,
      notes: {
        dbOrderId: String(newOrder._id),
        orderAttemptId: orderAttemptId,
        menuId: menuId,
        subscriptionType: subscriptionType,
        customerPhone: customerInfo.phone,
        timestamp: timestamp.toString()
      }
    };

    console.log('🏦 Creating Razorpay order with options:', options);

    const razorpayOrder = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', razorpayOrder.id);

    await Order.findByIdAndUpdate(newOrder._id, {
      razorpayOrderId: razorpayOrder.id
    });

    console.log('✅ Order updated with Razorpay ID');

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        dbOrderId: newOrder._id,
        orderAttemptId: orderAttemptId,
        key_id: RAZORPAY_KEY_ID,
        actualPrice: actualPrice,
        menuDetails: {
          title: menu.title,
          category: menu.category,
          deliveryTime: menu.deliveryTime
        }
      }
    });

  } catch (error) {
    console.error('❌ Create payment order error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    let errorMessage = 'Failed to create payment order';
    if (error instanceof Error) {
      if (error.message.includes('11000') || error.message.includes('duplicate')) {
        errorMessage = 'Order creation failed due to duplicate key. Please try again.';
      } else if (error.message.includes('validation')) {
        errorMessage = 'Order validation failed. Please check your input data.';
      }
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Verify Payment
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Payment verification started ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId,
      customerSubscriptionEndpoint
    } = req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      dbOrderId: string;
      customerSubscriptionEndpoint?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      console.log('❌ Missing payment verification data');
      res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
      return;
    }

    const order = await Order.findById(dbOrderId);
    if (!order) {
      console.log('❌ Order not found for ID:', dbOrderId);
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    console.log('✅ Order found:', order._id, 'Status:', order.paymentStatus);

    if (order.paymentStatus === 'success') {
      console.log('⚠️ Payment already verified for this order');
      res.status(200).json({
        success: true,
        message: 'Payment already verified',
        data: {
          paymentStatus: 'success',
          orderId: order._id,
          paymentId: order.paymentId
        }
      });
      return;
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log('🔐 Signature verification:', isAuthentic ? 'PASSED' : 'FAILED');

    if (isAuthentic) {
      const updatedOrder = await Order.findOneAndUpdate(
        { 
          _id: dbOrderId, 
          paymentStatus: { $ne: 'success' }
        },
        {
          $set: {
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            paymentStatus: 'success',
            orderStatus: 'active',
            paymentMethod: 'upi'
          }
        },
        { new: true }
      );

      if (!updatedOrder) {
        const existingOrder = await Order.findById(dbOrderId);
        if (existingOrder?.paymentStatus === 'success') {
          res.status(200).json({
            success: true,
            message: 'Payment already processed',
            data: {
              paymentStatus: 'success',
              orderId: existingOrder._id,
              paymentId: existingOrder.paymentId
            }
          });
          return;
        }
        
        throw new Error('Failed to update order status');
      }

      console.log('✅ Payment verified and order updated');

      // Send push notifications (non-blocking)
      const notifyPayload = {
        title: 'Payment Successful!',
        body: `Order for ${updatedOrder.menuTitle} (₹${updatedOrder.totalAmount}) confirmed. Customer: ${updatedOrder.customerName}`,
        icon: '/logo192.png',
        url: '/admin/orders',
      };

      notifyAllAdmins(notifyPayload).catch(() => {});

      if (customerSubscriptionEndpoint) {
        notifySubscription(customerSubscriptionEndpoint, {
          title: 'Payment Successful!',
          body: `Your order for ${updatedOrder.menuTitle} (₹${updatedOrder.totalAmount}) is confirmed!`,
          icon: '/logo192.png',
          url: '/',
        }).catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentStatus: 'success',
          orderId: updatedOrder._id,
          paymentId: razorpay_payment_id,
          orderDetails: {
            menuTitle: updatedOrder.menuTitle,
            subscriptionType: updatedOrder.subscriptionType,
            totalAmount: updatedOrder.totalAmount,
            customerName: updatedOrder.customerName,
            dietaryPreference: updatedOrder.dietaryPreference,
            deliveryTime: updatedOrder.deliveryTime,
            startDate: updatedOrder.startDate,
            endDate: updatedOrder.endDate
          }
        }
      });
    } else {
      console.log('❌ Payment verification failed');
      await Order.findByIdAndUpdate(dbOrderId, {
        $set: {
          paymentStatus: 'failed',
          orderStatus: 'cancelled'
        }
      });

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: {
          paymentStatus: 'failed'
        }
      });
    }

  } catch (error) {
    console.error('❌ Verify payment error:', error);
    
    if (req.body.dbOrderId) {
      try {
        await Order.findByIdAndUpdate(req.body.dbOrderId, {
          $set: {
            paymentStatus: 'failed',
            orderStatus: 'cancelled'
          }
        });
      } catch (updateError) {
        console.error('Failed to update order status on error:', updateError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Payment verification error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

// Get Payment Status
export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('menuId');
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        orderDetails: {
          menuTitle: order.menuTitle,
          subscriptionType: order.subscriptionType,
          totalAmount: order.totalAmount,
          customerName: order.customerName,
          dietaryPreference: order.dietaryPreference,
          deliveryTime: order.deliveryTime,
          startDate: order.startDate,
          endDate: order.endDate,
          createdAt: order.createdAt,
          orderAttemptId: order.orderAttemptId
        }
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Handle Duplicate Payment
export const handleDuplicatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    
    const orders = await Order.find({ paymentId }).sort({ createdAt: -1 });
    
    if (orders.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No orders found for this payment ID'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Found ${orders.length} orders for payment ID ${paymentId}`,
      data: {
        paymentId,
        ordersCount: orders.length,
        orders: orders.map(order => ({
          orderId: order._id,
          orderAttemptId: order.orderAttemptId,
          customerName: order.customerName,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Handle duplicate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to handle duplicate payment query',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};