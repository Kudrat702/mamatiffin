export interface SliderImage {
  _id: string;
  title: string;
  alt: string;
  src: string;
  imagePublicId?: string;
  dataAiHint?: string | undefined;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface SliderImageResponse {
  success: boolean;
  message: string;
  data?: SliderImage | SliderImage[] | undefined;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string | undefined;
}