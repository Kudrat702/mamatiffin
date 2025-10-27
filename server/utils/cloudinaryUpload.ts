import cloudinary from '../config/cloudinary.config';
import { UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

interface UploadOptions {
  folder: string;
  publicId?: string;
}

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  options: UploadOptions
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as UploadApiResponse);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export const getCloudinaryUrl = (publicId: string, transformations?: any): string => {
  return cloudinary.url(publicId, transformations);
};