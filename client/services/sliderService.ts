import axios from 'axios';
import { API_BASE_URL } from '../src/configapi/api';
import { SliderImage, SliderImageResponse } from '../src/types/slider';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const sliderService = {
  // Get all active slider images
  getSliderImages: async (): Promise<SliderImage[]> => {
    try {
      const response = await api.get<SliderImageResponse>('/api/slider');
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching slider images:', error);
      throw error;
    }
  },

  // Get all slider images (admin)
  getAllSliderImages: async (): Promise<SliderImage[]> => {
    try {
      const response = await api.get<SliderImageResponse>('/api/slider/admin');
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching all slider images:', error);
      throw error;
    }
  },

  // Create new slider image
  createSliderImage: async (formData: FormData): Promise<SliderImage> => {
    try {
      const response = await api.post<SliderImageResponse>('/api/slider/admin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success && response.data.data) {
        return response.data.data as SliderImage;
      }
      throw new Error('Failed to create slider image');
    } catch (error) {
      console.error('Error creating slider image:', error);
      throw error;
    }
  },

  // Update slider image
  updateSliderImage: async (id: string, formData: FormData): Promise<SliderImage> => {
    try {
      const response = await api.put<SliderImageResponse>(`/api/slider/admin/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success && response.data.data) {
        return response.data.data as SliderImage;
      }
      throw new Error('Failed to update slider image');
    } catch (error) {
      console.error('Error updating slider image:', error);
      throw error;
    }
  },

  // Delete slider image
  deleteSliderImage: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<SliderImageResponse>(`/api/slider/admin/${id}`);
      if (!response.data.success) {
        throw new Error('Failed to delete slider image');
      }
    } catch (error) {
      console.error('Error deleting slider image:', error);
      throw error;
    }
  },

  // Toggle slider image status
  toggleSliderImageStatus: async (id: string): Promise<SliderImage> => {
    try {
      const response = await api.patch<SliderImageResponse>(`/api/slider/admin/${id}/toggle`);
      if (response.data.success && response.data.data) {
        return response.data.data as SliderImage;
      }
      throw new Error('Failed to toggle slider image status');
    } catch (error) {
      console.error('Error toggling slider image status:', error);
      throw error;
    }
  }
};