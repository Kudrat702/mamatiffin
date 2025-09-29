// controllers/adminOrderController.ts - UPDATED FOR NEW MENUDETAILS MODEL
import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/order';
import { FoodPreference } from '../models/foodPreference';
import { MenuDetails } from '../models/menuDetails';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';

// Helper function to determine which meals are in a menu category
const getMealsFromCategory = (category: string) => {
  const categoryLower = category.toLowerCase();
  return {
    breakfast: categoryLower.includes('breakfast'),
    lunch: categoryLower.includes('lunch'),
    dinner: categoryLower.includes('dinner'),
  };
};

// Get All Orders with Filters
export const getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      dietaryPreference,
      city,
      addressType,
      customerName,
      customerPhone,
      dayName,
      mealType,
      date,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = {};

    // Dietary preference filter
    if (dietaryPreference && ['veg', 'non-veg'].includes(dietaryPreference as string)) {
      filter.dietaryPreference = dietaryPreference;
    }

    // City filter
    if (city) {
      filter['address.city'] = new RegExp(city as string, 'i');
    }

    // Address type filter (lodge or home)
    if (addressType) {
      if (addressType === 'lodge') {
        filter['address.homeLodgeName'] = new RegExp('lodge|hotel|hostel|pg', 'i');
      } else if (addressType === 'home') {
        filter['address.homeLodgeName'] = { $not: new RegExp('lodge|hotel|hostel|pg', 'i') };
      }
    }

    // Customer name filter
    if (customerName) {
      filter.customerName = new RegExp(customerName as string, 'i');
    }

    // Customer phone filter
    if (customerPhone) {
      filter.customerPhone = customerPhone as string;
    }

    // Date filter
    if (date) {
      const targetDate = new Date(date as string);
      if (!isNaN(targetDate.getTime())) {
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        filter.orderDate = { $gte: targetDate, $lt: nextDay };
      }
    }

    // Meal type filter
    if (mealType) {
      const mealTypes = [
        'Breakfast',
        'Lunch', 
        'Dinner',
        'Breakfast + Lunch',
        'Breakfast + Dinner',
        'Lunch + Dinner',
        'Breakfast + Lunch + Dinner'
      ];
      
      if (mealTypes.includes(mealType as string)) {
        filter.menuCategory = new RegExp(mealType as string, 'i');
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query - now we can populate with MenuDetails
    const orders = await Order.find(filter)
      .populate({
        path: 'menuId',
        model: 'Menus', // This should match the model name in MenuDetails
        select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        totalOrders,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalOrders / limitNum),
        hasPrevPage: pageNum > 1
      },
      filters: {
        applied: filter,
        available: {
          dietaryPreference: ['veg', 'non-veg'],
          addressType: ['lodge', 'home'],
          mealType: [
            'Breakfast',
            'Lunch', 
            'Dinner',
            'Breakfast + Lunch',
            'Breakfast + Dinner',
            'Lunch + Dinner',
            'Breakfast + Lunch + Dinner'
          ]
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Orders by Customer Phone
export const getOrdersByCustomerPhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerPhone } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      status
    } = req.query;

    if (!customerPhone) {
      res.status(400).json({
        success: false,
        message: 'Customer phone is required'
      });
      return;
    }

    // Build filter object
    const filter: any = { customerPhone };

    // Optional status filter
    if (status && ['active', 'completed', 'cancelled', 'pending'].includes(status as string)) {
      filter.orderStatus = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with MenuDetails population
    const orders = await Order.find(filter)
      .populate({
        path: 'menuId',
        model: 'Menus',
        select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(filter);

    // Get count by status for the filter tabs
    const statusCounts = await Order.aggregate([
      { $match: { customerPhone } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCountsObj = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        totalOrders,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalOrders / limitNum),
        hasPrevPage: pageNum > 1
      },
      statusCounts: {
        all: totalOrders,
        active: statusCountsObj.active || 0,
        pending: statusCountsObj.pending || 0,
        completed: statusCountsObj.completed || 0,
        cancelled: statusCountsObj.cancelled || 0
      }
    });

  } catch (error) {
    console.error('Get orders by customer phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get New Orders (Today's orders)
export const getNewOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newOrders = await Order.find({
      orderDate: {
        $gte: today,
        $lt: tomorrow
      },
      paymentStatus: 'success'
    })
    .populate({
      path: 'menuId',
      model: 'Menus',
      select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
    })
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'New orders fetched successfully',
      data: newOrders,
      count: newOrders.length,
      date: today.toDateString()
    });

  } catch (error) {
    console.error('Get new orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Old Orders (Orders from yesterday and before)
export const getOldOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oldOrders = await Order.find({
      orderDate: {
        $lt: today
      },
      paymentStatus: 'success'
    })
    .populate({
      path: 'menuId',
      model: 'Menus',
      select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
    })
    .sort({ createdAt: -1 })
    .limit(100);

    res.status(200).json({
      success: true,
      message: 'Old orders fetched successfully',
      data: oldOrders,
      count: oldOrders.length
    });

  } catch (error) {
    console.error('Get old orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch old orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Orders from Specific Day
export const getOrdersByDay = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { date } = req.query;
    
    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)'
      });
      return;
    }

    const targetDate = new Date(date as string);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
      return;
    }

    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const orders = await Order.find({
      orderDate: {
        $gte: targetDate,
        $lt: nextDay
      }
    })
    .populate({
      path: 'menuId',
      model: 'Menus',
      select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
    })
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: `Orders for ${targetDate.toDateString()} fetched successfully`,
      data: orders,
      count: orders.length,
      date: targetDate.toDateString()
    });

  } catch (error) {
    console.error('Get orders by day error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders by day',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Skip Orders for Admin
export const getSkipOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      date,
      customerPhone,
      customerName,
      page = 1,
      limit = 50,
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    // Build filter for food preferences
    const filter: any = {};
    
    // Date filter
    if (date) {
      const targetDate = new Date(date as string);
      if (!isNaN(targetDate.getTime())) {
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        filter.date = { $gte: targetDate, $lt: nextDay };
      }
    } else {
      // Default to today if no date specified
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filter.date = { $gte: today, $lt: tomorrow };
    }

    // Customer filters
    if (customerPhone) {
      filter.customerPhone = customerPhone;
    }
    if (customerName) {
      filter.customerName = new RegExp(customerName as string, 'i');
    }

    // Only show informed preferences (where user has made selections)
    filter.informed = true;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Get skip orders with customer details
    const skipOrders = await FoodPreference.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get corresponding order details for each skip order
    const enrichedSkipOrders = await Promise.all(
      skipOrders.map(async (skipOrder) => {
        const customerOrders = await Order.find({
          customerPhone: skipOrder.customerPhone,
          orderStatus: 'active',
          startDate: { $lte: skipOrder.date },
          endDate: { $gte: skipOrder.date }
        })
        .populate({
          path: 'menuId',
          model: 'Menus',
          select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
        });

        // Determine what meals the customer has actually ordered
        const orderedMeals = {
          breakfast: false,
          lunch: false,
          dinner: false
        };

        customerOrders.forEach(order => {
          const orderMeals = getMealsFromCategory(order.menuCategory);
          if (orderMeals.breakfast) orderedMeals.breakfast = true;
          if (orderMeals.lunch) orderedMeals.lunch = true;
          if (orderMeals.dinner) orderedMeals.dinner = true;
        });

        // Create filtered skip order object that only includes meals the customer ordered
        const filteredSkipOrder = {
          _id: skipOrder._id,
          customerPhone: skipOrder.customerPhone,
          customerName: skipOrder.customerName,
          date: skipOrder.date,
          // Only include meal preferences for meals that are actually ordered
          ...(orderedMeals.breakfast && { breakfast: skipOrder.breakfast }),
          ...(orderedMeals.lunch && { lunch: skipOrder.lunch }),
          ...(orderedMeals.dinner && { dinner: skipOrder.dinner }),
          informed: skipOrder.informed,
          notes: skipOrder.notes,
          customerOrders,
          orderedMeals // Add this to help frontend understand what meals were ordered
        };

        return filteredSkipOrder;
      })
    );

    // Only return skip orders where customer has at least one active order
    const validSkipOrders = enrichedSkipOrders.filter(skipOrder => 
      skipOrder.customerOrders.length > 0
    );

    const totalSkipOrders = await FoodPreference.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Skip orders fetched successfully',
      data: validSkipOrders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalSkipOrders / limitNum),
        totalOrders: totalSkipOrders,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalSkipOrders / limitNum),
        hasPrevPage: pageNum > 1
      },
      summary: {
        totalSkipOrders,
        date: filter.date ? new Date(filter.date.$gte).toDateString() : 'Today'
      }
    });

  } catch (error) {
    console.error('Get skip orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skip orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Final Delivery Orders
export const getFinalDeliveryOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      date,
      dietaryPreference,
      city,
      addressType,
      customerName,
      customerPhone,
      mealFilter,
      page = 1,
      limit = 50,
      sortBy = 'customerName',
      sortOrder = 'asc'
    } = req.query;

    // Determine target date
    let targetDate = new Date();
    if (date) {
      const parsedDate = new Date(date as string);
      if (!isNaN(parsedDate.getTime())) {
        targetDate = parsedDate;
      }
    }
    
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all active orders for the target date
    const orderFilter: any = {
      orderStatus: 'active',
      paymentStatus: 'success',
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate }
    };

    // Apply filters
    if (dietaryPreference && ['veg', 'non-veg'].includes(dietaryPreference as string)) {
      orderFilter.dietaryPreference = dietaryPreference;
    }

    if (city) {
      orderFilter['address.city'] = new RegExp(city as string, 'i');
    }

    if (addressType) {
      if (addressType === 'lodge') {
        orderFilter['address.homeLodgeName'] = new RegExp('lodge|hotel|hostel|pg', 'i');
      } else if (addressType === 'home') {
        orderFilter['address.homeLodgeName'] = { $not: new RegExp('lodge|hotel|hostel|pg', 'i') };
      }
    }

    if (customerName) {
      orderFilter.customerName = new RegExp(customerName as string, 'i');
    }

    if (customerPhone) {
      orderFilter.customerPhone = customerPhone;
    }

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Get active orders with MenuDetails population
    const activeOrders = await Order.find(orderFilter)
      .populate({
        path: 'menuId',
        model: 'Menus',
        select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
      })
      .sort(sortOptions);

    // Get skip preferences for the target date
    const skipPreferences = await FoodPreference.find({
      date: { $gte: targetDate, $lt: nextDay },
      informed: true
    });

    // Create a map of skip preferences by customer phone
    const skipMap = new Map();
    skipPreferences.forEach(skip => {
      skipMap.set(skip.customerPhone, skip);
    });

    // Process orders to determine actual deliveries
    const processedOrders = activeOrders.map(order => {
      const skipInfo = skipMap.get(order.customerPhone);
      const orderMeals = getMealsFromCategory(order.menuCategory);
      
      // Start with what the customer ordered
      let deliveryStatus = {
        breakfast: orderMeals.breakfast,
        lunch: orderMeals.lunch,
        dinner: orderMeals.dinner
      };

      // Apply skip preferences if they exist
      if (skipInfo) {
        if (orderMeals.breakfast) {
          deliveryStatus.breakfast = skipInfo.breakfast;
        }
        if (orderMeals.lunch) {
          deliveryStatus.lunch = skipInfo.lunch;
        }
        if (orderMeals.dinner) {
          deliveryStatus.dinner = skipInfo.dinner;
        }
      }

      return {
        ...order.toObject(),
        skipInfo: skipInfo ? {
          breakfast: skipInfo.breakfast,
          lunch: skipInfo.lunch,
          dinner: skipInfo.dinner,
          notes: skipInfo.notes
        } : null,
        deliveryStatus,
        targetDate: targetDate.toDateString()
      };
    });

    // Filter orders that have at least one meal to deliver
    let finalDeliveryOrders = processedOrders.filter(order => 
      order.deliveryStatus.breakfast || order.deliveryStatus.lunch || order.deliveryStatus.dinner
    );

    // Apply meal filter if specified
    if (mealFilter) {
      const mealType = (mealFilter as string).toLowerCase();
      if (['breakfast', 'lunch', 'dinner'].includes(mealType)) {
        finalDeliveryOrders = finalDeliveryOrders.filter(order => 
          order.deliveryStatus[mealType as keyof typeof order.deliveryStatus]
        );
      }
    }

    // Apply pagination to final filtered results
    const paginatedOrders = finalDeliveryOrders.slice(skip, skip + limitNum);

    // Generate summary statistics
    const summary = {
      totalActiveOrders: activeOrders.length,
      totalWithDeliveries: finalDeliveryOrders.length,
      totalWithSkips: skipPreferences.length,
      totalCompletelySkipped: activeOrders.length - finalDeliveryOrders.length,
      deliveryBreakdown: {
        breakfast: finalDeliveryOrders.filter(o => o.deliveryStatus.breakfast).length,
        lunch: finalDeliveryOrders.filter(o => o.deliveryStatus.lunch).length,
        dinner: finalDeliveryOrders.filter(o => o.deliveryStatus.dinner).length
      },
      date: targetDate.toDateString()
    };

    res.status(200).json({
      success: true,
      message: 'Final delivery orders fetched successfully',
      data: paginatedOrders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(finalDeliveryOrders.length / limitNum),
        totalOrders: finalDeliveryOrders.length,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(finalDeliveryOrders.length / limitNum),
        hasPrevPage: pageNum > 1
      },
      summary
    });

  } catch (error) {
    console.error('Get final delivery orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch final delivery orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Single Order
export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
      return;
    }

    const order = await Order.findById(orderId)
      .populate({
        path: 'menuId',
        model: 'Menus',
        select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
      });
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update Order Status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { orderStatus, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
      return;
    }

    const validStatuses = ['active', 'completed', 'cancelled', 'pending'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order status. Valid statuses: ' + validStatuses.join(', ')
      });
      return;
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (notes !== undefined) updateData.notes = notes;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    )
    .populate({
      path: 'menuId',
      model: 'Menus',
      select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
    });

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Order Statistics
export const getOrderStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayStats = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: today, $lt: tomorrow },
          paymentStatus: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          vegOrders: {
            $sum: { $cond: [{ $eq: ['$dietaryPreference', 'veg'] }, 1, 0] }
          },
          nonVegOrders: {
            $sum: { $cond: [{ $eq: ['$dietaryPreference', 'non-veg'] }, 1, 0] }
          },
          monthlySubscriptions: {
            $sum: { $cond: [{ $eq: ['$subscriptionType', 'monthly'] }, 1, 0] }
          },
          trialOrders: {
            $sum: { $cond: [{ $eq: ['$subscriptionType', 'trial'] }, 1, 0] }
          }
        }
      }
    ]);

    // All time stats
    const allTimeStats = await Order.aggregate([
      {
        $match: { paymentStatus: 'success' }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        today: todayStats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          vegOrders: 0,
          nonVegOrders: 0,
          monthlySubscriptions: 0,
          trialOrders: 0
        },
        allTime: allTimeStats[0] || {
          totalOrders: 0,
          totalRevenue: 0
        }
      }
    });

  } catch (error) {
    console.error('Get order statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk Update Orders
export const bulkUpdateOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderIds, updateData } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      });
      return;
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Update data is required'
      });
      return;
    }

    // Validate order IDs
    const validOrderIds = orderIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validOrderIds.length !== orderIds.length) {
      res.status(400).json({
        success: false,
        message: 'One or more invalid order IDs'
      });
      return;
    }

    // Validate update data
    const allowedFields = ['orderStatus', 'notes', 'deliveryTime'];
    const updateFields = Object.keys(updateData);
    const invalidFields = updateFields.filter(field => !allowedFields.includes(field));
    
    if (invalidFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`
      });
      return;
    }

    // Validate order status if provided
    if (updateData.orderStatus && !['active', 'completed', 'cancelled', 'pending'].includes(updateData.orderStatus)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
      return;
    }

    // Perform bulk update
    const result = await Order.updateMany(
      { _id: { $in: validOrderIds } },
      { $set: updateData }
    );

    res.status(200).json({
      success: true,
      message: 'Orders updated successfully',
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        updatedFields: updateData
      }
    });

  } catch (error) {
    console.error('Bulk update orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete Order (soft delete by changing status)
export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
      return;
    }

    const order = await Order.findById(orderId);
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    // Soft delete by updating status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        orderStatus: 'cancelled',
        notes: `Cancelled by admin${reason ? `: ${reason}` : ''}`
      },
      { new: true }
    )
    .populate({
      path: 'menuId',
      model: 'Menus',
      select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Order Analytics (for dashboard insights)
export const getOrderAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'day' // 'day', 'week', 'month'
    } = req.query;

    let matchStage: any = { paymentStatus: 'success' };

    // Date range filter
    if (startDate || endDate) {
      matchStage.orderDate = {};
      if (startDate) {
        matchStage.orderDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        matchStage.orderDate.$lte = end;
      }
    }

    // Group by format
    let groupFormat: any;
    switch (groupBy) {
      case 'week':
        groupFormat = {
          year: { $year: '$orderDate' },
          week: { $week: '$orderDate' }
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        };
        break;
      default: // day
        groupFormat = {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' },
          day: { $dayOfMonth: '$orderDate' }
        };
    }

    const analytics = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupFormat,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          vegOrders: { $sum: { $cond: [{ $eq: ['$dietaryPreference', 'veg'] }, 1, 0] } },
          nonVegOrders: { $sum: { $cond: [{ $eq: ['$dietaryPreference', 'non-veg'] }, 1, 0] } },
          monthlySubscriptions: { $sum: { $cond: [{ $eq: ['$subscriptionType', 'monthly'] }, 1, 0] } },
          trialOrders: { $sum: { $cond: [{ $eq: ['$subscriptionType', 'trial'] }, 1, 0] } },
          activeOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'active'] }, 1, 0] } },
          completedOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'completed'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Get top cities
    const topCities = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$address.city',
          orderCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 }
    ]);

    // Get meal type distribution
    const mealTypeDistribution = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$menuCategory',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeSeriesData: analytics,
        topCities,
        mealTypeDistribution,
        summary: {
          totalAnalyzedOrders: analytics.reduce((sum, item) => sum + item.totalOrders, 0),
          totalAnalyzedRevenue: analytics.reduce((sum, item) => sum + item.totalRevenue, 0),
          averageOrderValue: analytics.length > 0 
            ? analytics.reduce((sum, item) => sum + item.avgOrderValue, 0) / analytics.length 
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export Order Data
export const exportOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      startDate,
      endDate,
      status,
      dietaryPreference,
      city,
      format = 'json'
    } = req.query;

    const filter: any = {};

    // Date range filter
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.orderDate.$lte = end;
      }
    }

    // Other filters
    if (status) filter.orderStatus = status;
    if (dietaryPreference) filter.dietaryPreference = dietaryPreference;
    if (city) filter['address.city'] = new RegExp(city as string, 'i');

    const orders = await Order.find(filter)
      .populate({
        path: 'menuId',
        model: 'Menus',
        select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
      })
      .sort({ orderDate: -1 })
      .limit(10000);

    if (format === 'csv') {
      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');

      // CSV header row
      const csvHeaders = [
        'Order ID',
        'Customer Name',
        'Customer Phone',
        'Menu Title',
        'Menu Category',
        'Dietary Preference',
        'Subscription Type',
        'Total Amount',
        'Payment Status',
        'Order Status',
        'Order Date',
        'Start Date',
        'End Date',
        'City',
        'Address'
      ].join(',');

      res.write(csvHeaders + '\n');

      // CSV data rows
      orders.forEach(order => {
        const menuDetails = order.menuId as any; // Type assertion for populated field
        const row = [
          order._id,
          `"${order.customerName}"`,
          order.customerPhone,
          `"${order.menuTitle || (menuDetails?.title || 'N/A')}"`,
          `"${order.menuCategory}"`,
          order.dietaryPreference,
          order.subscriptionType,
          order.totalAmount,
          order.paymentStatus,
          order.orderStatus,
          order.orderDate.toISOString().split('T')[0],
          order.startDate.toISOString().split('T')[0],
          order.endDate.toISOString().split('T')[0],
          `"${order.address?.city || ''}"`,
          `"${order.address?.homeLodgeName || ''}, ${order.address?.block || ''}, ${order.address?.district || ''}"`
        ].join(',');
        
        res.write(row + '\n');
      });

      res.end();
    } else {
      // JSON format
      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length,
        exportedAt: new Date().toISOString(),
        filters: filter
      });
    }

  } catch (error) {
    console.error('Export orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Customer Overview
export const getCustomerOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'totalOrders',
      sortOrder = 'desc',
      city,
      status
    } = req.query;

    const matchStage: any = {};
    if (city) matchStage['address.city'] = new RegExp(city as string, 'i');
    if (status) matchStage.orderStatus = status;

    const customerStats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$customerPhone',
          customerName: { $first: '$customerName' },
          city: { $first: '$address.city' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          activeOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'active'] }, 1, 0] } },
          completedOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'completed'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] } },
          lastOrderDate: { $max: '$orderDate' },
          avgOrderValue: { $avg: '$totalAmount' },
          vegOrders: { $sum: { $cond: [{ $eq: ['$dietaryPreference', 'veg'] }, 1, 0] } },
          nonVegOrders: { $sum: { $cond: [{ $eq: ['$dietaryPreference', 'non-veg'] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          customerPhone: '$_id',
          preferredDiet: {
            $cond: [
              { $gt: ['$vegOrders', '$nonVegOrders'] },
              'veg',
              'non-veg'
            ]
          }
        }
      },
      { $sort: { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 } }
    ]);

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const paginatedCustomers = customerStats.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: paginatedCustomers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(customerStats.length / limitNum),
        totalCustomers: customerStats.length,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(customerStats.length / limitNum),
        hasPrevPage: pageNum > 1
      },
      summary: {
        totalCustomers: customerStats.length,
        totalRevenue: customerStats.reduce((sum, customer) => sum + customer.totalRevenue, 0),
        avgOrdersPerCustomer: customerStats.length > 0 
          ? customerStats.reduce((sum, customer) => sum + customer.totalOrders, 0) / customerStats.length 
          : 0
      }
    });

  } catch (error) {
    console.error('Get customer overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer overview',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Search Orders
export const searchOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      query,
      searchFields = 'all',
      limit = 50
    } = req.query;

    if (!query || (query as string).trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
      return;
    }

    const searchQuery = (query as string).trim();
    const searchRegex = new RegExp(searchQuery, 'i');
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));

    let filter: any = {};

    switch (searchFields) {
      case 'customer':
        filter = {
          $or: [
            { customerName: searchRegex },
            { customerPhone: searchQuery }
          ]
        };
        break;
      case 'menu':
        filter = {
          $or: [
            { menuTitle: searchRegex },
            { menuCategory: searchRegex }
          ]
        };
        break;
      case 'address':
        filter = {
          $or: [
            { 'address.city': searchRegex },
            { 'address.district': searchRegex },
            { 'address.block': searchRegex },
            { 'address.homeLodgeName': searchRegex }
          ]
        };
        break;
      default: // 'all'
        filter = {
          $or: [
            { customerName: searchRegex },
            { customerPhone: searchQuery },
            { menuTitle: searchRegex },
            { menuCategory: searchRegex },
            { 'address.city': searchRegex },
            { 'address.district': searchRegex },
            { 'address.block': searchRegex },
            { 'address.homeLodgeName': searchRegex }
          ]
        };
    }

    const orders = await Order.find(filter)
      .populate({
        path: 'menuId',
        model: 'Menus',
        select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
      })
      .sort({ orderDate: -1 })
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: orders,
      count: orders.length,
      searchQuery: searchQuery,
      searchFields: searchFields
    });

  } catch (error) {
    console.error('Search orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export Final Delivery Orders
export const exportFinalDeliveryOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      date,
      dietaryPreference,
      city,
      addressType,
      customerName,
      customerPhone,
      mealFilter,
      format = 'excel'
    } = req.query;

    // Determine target date
    let targetDate = new Date();
    if (date) {
      const parsedDate = new Date(date as string);
      if (!isNaN(parsedDate.getTime())) {
        targetDate = parsedDate;
      }
    }
    
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get all active orders for the target date
    const orderFilter: any = {
      orderStatus: 'active',
      paymentStatus: 'success',
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate }
    };

    // Apply filters
    if (dietaryPreference && ['veg', 'non-veg'].includes(dietaryPreference as string)) {
      orderFilter.dietaryPreference = dietaryPreference;
    }

    if (city) {
      orderFilter['address.city'] = new RegExp(city as string, 'i');
    }

    if (addressType) {
      if (addressType === 'lodge') {
        orderFilter['address.homeLodgeName'] = new RegExp('lodge|hotel|hostel|pg', 'i');
      } else if (addressType === 'home') {
        orderFilter['address.homeLodgeName'] = { $not: new RegExp('lodge|hotel|hostel|pg', 'i') };
      }
    }

    if (customerName) {
      orderFilter.customerName = new RegExp(customerName as string, 'i');
    }

    if (customerPhone) {
      orderFilter.customerPhone = customerPhone;
    }

    // Get active orders with MenuDetails population
    const activeOrders = await Order.find(orderFilter)
      .populate({
        path: 'menuId',
        model: 'Menus',
        select: 'title description imageUrl deliveryTime weeklyMenu category menuType priceMonthly priceTrial'
      })
      .sort({ customerName: 1 });

    // Get skip preferences for the target date
    const skipPreferences = await FoodPreference.find({
      date: { $gte: targetDate, $lt: nextDay },
      informed: true
    });

    // Create a map of skip preferences by customer phone
    const skipMap = new Map();
    skipPreferences.forEach(skip => {
      skipMap.set(skip.customerPhone, skip);
    });

    // Process orders to determine actual deliveries
    const processedOrders = activeOrders.map(order => {
      const skipInfo = skipMap.get(order.customerPhone);
      const orderMeals = getMealsFromCategory(order.menuCategory);
      
      let deliveryStatus = {
        breakfast: orderMeals.breakfast,
        lunch: orderMeals.lunch,
        dinner: orderMeals.dinner
      };

      // Apply skip preferences if they exist
      if (skipInfo) {
        if (orderMeals.breakfast) {
          deliveryStatus.breakfast = skipInfo.breakfast;
        }
        if (orderMeals.lunch) {
          deliveryStatus.lunch = skipInfo.lunch;
        }
        if (orderMeals.dinner) {
          deliveryStatus.dinner = skipInfo.dinner;
        }
      }

      return {
        ...order.toObject(),
        skipInfo: skipInfo ? {
          breakfast: skipInfo.breakfast,
          lunch: skipInfo.lunch,
          dinner: skipInfo.dinner,
          notes: skipInfo.notes
        } : null,
        deliveryStatus,
        targetDate: targetDate.toDateString()
      };
    });

    // Filter orders that have at least one meal to deliver
    let finalDeliveryOrders = processedOrders.filter(order => 
      order.deliveryStatus.breakfast || order.deliveryStatus.lunch || order.deliveryStatus.dinner
    );

    // Apply meal filter if specified
    if (mealFilter) {
      const mealType = (mealFilter as string).toLowerCase();
      if (['breakfast', 'lunch', 'dinner'].includes(mealType)) {
        finalDeliveryOrders = finalDeliveryOrders.filter(order => 
          order.deliveryStatus[mealType as keyof typeof order.deliveryStatus]
        );
      }
    }

    // Prepare data for export
    const exportData = finalDeliveryOrders.map((order, index) => {
      const mealsToDeliver = [];
      if (order.deliveryStatus.breakfast) mealsToDeliver.push('Breakfast');
      if (order.deliveryStatus.lunch) mealsToDeliver.push('Lunch');
      if (order.deliveryStatus.dinner) mealsToDeliver.push('Dinner');

      const menuDetails = order.menuId as any; // Type assertion for populated field

      return {
        'Sr. No.': index + 1,
        'Customer Name': order.customerName,
        'Phone': order.customerPhone,
        'Menu Type': `${order.menuTitle || (menuDetails?.title || 'N/A')} (${order.dietaryPreference.toUpperCase()})`,
        'Address Type': order.address?.homeLodgeName?.match(/lodge|hotel|hostel|pg/i) ? 'Lodge/PG' : 'Home',
        'Full Address': `${order.address?.homeLodgeName || ''}, ${order.address?.block || ''}, ${order.address?.district || ''}, ${order.address?.city || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, ''),
        'City': order.address?.city || 'N/A',
        'Meals to Deliver': mealsToDeliver.join(', '),
        'Total Amount': `₹${order.totalAmount}`,
        'Skip Notes': order.skipInfo?.notes || 'No notes',
        'Order Date': new Date(order.orderDate).toLocaleDateString('en-IN'),
        'Subscription Type': order.subscriptionType === 'monthly' ? 'Monthly Plan' : 'Trial',
        'Delivery Status': mealsToDeliver.length > 0 ? 'To Deliver' : 'No Delivery'
      };
    });

    const fileName = `Final_Delivery_Orders_${targetDate.toISOString().split('T')[0]}`;

    if (format === 'excel') {
      // Create Excel file
      const wb = XLSX.utils.book_new();
      
      // Create summary data
      const summary = [
        ['Final Delivery Orders Summary'],
        ['Date:', targetDate.toDateString()],
        ['Total Orders with Deliveries:', finalDeliveryOrders.length],
        ['Total Breakfast Deliveries:', finalDeliveryOrders.filter(o => o.deliveryStatus.breakfast).length],
        ['Total Lunch Deliveries:', finalDeliveryOrders.filter(o => o.deliveryStatus.lunch).length],
        ['Total Dinner Deliveries:', finalDeliveryOrders.filter(o => o.deliveryStatus.dinner).length],
        [''],
        ['Filters Applied:'],
        ['Dietary Preference:', dietaryPreference || 'All'],
        ['City:', city || 'All'],
        ['Address Type:', addressType || 'All'],
        ['Customer Name:', customerName || 'All'],
        ['Meal Filter:', mealFilter || 'All'],
        ['']
      ];

      // Create summary worksheet
      const summaryWs = XLSX.utils.aoa_to_sheet(summary);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

      // Create main data worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 8 },  // Sr. No.
        { wch: 20 }, // Customer Name
        { wch: 15 }, // Phone
        { wch: 30 }, // Menu Type
        { wch: 15 }, // Address Type
        { wch: 50 }, // Full Address
        { wch: 15 }, // City
        { wch: 25 }, // Meals to Deliver
        { wch: 12 }, // Total Amount
        { wch: 20 }, // Skip Notes
        { wch: 12 }, // Order Date
        { wch: 15 }, // Subscription Type
        { wch: 15 }  // Delivery Status
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Delivery Orders');

      // Generate Excel buffer
      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);

    } else if (format === 'csv') {
      // Create CSV
      const ws = XLSX.utils.json_to_sheet(exportData);
      const csvContent = XLSX.utils.sheet_to_csv(ws);

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      res.send(csvContent);

    } else {
      // JSON format
      res.status(200).json({
        success: true,
        data: exportData,
        count: exportData.length,
        summary: {
          totalActiveOrders: activeOrders.length,
          totalWithDeliveries: finalDeliveryOrders.length,
          deliveryBreakdown: {
            breakfast: finalDeliveryOrders.filter(o => o.deliveryStatus.breakfast).length,
            lunch: finalDeliveryOrders.filter(o => o.deliveryStatus.lunch).length,
            dinner: finalDeliveryOrders.filter(o => o.deliveryStatus.dinner).length
          },
          date: targetDate.toDateString()
        },
        exportedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Export final delivery orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export final delivery orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

