// routes/messageRoutes.ts - FINAL FIXED VERSION
import express, { Request, Response } from 'express';
import Message from '../models/message';
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

/**
 * ✅ CRITICAL: SPECIFIC ROUTES MUST COME BEFORE GENERAL ROUTES
 * Stats endpoint MUST be before /:id endpoint to avoid conflicts
 */

/**
 * Get message statistics (MUST BE FIRST)
 * GET /api/messages/stats/summary
 */
router.get('/stats/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching message statistics');
    
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
    console.error('Error fetching message statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message statistics',
      error: error.message
    });
  }
});

/**
 * Health check for messages service
 * GET /api/messages/health
 */
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Messages service is running',
    timestamp: new Date().toISOString(),
    status: 'Active with database integration',
    availableEndpoints: [
      'GET /api/messages',
      'GET /api/messages/:id',
      'POST /api/messages',
      'PATCH /api/messages/:id/status',
      'PATCH /api/messages/:id/reply',
      'DELETE /api/messages/:id',
      'GET /api/messages/stats/summary'
    ]
  });
});

/**
 * Get all messages with filters + stats for dashboard
 * GET /api/messages
 */
router.get('/', getAllMessages);

/**
 * Create new message (contact form submission)
 * POST /api/messages
 */
router.post('/', validateMessage, createMessage);

/**
 * Get message by ID (MUST BE AFTER /stats/summary and /health)
 * GET /api/messages/:id
 */
router.get('/:id', getMessageById);

/**
 * Update message status
 * PATCH /api/messages/:id/status
 */
router.patch('/:id/status', updateMessageStatus);

/**
 * Reply to message
 * PATCH /api/messages/:id/reply
 */
router.patch('/:id/reply', replyToMessage);

/**
 * Delete message
 * DELETE /api/messages/:id
 */
router.delete('/:id', deleteMessage);

export default router;