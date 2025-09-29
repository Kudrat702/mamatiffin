// controllers/userController.ts
import { Request, Response, NextFunction } from 'express';
import { FoodPreference } from '../models/foodPreference';
import { Order } from '../models/order';

// Create or Update Food Selection
export const createFoodSelection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerPhone, date, breakfast, lunch, dinner, notes } = req.body;

    // Validation
    if (!customerPhone || !date) {
      res.status(400).json({
        success: false,
        message: 'Customer phone and date are required'
      });
      return;
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
      return;
    }

    // Check if date is in the past (same day is allowed)
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      res.status(400).json({
        success: false,
        message: 'Cannot modify preferences for past dates'
      });
      return;
    }

    // Verify user has active orders (check if the date falls within any active order period)
    const activeOrders = await Order.find({
      customerPhone,
      orderStatus: 'active',
      startDate: { $lte: selectedDate },
      endDate: { $gte: selectedDate }
    });

    if (activeOrders.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No active orders found for the selected date'
      });
      return;
    }

    // Get customer name from orders
    const customerName = activeOrders[0]?.customerName || 'N/A';

    // Create or update food preference
    const foodPreference = await FoodPreference.findOneAndUpdate(
      { 
        customerPhone, 
        date: new Date(date) 
      },
      {
        customerPhone,
        customerName,
        date: new Date(date),
        breakfast: breakfast !== undefined ? breakfast : true,
        lunch: lunch !== undefined ? lunch : true,
        dinner: dinner !== undefined ? dinner : true,
        informed: true, // Mark as informed when saved
        notes: notes || ''
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Food preferences saved successfully',
      data: foodPreference
    });

  } catch (error) {
    console.error('Create food selection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save food preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Bulk Create or Update Food Selection for multiple dates
export const createBulkFoodSelection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerPhone, selections } = req.body;

    // Validation
    if (!customerPhone || !selections || !Array.isArray(selections)) {
      res.status(400).json({
        success: false,
        message: 'Customer phone and selections array are required'
      });
      return;
    }

    // Validate phone format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerPhone)) {
      res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
      return;
    }

    const results = [];
    const errors = [];

    // Process each date selection
    for (const selection of selections) {
      try {
        const { date, breakfast, lunch, dinner, notes } = selection;

        if (!date) {
          errors.push({ date: 'unknown', error: 'Date is required' });
          continue;
        }

        // Check if date is in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          errors.push({ date: date, error: 'Cannot modify preferences for past dates' });
          continue;
        }

        // Verify user has active orders
        const activeOrders = await Order.find({
          customerPhone,
          orderStatus: 'active',
          startDate: { $lte: selectedDate },
          endDate: { $gte: selectedDate }
        });

        if (activeOrders.length === 0) {
          errors.push({ date: date, error: 'No active orders found for this date' });
          continue;
        }

        // Get customer name from orders
        const customerName = activeOrders[0]?.customerName || 'N/A';

        // Create or update food preference
        const foodPreference = await FoodPreference.findOneAndUpdate(
          { 
            customerPhone, 
            date: new Date(date) 
          },
          {
            customerPhone,
            customerName,
            date: new Date(date),
            breakfast: breakfast !== undefined ? breakfast : true,
            lunch: lunch !== undefined ? lunch : true,
            dinner: dinner !== undefined ? dinner : true,
            informed: true,
            notes: notes || ''
          },
          { 
            new: true, 
            upsert: true 
          }
        );

        results.push({
          date: date,
          success: true,
          data: foodPreference
        });

      } catch (error) {
        errors.push({
          date: selection.date || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Return results
    const successCount = results.length;
    const errorCount = errors.length;

    res.status(200).json({
      success: errorCount === 0,
      message: `Processed ${selections.length} selections. ${successCount} successful, ${errorCount} failed.`,
      data: {
        successful: results,
        errors: errors,
        summary: {
          total: selections.length,
          successful: successCount,
          failed: errorCount
        }
      }
    });

  } catch (error) {
    console.error('Bulk create food selection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk food preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Food Preferences by Customer Phone
export const getFoodPreferencesByPhone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerPhone } = req.params;
    const { startDate, endDate } = req.query;

    if (!customerPhone) {
      res.status(400).json({
        success: false,
        message: 'Customer phone is required'
      });
      return;
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate as string);
    }

    const filter: any = { customerPhone };
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }

    const preferences = await FoodPreference.find(filter)
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: preferences,
      count: preferences.length
    });

  } catch (error) {
    console.error('Get food preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch food preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get User Dashboard Data
export const getUserDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { customerPhone } = req.params;

    if (!customerPhone) {
      res.status(400).json({
        success: false,
        message: 'Customer phone is required'
      });
      return;
    }

    // Get active orders
    const activeOrders = await Order.find({
      customerPhone,
      orderStatus: 'active'
    }).populate('menuId');

    // Get recent food preferences (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPreferences = await FoodPreference.find({
      customerPhone,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    // Get upcoming preferences (next 7 days)
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingPreferences = await FoodPreference.find({
      customerPhone,
      date: { $gte: today, $lte: sevenDaysLater }
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: {
        activeOrders,
        recentPreferences,
        upcomingPreferences,
        summary: {
          activeOrdersCount: activeOrders.length,
          recentPreferencesCount: recentPreferences.length,
          upcomingPreferencesCount: upcomingPreferences.length
        }
      }
    });

  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};