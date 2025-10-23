import axios, { type InternalAxiosRequestConfig } from 'axios';

// ✅ DYNAMIC API BASE URL - NO EXTERNAL IMPORT NEEDED
const getApiBaseUrl = (): string => {
  // Current environment check
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  if (isDevelopment) {
    // Development: hamesha localhost:3000 use karo regardless of frontend origin
    return 'http://localhost:3000';
  } else {
    // Production: your actual production URL
    return process.env.REACT_APP_API_URL || 'https://your-production-api.com';
  }
};

// ✅ DEBUG: Current frontend origin log karo
console.log('🌐 Frontend Origin:', window.location.origin);
console.log('🔗 API Base URL:', getApiBaseUrl());

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(), // ✅ Dynamic URL
  withCredentials: true,     // ✅ CORS credentials important
  timeout: 10000,           // ✅ Timeout add kiya
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ ENHANCED REQUEST INTERCEPTOR with DEBUG (Fixed TypeScript types)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Debug information with null checks
  console.log('🚀 API Request Debug:', {
    method: config.method?.toUpperCase(),
    url: config.url || '',
    fullURL: (config.baseURL || '') + (config.url || ''),
    frontendOrigin: window.location.origin,
    withCredentials: config.withCredentials
  });
  
  // Add auth token
  const token = localStorage.getItem('ADMIN_TOKEN');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// ✅ ENHANCED RESPONSE INTERCEPTOR with CORS ERROR HANDLING
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      status: response.status,
      url: response.config.url || '',
      corsHeaders: {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials']
      }
    });
    return response;
  },
  (error) => {
    // Enhanced error logging with null checks
    console.error('❌ API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url || '',
      fullURL: (error.config?.baseURL || '') + (error.config?.url || ''),
      frontendOrigin: window.location.origin,
      errorCode: error.code
    });
    
    // CORS specific error handling
    if (error.code === 'ERR_NETWORK') {
      console.error('🚨 CORS/Network Error Details:');
      console.error('- Frontend Origin:', window.location.origin);
      console.error('- Request URL:', (error.config?.baseURL || '') + (error.config?.url || ''));
      console.error('- Expected Origin: http://admin.localhost:5173 (for admin) or http://localhost:5173 (for user)');
      console.error('- Suggestion: Check if you are accessing the correct URL');
    }
    
    // Token handling
    if (error.response?.status === 401) {
      localStorage.removeItem('ADMIN_TOKEN');
      if (window.location.pathname.includes('/super-admin')) {
        window.location.href = '/admin-login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Interface definitions (unchanged)
export interface ReviewSubmissionData {
  userName: string;
  rating: number;
  comment: string;
}

export interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  isActive: boolean;
  isApproved: boolean;
  submittedAt?: string;
  approvedAt?: string;
  createdAt?: string;
  date?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  reviews?: Review[];
  review?: Review;
  token?: string;
}

// ✅ ENHANCED API FUNCTIONS with better error handling
export const submitReview = async (reviewData: ReviewSubmissionData): Promise<ApiResponse<Review>> => {
  try {
    const response = await api.post<ApiResponse<Review>>('/api/reviews/submit', reviewData);
    return response.data;
  } catch (error) {
    console.error('Submit Review Error:', error);
    throw error;
  }
};

export const getPublicReviews = async (): Promise<ApiResponse<Review[]>> => {
  try {
    const response = await api.get<ApiResponse<Review[]>>('/api/reviews/public');
    return response.data;
  } catch (error) {
    console.error('Get Public Reviews Error:', error);
    throw error;
  }
};

// ✅ ADMIN LOGIN with enhanced debugging
export const adminLogin = async (password: string): Promise<ApiResponse<{ token: string }>> => {
  try {
    console.log('🔐 Admin Login Attempt from:', window.location.origin);
    const response = await api.post<ApiResponse<{ token: string }>>('/admin-auth', { password });
    console.log('✅ Admin Login Success');
    return response.data;
  } catch (error) {
    console.error('❌ Admin Login Error:', error);
    throw error;
  }
};

export const getAllReviews = async (): Promise<ApiResponse<Review[]>> => {
  try {
    const response = await api.get<ApiResponse<Review[]>>('/api/admin/reviews');
    return response.data;
  } catch (error) {
    console.error('Get All Reviews Error:', error);
    throw error;
  }
};

export const approveReview = async (reviewId: string): Promise<ApiResponse<Review>> => {
  try {
    const response = await api.put<ApiResponse<Review>>(`/api/reviews/approve/${reviewId}`, { isActive: true });
    return response.data;
  } catch (error) {
    console.error('Approve Review Error:', error);
    throw error;
  }
};

export const addReviewAsAdmin = async (reviewData: ReviewSubmissionData): Promise<ApiResponse<Review>> => {
  try {
    const response = await api.post<ApiResponse<Review>>('/api/admin/reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Add Review as Admin Error:', error);
    throw error;
  }
};

// Utility functions (unchanged)
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('ADMIN_TOKEN');
  return !!token;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('ADMIN_TOKEN');
};

export default api;