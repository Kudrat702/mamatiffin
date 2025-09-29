// controllers/messageController.ts
import { Request, Response } from 'express';
import Message from '../models/message';
import { body, validationResult } from 'express-validator';

// Validation rules
export const validateMessage = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('subject')
    .isIn(['order', 'delivery', 'subscription', 'feedback', 'complaint', 'other'])
    .withMessage('Please select a valid subject'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Create new message (from contact form)
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { name, email, phone, subject, message } = req.body;

    // Create new message
    const newMessage = new Message({
      name,
      email,
      phone,
      subject,
      message
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      data: {
        id: newMessage._id,
        name: newMessage.name,
        subject: newMessage.subject,
        createdAt: newMessage.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Get all messages for admin (with pagination and filters)
export const getAllMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const subject = req.query.subject as string;
    const search = req.query.search as string;

    // Build query
    const query: any = {};
    
    if (status && ['unread', 'read', 'replied'].includes(status)) {
      query.status = status;
    }
    
    if (subject && ['order', 'delivery', 'subscription', 'feedback', 'complaint', 'other'].includes(subject)) {
      query.subject = subject;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Message.countDocuments(query);
    
    // Get messages with pagination
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    // Get stats
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
      replied: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id as keyof typeof statusStats] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalMessages: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        stats: statusStats
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single message by ID
export const getMessageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    
    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    // Mark as read if it's unread
    if (message.status === 'unread') {
      message.status = 'read';
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update message status
export const updateMessageStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
      return;
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reply to message
export const replyToMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    if (!adminReply || adminReply.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: 'Reply must be at least 10 characters long'
      });
      return;
    }

    const message = await Message.findByIdAndUpdate(
      id,
      {
        adminReply: adminReply.trim(),
        status: 'replied',
        repliedAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Error replying to message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete message
export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};