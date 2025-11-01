// utils/cloudinaryUpload.ts - CLOUDINARY UTILITY
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('☁️ Cloudinary configured:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
  apiKey: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
  apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌',
});

// ============================================
// UPLOAD OPTIONS INTERFACE
// ============================================
interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

// ============================================
// UPLOAD TO CLOUDINARY
// ============================================
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  options: UploadOptions = {}
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const {
      folder = 'general',
      publicId,
      transformation,
      resource_type = 'image'
    } = options;

    const uploadOptions: any = {
      folder: folder,
      resource_type: resource_type,
      transformation: transformation || [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('☁️ Cloudinary upload success:', result?.public_id);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// ============================================
// DELETE FROM CLOUDINARY
// ============================================
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result === 'ok') {
      console.log('☁️ Cloudinary delete success:', publicId);
      return { success: true, result };
    } else if (result.result === 'not found') {
      console.warn('⚠️ Cloudinary: Image not found:', publicId);
      return { success: false, error: 'not_found' };
    } else {
      console.warn('⚠️ Cloudinary delete failed:', result);
      return { success: false, result };
    }
  } catch (error: any) {
    console.error('❌ Cloudinary delete error:', error.message);
    throw error;
  }
};

// ============================================
// GET IMAGE URL (with transformations)
// ============================================
export const getCloudinaryUrl = (
  publicId: string,
  transformations?: any
): string => {
  if (!publicId) return '';

  try {
    return cloudinary.url(publicId, {
      transformation: transformations || [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      secure: true
    });
  } catch (error) {
    console.error('❌ Error generating Cloudinary URL:', error);
    return '';
  }
};

// ============================================
// BULK DELETE
// ============================================
export const bulkDeleteFromCloudinary = async (
  publicIds: string[],
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<any> => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });

    console.log(`☁️ Cloudinary bulk delete: ${publicIds.length} items`);
    return result;
  } catch (error: any) {
    console.error('❌ Cloudinary bulk delete error:', error.message);
    throw error;
  }
};

// ============================================
// GET IMAGE INFO
// ============================================
export const getCloudinaryImageInfo = async (
  publicId: string
): Promise<any> => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image'
    });
    return result;
  } catch (error: any) {
    console.error('❌ Error fetching image info:', error.message);
    throw error;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  getCloudinaryUrl,
  bulkDeleteFromCloudinary,
  getCloudinaryImageInfo
};