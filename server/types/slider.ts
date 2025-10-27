export interface SliderImage {
  _id?: string;
  title: string;
  alt: string;
  src: string;
  imagePublicId?: string;  // NEW: Added for Cloudinary
  dataAiHint?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SliderImageResponse {
  success: boolean;
  message: string;
  data?: SliderImage | SliderImage[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    filename: string;
    path: string;
    url: string;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}