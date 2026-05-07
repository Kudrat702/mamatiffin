import { Request, Response } from 'express';
import Book from '../models/book';
import  { AuthenticatedRequest as AuthRequest  } from '../middleware/auth';
import  { cloudinary }  from '../config/cloudinary.config';

interface MulterFile extends Express.Multer.File {
  path: string;
  filename: string;
}

// ============================================
// PUBLIC CONTROLLERS
// ============================================

/**
 * @desc    Get all available books with filters (BUY page)
 * @route   GET /api/books
 * @access  Public
 */
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { class: bookClass, subject, search, page = '1', limit = '20' } = req.query as {
      class?: string;
      subject?: string;
      search?: string;
      page?: string;
      limit?: string;
    };

    const query: Record<string, any> = { status: 'Available' };
    if (bookClass) query.class = bookClass;
    if (subject) query.subject = subject;
    if (search) query.bookName = { $regex: search, $options: 'i' };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      books,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    console.error('Get books error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    res.json({ success: true, book });
  } catch (err: any) {
    console.error('Get book by ID error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// PROTECTED CONTROLLERS (Login required)
// ============================================

/**
 * @desc    Get current user's listings
 * @route   GET /api/books/my/listings
 * @access  Private
 */
export const getMyListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const books = await Book.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, books });
  } catch (err: any) {
    console.error('My listings error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create new book listing
 * @route   POST /api/books
 * @access  Private
 */
export const createBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as MulterFile[] | undefined;

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please upload at least 1 image',
      });
      return;
    }

    const {
      bookName,
      price,
      class: bookClass,
      subject,
      condition,
      description,
      sellerName,
      sellerPhone,
      sellerAddress,
    } = req.body;

    const images = files.map((f) => ({
      url: f.path,
      publicId: f.filename,
    }));

    const book = await Book.create({
      userId: req.user!.id,
      bookName,
      price: Number(price),
      images,
      class: bookClass,
      subject,
      condition: condition || 'Good',
      description: description || '',
      sellerName: sellerName || req.user!.name,
      sellerPhone: sellerPhone || req.user!.phone,
      sellerAddress,
    });

    res.status(201).json({ success: true, book });
  } catch (err: any) {
    console.error('Create book error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error',
    });
  }
};

/**
 * @desc    Update existing book listing
 * @route   PUT /api/books/:id
 * @access  Private (Owner only)
 */
export const updateBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    // Ownership check
    if (book.userId.toString() !== req.user!.id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to edit this listing',
      });
      return;
    }

    // Update text fields
    const updatable = [
      'bookName',
      'price',
      'class',
      'subject',
      'condition',
      'description',
      'sellerName',
      'sellerPhone',
      'sellerAddress',
    ];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        (book as any)[field] = req.body[field];
      }
    });

    // Handle new images upload
    const files = req.files as MulterFile[] | undefined;
    if (files && files.length > 0) {
      // Delete old images from Cloudinary
      for (const img of book.images) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (e: any) {
          console.warn('Cloudinary delete failed:', e.message);
        }
      }
      // Replace with new images
      book.images = files.map((f) => ({
        url: f.path,
        publicId: f.filename,
      }));
    }

    await book.save();
    res.json({ success: true, book });
  } catch (err: any) {
    console.error('Update book error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error',
    });
  }
};

/**
 * @desc    Mark book as sold (hides from Buy page)
 * @route   PATCH /api/books/:id/sold
 * @access  Private (Owner only)
 */
export const markBookSold = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    if (book.userId.toString() !== req.user!.id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    book.status = 'Sold';
    book.soldDate = new Date();
    await book.save();

    res.json({ success: true, book });
  } catch (err: any) {
    console.error('Mark sold error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Relist a sold book (makes it available again)
 * @route   PATCH /api/books/:id/relist
 * @access  Private (Owner only)
 */
export const relistBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    if (book.userId.toString() !== req.user!.id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    book.status = 'Available';
    book.soldDate = null;
    await book.save();

    res.json({ success: true, book });
  } catch (err: any) {
    console.error('Relist error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Permanently delete a book listing
 * @route   DELETE /api/books/:id
 * @access  Private (Owner only)
 */
export const deleteBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    if (book.userId.toString() !== req.user!.id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Delete images from Cloudinary
    for (const img of book.images) {
      try {
        await cloudinary.uploader.destroy(img.publicId);
      } catch (e: any) {
        console.warn('Cloudinary delete failed:', e.message);
      }
    }

    await book.deleteOne();
    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (err: any) {
    console.error('Delete book error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};