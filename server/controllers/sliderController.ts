import { Request, Response } from 'express';
import SliderImage from '../models/SliderImage';
import { SliderImageResponse } from '../types/slider';
import Joi from 'joi';
import fs from 'fs';
import path from 'path';

// FIXED: Define upload directory
const uploadDir = path.join(__dirname, '../uploads/slider-images');

// Ensure slider-images directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Slider images directory created:', uploadDir);
}

// Validation schema
const sliderImageSchema = Joi.object({
  title: Joi.string().required().max(100),
  alt: Joi.string().required().max(200),
  dataAiHint: Joi.string().optional().max(50),
  isActive: Joi.boolean().default(true),
  order: Joi.number().default(0)
});

// FIXED: Helper function to delete image file
const deleteSliderImageFile = (imageUrl: string): boolean => {
  try {
    if (imageUrl && imageUrl.includes('/uploads/slider-images/')) {
      const filename = imageUrl.split('/uploads/slider-images/')[1];
      if (filename) {
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Slider image file deleted:', filename);
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error deleting slider image file:', error);
    return false;
  }
};

// Get all active slider images
export const getSliderImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const images = await SliderImage.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');

    const response: SliderImageResponse = {
      success: true,
      message: 'Slider images retrieved successfully',
      data: images.map(img => ({
        ...img.toObject(),
        _id: String(img._id)
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching slider images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slider images'
    });
  }
};

// Get all slider images (admin)
export const getAllSliderImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const images = await SliderImage.find()
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');

    const response: SliderImageResponse = {
      success: true,
      message: 'All slider images retrieved successfully',
      data: images.map(img => ({
        ...img.toObject(),
        _id: String(img._id)
      }))
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching all slider images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slider images'
    });
  }
};

// Create new slider image
export const createSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = sliderImageSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
      return;
    }

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
      return;
    }

    // FIXED: Create image URL
    const imageUrl = `/uploads/slider-images/${req.file.filename}`;

    // Create new slider image
    const newImage = new SliderImage({
      ...value,
      src: imageUrl
    });

    const savedImage = await newImage.save();

    const response: SliderImageResponse = {
      success: true,
      message: 'Slider image created successfully',
      data: {
        ...savedImage.toObject(),
        _id: String(savedImage._id)
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating slider image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create slider image'
    });
  }
};

// Update slider image
export const updateSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = sliderImageSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.details[0].message
      });
      return;
    }

    const updateData = { ...value };

    // If new file uploaded, update src
    if (req.file) {
      // Get old image to delete it
      const oldImage = await SliderImage.findById(id);
      if (oldImage && oldImage.src) {
        // FIXED: Delete old image properly
        deleteSliderImageFile(oldImage.src);
      }
      // FIXED: Set new image URL
      updateData.src = `/uploads/slider-images/${req.file.filename}`;
    }

    const updatedImage = await SliderImage.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedImage) {
      res.status(404).json({
        success: false,
        message: 'Slider image not found'
      });
      return;
    }

    const response: SliderImageResponse = {
      success: true,
      message: 'Slider image updated successfully',
      data: {
        ...updatedImage.toObject(),
        _id: String(updatedImage._id)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating slider image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update slider image'
    });
  }
};

// Delete slider image
export const deleteSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const image = await SliderImage.findById(id);
    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Slider image not found'
      });
      return;
    }

    // FIXED: Delete image file if it exists
    if (image.src) {
      deleteSliderImageFile(image.src);
    }

    await SliderImage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Slider image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slider image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete slider image'
    });
  }
};

// Toggle active status
export const toggleSliderImageStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const image = await SliderImage.findById(id);
    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Slider image not found'
      });
      return;
    }

    image.isActive = !image.isActive;
    const updatedImage = await image.save();

    const response: SliderImageResponse = {
      success: true,
      message: `Slider image ${updatedImage.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        ...updatedImage.toObject(),
        _id: String(updatedImage._id)
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error toggling slider image status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle slider image status'
    });
  }
};