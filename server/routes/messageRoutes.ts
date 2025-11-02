// // routes/messageRoutes.ts - FINAL FIXED VERSION
// import express, { Request, Response } from 'express';
// import Message from '../models/message';
// import { 
//   validateMessage, 
//   createMessage, 
//   getAllMessages, 
//   getMessageById, 
//   updateMessageStatus, 
//   replyToMessage, 
//   deleteMessage 
// } from '../controllers/messageController';

// const router = express.Router();

// /**
//  * ✅ CRITICAL: SPECIFIC ROUTES MUST COME BEFORE GENERAL ROUTES
//  * Stats endpoint MUST be before /:id endpoint to avoid conflicts
//  */

// /**
//  * Get message statistics (MUST BE FIRST)
//  * GET /api/messages/stats/summary
//  */
// router.get('/stats/summary', async (req: Request, res: Response): Promise<void> => {
//   try {
//     console.log('Fetching message statistics');
    
//     // Get actual stats from database
//     const stats = await Message.aggregate([
//       {
//         $group: {
//           _id: '$status',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const statusStats = {
//       unread: 0,
//       read: 0,
//       replied: 0,
//       total: 0
//     };

//     let total = 0;
//     stats.forEach(stat => {
//       statusStats[stat._id as keyof typeof statusStats] = stat.count;
//       total += stat.count;
//     });
//     statusStats.total = total;
    
//     res.json({
//       success: true,
//       data: statusStats,
//       message: 'Statistics retrieved successfully'
//     });
//   } catch (error: any) {
//     console.error('Error fetching message statistics:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching message statistics',
//       error: error.message
//     });
//   }
// });

// /**
//  * Health check for messages service
//  * GET /api/messages/health
//  */
// router.get('/health', (_req: Request, res: Response): void => {
//   res.json({
//     success: true,
//     message: 'Messages service is running',
//     timestamp: new Date().toISOString(),
//     status: 'Active with database integration',
//     availableEndpoints: [
//       'GET /api/messages',
//       'GET /api/messages/:id',
//       'POST /api/messages',
//       'PATCH /api/messages/:id/status',
//       'PATCH /api/messages/:id/reply',
//       'DELETE /api/messages/:id',
//       'GET /api/messages/stats/summary'
//     ]
//   });
// });

// /**
//  * Get all messages with filters + stats for dashboard
//  * GET /api/messages
//  */
// router.get('/', getAllMessages);

// /**
//  * Create new message (contact form submission)
//  * POST /api/messages
//  */
// router.post('/', validateMessage, createMessage);

// /**
//  * Get message by ID (MUST BE AFTER /stats/summary and /health)
//  * GET /api/messages/:id
//  */
// router.get('/:id', getMessageById);

// /**
//  * Update message status
//  * PATCH /api/messages/:id/status
//  */
// router.patch('/:id/status', updateMessageStatus);

// /**
//  * Reply to message
//  * PATCH /api/messages/:id/reply
//  */
// router.patch('/:id/reply', replyToMessage);

// /**
//  * Delete message
//  * DELETE /api/messages/:id
//  */
// router.delete('/:id', deleteMessage);

// export default router;

// routes/messageRoutes.ts - FIXED WITH AUTHENTICATION
import express, { Request, Response } from 'express';
import Message from '../models/message';
import { verifyAdminToken } from '../middleware/adminAuthMiddleware'; // ✅ ADDED
import { 
  validateMessage, 
  createMessage, 
  getAllMessages, 
  getMessageById, 
  updateMessageStatus, 
  replyToMessage, 
  deleteMessage 
} from '../controllers/messageController';

const router = express.Router();

console.log('📨 Loading Message Routes with Authentication...');

/**
 * ✅ CRITICAL: SPECIFIC ROUTES MUST COME BEFORE GENERAL ROUTES
 * Stats endpoint MUST be before /:id endpoint to avoid conflicts
 */

/**
 * Get message statistics (ADMIN ONLY)
 * GET /api/messages/stats/summary
 * ✅ PROTECTED WITH verifyAdminToken
 */
router.get('/stats/summary', verifyAdminToken, async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Fetching message statistics (Admin authenticated)');
    
    // Get actual stats from database
    const stats = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      unread: 0,
      read: 0,
      replied: 0,
      total: 0
    };

    let total = 0;
    stats.forEach(stat => {
      statusStats[stat._id as keyof typeof statusStats] = stat.count;
      total += stat.count;
    });
    statusStats.total = total;
    
    res.json({
      success: true,
      data: statusStats,
      message: 'Statistics retrieved successfully'
    });
  } catch (error: any) {
    console.error('❌ Error fetching message statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message statistics',
      error: error.message
    });
  }
});

/**
 * Health check for messages service (PUBLIC)
 * GET /api/messages/health
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Messages service is running',
    timestamp: new Date().toISOString(),
    status: 'Active with database integration',
    availableEndpoints: [
      'GET /api/messages (Admin)',
      'GET /api/messages/:id (Admin)',
      'POST /api/messages (Public)',
      'PATCH /api/messages/:id/status (Admin)',
      'PATCH /api/messages/:id/reply (Admin)',
      'DELETE /api/messages/:id (Admin)',
      'GET /api/messages/stats/summary (Admin)'
    ]
  });
});

/**
 * Get all messages with filters + stats for dashboard (ADMIN ONLY)
 * GET /api/messages
 * ✅ PROTECTED WITH verifyAdminToken
 */
router.get('/', verifyAdminToken, getAllMessages);

/**
 * Create new message (PUBLIC - Contact form submission)
 * POST /api/messages
 * ⚠️ NO AUTHENTICATION - Public endpoint
 */
router.post('/', validateMessage, createMessage);

/**
 * Get message by ID (ADMIN ONLY)
 * GET /api/messages/:id
 * ✅ PROTECTED WITH verifyAdminToken
 */
router.get('/:id', verifyAdminToken, getMessageById);

/**
 * Update message status (ADMIN ONLY)
 * PATCH /api/messages/:id/status
 * ✅ PROTECTED WITH verifyAdminToken
 */
router.patch('/:id/status', verifyAdminToken, updateMessageStatus);

/**
 * Reply to message (ADMIN ONLY)
 * PATCH /api/messages/:id/reply
 * ✅ PROTECTED WITH verifyAdminToken
 */
router.patch('/:id/reply', verifyAdminToken, replyToMessage);

/**
 * Delete message (ADMIN ONLY)
 * DELETE /api/messages/:id
 * ✅ PROTECTED WITH verifyAdminToken
 */
router.delete('/:id', verifyAdminToken, deleteMessage);

console.log('✅ Message routes configured with authentication');
console.log('📋 Protected Admin Endpoints:');
console.log('  🔒 GET    /api/messages');
console.log('  🔒 GET    /api/messages/stats/summary');
console.log('  🔒 GET    /api/messages/:id');
console.log('  🔒 PATCH  /api/messages/:id/status');
console.log('  🔒 PATCH  /api/messages/:id/reply');
console.log('  🔒 DELETE /api/messages/:id');
console.log('📋 Public Endpoints:');
console.log('  🌐 POST   /api/messages (Contact form)');
console.log('  🌐 GET    /api/messages/health');

export default router;