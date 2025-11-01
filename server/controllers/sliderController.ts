import { Request, Response } from 'express';
import SliderImage from '../models/SliderImage';
import { SliderImageResponse } from '../types/slider';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload';
import Joi from 'joi';

// ✅ Check if Cloudinary is configured (works in both dev and prod)
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET
);

console.log('🌐 Cloudinary Status:', useCloudinary ? '✅ ENABLED' : '❌ DISABLED');
if (useCloudinary) {
  console.log('☁️ Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
}

// Validation schema
const sliderImageSchema = Joi.object({
  title: Joi.string().required().max(100),
  alt: Joi.string().required().max(200),
  dataAiHint: Joi.string().optional().max(50),
  isActive: Joi.boolean().default(true),
  order: Joi.number().default(0)
});

// Helper function to delete image (Cloudinary or local)
const deleteSliderImageFile = async (imageUrl: string, imagePublicId?: string): Promise<boolean> => {
  try {
    if (useCloudinary && imagePublicId) {
      await deleteFromCloudinary(imagePublicId);
      console.log('✅ Slider image deleted from Cloudinary:', imagePublicId);
      return true;
    }
    console.log('ℹ️ Local file deletion skipped');
    return false;
  } catch (error) {
    console.error('❌ Error deleting slider image:', error);
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
    console.error('❌ Error fetching slider images:', error);
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
    console.error('❌ Error fetching all slider images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slider images'
    });
  }
};

// Create new slider image
export const createSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📤 Creating slider image...');
    console.log('🌐 Using Cloudinary:', useCloudinary ? 'YES' : 'NO');
    
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

    let imageUrl = '';
    let imagePublicId = '';

    if (useCloudinary) {
      // Upload to Cloudinary
      console.log('☁️ Uploading to Cloudinary...');
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'slider-images',
        publicId: `slider-${Date.now()}`
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
      console.log('✅ Cloudinary URL:', imageUrl);
      console.log('✅ Public ID:', imagePublicId);
    } else {
      // Local development
      imageUrl = `/uploads/slider-images/${req.file.filename}`;
      console.log('💾 Local URL:', imageUrl);
    }

    // Create new slider image
    const sliderData: any = {
      ...value,
      src: imageUrl
    };

    // Add imagePublicId if using Cloudinary
    if (imagePublicId) {
      sliderData.imagePublicId = imagePublicId;
      console.log('✅ Adding imagePublicId to database:', imagePublicId);
    }

    const newImage = new SliderImage(sliderData);
    const savedImage = await newImage.save();

    console.log('✅ Saved to database with ID:', savedImage._id);
    console.log('📊 Database entry:', {
      title: savedImage.title,
      src: savedImage.src,
      imagePublicId: savedImage.imagePublicId
    });

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
    console.error('❌ Error creating slider image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create slider image',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update slider image
export const updateSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📝 Updating slider image...');
    
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

    const updateData: any = { ...value };

    // If new file uploaded, update src
    if (req.file) {
      console.log('📤 New file detected, uploading...');
      
      // Get old image to delete it
      const oldImage = await SliderImage.findById(id);
      if (oldImage && oldImage.src) {
        await deleteSliderImageFile(oldImage.src, oldImage.imagePublicId);
      }

      // Upload new image
      if (useCloudinary) {
        console.log('☁️ Uploading to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'slider-images',
          publicId: `slider-${Date.now()}`
        });
        updateData.src = result.secure_url;
        updateData.imagePublicId = result.public_id;
        console.log('✅ New Cloudinary URL:', updateData.src);
      } else {
        updateData.src = `/uploads/slider-images/${req.file.filename}`;
        console.log('💾 New local URL:', updateData.src);
      }
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

    console.log('✅ Updated successfully:', updatedImage._id);

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
    console.error('❌ Error updating slider image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update slider image'
    });
  }
};

// Delete slider image
export const deleteSliderImage = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🗑️ Deleting slider image...');
    
    const { id } = req.params;

    const image = await SliderImage.findById(id);
    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Slider image not found'
      });
      return;
    }

    // Delete image file
    if (image.src) {
      await deleteSliderImageFile(image.src, image.imagePublicId);
    }

    await SliderImage.findByIdAndDelete(id);

    console.log('✅ Deleted successfully:', id);

    res.status(200).json({
      success: true,
      message: 'Slider image deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting slider image:', error);
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

    console.log('✅ Status toggled:', updatedImage.isActive ? 'ACTIVE' : 'INACTIVE');

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
    console.error('❌ Error toggling slider image status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle slider image status'
    });
  }
};