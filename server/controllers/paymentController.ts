// controllers/paymentController.ts - ENHANCED VERSION
import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../models/order';
import { MenuDetails } from '../models/menuDetails'; // FIXED: Changed from Menu to MenuDetails

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_R8nDLfpS02oTlp',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'fKtXbS98of3zFin4sT48OjK6',
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

    // FIXED: Changed Menu to MenuDetails
    const menu = await MenuDetails.findById(menuId);
    if (!menu) {
      console.log('❌ Menu not found for ID:', menuId);
      res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
      return;
    }

    // UPDATED: Use new field names from MenuDetails model
    console.log('✅ Menu found:', menu.menuType, 'Monthly Price:', menu.priceMonthly, 'Trial Price:', menu.priceTrial);

    // Calculate actual price from menu using new field structure
    let actualPrice = menu.priceMonthly;
    if (subscriptionType === 'trial') {
      actualPrice = menu.priceTrial; // Use dedicated trial price field
      console.log('📊 Trial price used:', actualPrice);
    }

    // Verify price matches (allow small rounding differences)
    if (Math.abs(totalAmount - actualPrice) > 1) {
      console.log('❌ Price mismatch:', { expected: actualPrice, received: totalAmount });
      res.status(400).json({
        success: false,
        message: `Price mismatch. Expected: ₹${actualPrice}, Received: ₹${totalAmount}`
      });
      return;
    }

    console.log('✅ Price validation passed');

    // Calculate dates
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    if (subscriptionType === 'trial') {
      end.setDate(end.getDate() + 1); // 1 day
    } else {
      end.setMonth(end.getMonth() + (duration || 1)); // monthly
    }

    console.log('📅 Date calculation:', { start, end });

    // Generate unique identifiers - ensuring maximum uniqueness
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 12);
    const uniqueSuffix = crypto.randomBytes(4).toString('hex');
    
    const shortReceipt = `ord_${timestamp.toString().slice(-8)}_${randomStr.slice(0, 6)}`;
    const orderAttemptId = `order_${timestamp}_${uniqueSuffix}_${uuidv4()}`;

    console.log('🆔 Generated IDs:', { shortReceipt, orderAttemptId });

    // UPDATED: Create order with new MenuDetails structure
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
      menuTitle: menuTitle || menu.title, // UPDATED: Use title field
      menuCategory: menu.menuType, // UPDATED: Use menuType field
      dietaryPreference: menu.category, // UPDATED: Use category field
      weeklyMenu: menu.weeklyMenu,
      subscriptionType: subscriptionType || 'monthly',
      duration: subscriptionType === 'trial' ? 1 : duration || 1,
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
      // Explicitly set payment fields to avoid schema conflicts
      paymentId: null,
      razorpayOrderId: null,
      signature: null,
      paymentMethod: 'upi'
    };

    console.log('💾 Creating database order...');

    let newOrder;
    let retryCount = 0;
    const maxRetries = 3;

    // Retry mechanism for order creation
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
          // Duplicate key error - regenerate unique ID
          const newTimestamp = Date.now();
          const newRandomStr = Math.random().toString(36).substring(2, 12);
          const newUniqueSuffix = crypto.randomBytes(4).toString('hex');
          orderData.orderAttemptId = `order_${newTimestamp}_${newUniqueSuffix}_${uuidv4()}`;
          console.log(`🔄 Regenerated orderAttemptId: ${orderData.orderAttemptId}`);
        }
        
        if (retryCount >= maxRetries) {
          throw error;
        }
        
        // Wait a bit before retry
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
      }
    }

    if (!newOrder) {
      throw new Error('Failed to create order after multiple attempts');
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(actualPrice * 100), // Amount in paise
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

    // Update order with Razorpay order ID
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
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_R8nDLfpS02oTlp',
        actualPrice: actualPrice,
        menuDetails: {
          title: menu.title, // UPDATED: Use title field
          category: menu.category, // UPDATED: Use category field
          deliveryTime: menu.deliveryTime
        }
      }
    });

  } catch (error) {
    console.error('❌ Create payment order error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Enhanced error response with more details
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

// Verify Payment - Enhanced version
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Payment verification started ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      dbOrderId
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      console.log('❌ Missing payment verification data');
      res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
      return;
    }

    // Find the order in database
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

    // Check if payment is already processed
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

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'fKtXbS98of3zFin4sT48OjK6')
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log('🔐 Signature verification:', isAuthentic ? 'PASSED' : 'FAILED');

    if (isAuthentic) {
      // Payment successful - use findOneAndUpdate for atomic operation
      const updatedOrder = await Order.findOneAndUpdate(
        { 
          _id: dbOrderId, 
          paymentStatus: { $ne: 'success' } // Only update if not already successful
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
        // Order might have been already updated by another request
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
      // Payment verification failed
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

// Additional utility function to handle duplicate payments
export const handleDuplicatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    
    // Find all orders with this payment ID
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