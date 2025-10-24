// import axios, { type InternalAxiosRequestConfig } from 'axios';

// // ✅ DYNAMIC API BASE URL - NO EXTERNAL IMPORT NEEDED
// const getApiBaseUrl = (): string => {
//   // Current environment check
//   const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
//   if (isDevelopment) {
//     // Development: hamesha localhost:3000 use karo regardless of frontend origin
//     return 'http://localhost:3000';
//   } else {
//     // Production: your actual production URL
//     return process.env.REACT_APP_API_URL || 'https://your-production-api.com';
//   }
// };

// // ✅ DEBUG: Current frontend origin log karo
// console.log('🌐 Frontend Origin:', window.location.origin);
// console.log('🔗 API Base URL:', getApiBaseUrl());

// // Create axios instance with base configuration
// const api = axios.create({
//   baseURL: getApiBaseUrl(), // ✅ Dynamic URL
//   withCredentials: true,     // ✅ CORS credentials important
//   timeout: 10000,           // ✅ Timeout add kiya
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // ✅ ENHANCED REQUEST INTERCEPTOR with DEBUG (Fixed TypeScript types)
// api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
//   // Debug information with null checks
//   console.log('🚀 API Request Debug:', {
//     method: config.method?.toUpperCase(),
//     url: config.url || '',
//     fullURL: (config.baseURL || '') + (config.url || ''),
//     frontendOrigin: window.location.origin,
//     withCredentials: config.withCredentials
//   });
  
//   // Add auth token
//   const token = localStorage.getItem('ADMIN_TOKEN');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
  
//   return config;
// });

// // ✅ ENHANCED RESPONSE INTERCEPTOR with CORS ERROR HANDLING
// api.interceptors.response.use(
//   (response) => {
//     console.log('✅ API Response Success:', {
//       status: response.status,
//       url: response.config.url || '',
//       corsHeaders: {
//         'access-control-allow-origin': response.headers['access-control-allow-origin'],
//         'access-control-allow-credentials': response.headers['access-control-allow-credentials']
//       }
//     });
//     return response;
//   },
//   (error) => {
//     // Enhanced error logging with null checks
//     console.error('❌ API Error:', {
//       message: error.message,
//       status: error.response?.status,
//       url: error.config?.url || '',
//       fullURL: (error.config?.baseURL || '') + (error.config?.url || ''),
//       frontendOrigin: window.location.origin,
//       errorCode: error.code
//     });
    
//     // CORS specific error handling
//     if (error.code === 'ERR_NETWORK') {
//       console.error('🚨 CORS/Network Error Details:');
//       console.error('- Frontend Origin:', window.location.origin);
//       console.error('- Request URL:', (error.config?.baseURL || '') + (error.config?.url || ''));
//       console.error('- Expected Origin: http://admin.localhost:5173 (for admin) or http://localhost:5173 (for user)');
//       console.error('- Suggestion: Check if you are accessing the correct URL');
//     }
    
//     // Token handling
//     if (error.response?.status === 401) {
//       localStorage.removeItem('ADMIN_TOKEN');
//       if (window.location.pathname.includes('/super-admin')) {
//         window.location.href = '/admin-login';
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// // Interface definitions (unchanged)
// export interface ReviewSubmissionData {
//   userName: string;
//   rating: number;
//   comment: string;
// }

// export interface Review {
//   _id: string;
//   userName: string;
//   rating: number;
//   comment: string;
//   isActive: boolean;
//   isApproved: boolean;
//   submittedAt?: string;
//   approvedAt?: string;
//   createdAt?: string;
//   date?: string;
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message?: string;
//   data?: T;
//   reviews?: Review[];
//   review?: Review;
//   token?: string;
// }

// // ✅ ENHANCED API FUNCTIONS with better error handling
// export const submitReview = async (reviewData: ReviewSubmissionData): Promise<ApiResponse<Review>> => {
//   try {
//     const response = await api.post<ApiResponse<Review>>('/api/reviews/submit', reviewData);
//     return response.data;
//   } catch (error) {
//     console.error('Submit Review Error:', error);
//     throw error;
//   }
// };

// export const getPublicReviews = async (): Promise<ApiResponse<Review[]>> => {
//   try {
//     const response = await api.get<ApiResponse<Review[]>>('/api/reviews/public');
//     return response.data;
//   } catch (error) {
//     console.error('Get Public Reviews Error:', error);
//     throw error;
//   }
// };

// // ✅ ADMIN LOGIN with enhanced debugging
// export const adminLogin = async (password: string): Promise<ApiResponse<{ token: string }>> => {
//   try {
//     console.log('🔐 Admin Login Attempt from:', window.location.origin);
//     const response = await api.post<ApiResponse<{ token: string }>>('/admin-auth', { password });
//     console.log('✅ Admin Login Success');
//     return response.data;
//   } catch (error) {
//     console.error('❌ Admin Login Error:', error);
//     throw error;
//   }
// };

// export const getAllReviews = async (): Promise<ApiResponse<Review[]>> => {
//   try {
//     const response = await api.get<ApiResponse<Review[]>>('/api/admin/reviews');
//     return response.data;
//   } catch (error) {
//     console.error('Get All Reviews Error:', error);
//     throw error;
//   }
// };

// export const approveReview = async (reviewId: string): Promise<ApiResponse<Review>> => {
//   try {
//     const response = await api.put<ApiResponse<Review>>(`/api/reviews/approve/${reviewId}`, { isActive: true });
//     return response.data;
//   } catch (error) {
//     console.error('Approve Review Error:', error);
//     throw error;
//   }
// };

// export const addReviewAsAdmin = async (reviewData: ReviewSubmissionData): Promise<ApiResponse<Review>> => {
//   try {
//     const response = await api.post<ApiResponse<Review>>('/api/admin/reviews', reviewData);
//     return response.data;
//   } catch (error) {
//     console.error('Add Review as Admin Error:', error);
//     throw error;
//   }
// };

// // Utility functions (unchanged)
// export const isAuthenticated = (): boolean => {
//   const token = localStorage.getItem('ADMIN_TOKEN');
//   return !!token;
// };

// export const getAuthToken = (): string | null => {
//   return localStorage.getItem('ADMIN_TOKEN');
// };

// export default api;

import axios, { type InternalAxiosRequestConfig } from 'axios';

// ✅ PRODUCTION-READY DYNAMIC API BASE URL
const getApiBaseUrl = (): string => {
  // Check environment
  const isDevelopment = 
    import.meta.env.DEV || 
    import.meta.env.MODE === 'development' ||
    process.env.NODE_ENV === 'development';
  
  console.log('🔧 Environment Check:', {
    isDevelopment,
    mode: import.meta.env.MODE,
    nodeEnv: process.env.NODE_ENV
  });
  
  // Priority 1: Environment Variable (Highest Priority)
  if (import.meta.env.VITE_API_URL) {
    console.log('✅ Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  if (process.env.REACT_APP_API_URL) {
    console.log('✅ Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Priority 2: Environment-based defaults
  if (isDevelopment) {
    console.log('✅ Using Development URL: http://localhost:3000');
    return 'http://localhost:3000';
  } else {
    // ⚠️ CRITICAL: Replace with your actual Railway backend URL
    const productionUrl = 'https://mamatiffin-production.up.railway.app';
    console.log('✅ Using Production URL:', productionUrl);
    return productionUrl;
  }
};

// ✅ DEBUG: Current configuration
console.log('🌐 Axios API Configuration:');
console.log('- Frontend Origin:', window.location.origin);
console.log('- API Base URL:', getApiBaseUrl());
console.log('- Environment:', import.meta.env.MODE || process.env.NODE_ENV);

// ✅ CREATE AXIOS INSTANCE with enhanced configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,  // Important for CORS with cookies
  timeout: 30000,         // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ ENHANCED REQUEST INTERCEPTOR with better debugging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Debug information
    console.log('🚀 Making API Request:', {
      method: config.method?.toUpperCase() || 'GET',
      url: config.url || '',
      fullURL: `${config.baseURL || ''}${config.url || ''}`,
      frontendOrigin: window.location.origin,
      withCredentials: config.withCredentials,
      hasAuthToken: !!localStorage.getItem('ADMIN_TOKEN')
    });
    
    // Add authentication token if available
    const token = localStorage.getItem('ADMIN_TOKEN');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Auth token added to request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ✅ ENHANCED RESPONSE INTERCEPTOR with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url || '',
      dataReceived: !!response.data,
      corsHeaders: {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials']
      }
    });
    return response;
  },
  (error) => {
    // Comprehensive error logging
    console.error('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url || '',
      fullURL: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      frontendOrigin: window.location.origin,
      responseData: error.response?.data
    });
    
    // ⚠️ CORS/Network Error Handling
    if (error.code === 'ERR_NETWORK') {
      console.error('🚨 NETWORK/CORS ERROR DETECTED:');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('📍 Frontend Origin:', window.location.origin);
      console.error('🎯 Request URL:', `${error.config?.baseURL || ''}${error.config?.url || ''}`);
      console.error('💡 Possible Causes:');
      console.error('   1. Backend server is down');
      console.error('   2. CORS not configured correctly on backend');
      console.error('   3. Wrong API URL in environment variables');
      console.error('   4. Network connectivity issue');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // User-friendly error
      return Promise.reject({
        ...error,
        userMessage: 'Unable to connect to server. Please check your connection.'
      });
    }
    
    // ⚠️ 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized (401) - Clearing auth token');
      localStorage.removeItem('ADMIN_TOKEN');
      
      // Redirect to login if on admin pages
      if (window.location.pathname.includes('/super-admin') || 
          window.location.pathname.includes('/admin')) {
        console.log('🔄 Redirecting to admin login...');
        window.location.href = '/admin-login';
      }
    }
    
    // ⚠️ 403 Forbidden - CORS policy violation
    if (error.response?.status === 403) {
      console.error('🚨 CORS Policy Violation (403):');
      console.error('- Frontend:', window.location.origin);
      console.error('- Backend:', error.config?.baseURL);
      console.error('- Make sure backend CORS allows this origin');
    }
    
    // ⚠️ 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 Endpoint Not Found (404):', error.config?.url);
    }
    
    // ⚠️ 500 Server Error
    if (error.response?.status === 500) {
      console.error('💥 Server Error (500):', error.response?.data?.message);
    }
    
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════════════════════
// INTERFACE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════════════════
// API FUNCTIONS - REVIEWS
// ════════════════════════════════════════════════════════════════════════

export const submitReview = async (
  reviewData: ReviewSubmissionData
): Promise<ApiResponse<Review>> => {
  try {
    console.log('📝 Submitting review...', reviewData);
    const response = await api.post<ApiResponse<Review>>(
      '/api/reviews/submit', 
      reviewData
    );
    console.log('✅ Review submitted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Submit Review Error:', error);
    throw error;
  }
};

export const getPublicReviews = async (): Promise<ApiResponse<Review[]>> => {
  try {
    console.log('🔄 Fetching public reviews...');
    const response = await api.get<ApiResponse<Review[]>>('/api/reviews/public');
    console.log('✅ Public reviews fetched:', response.data.reviews?.length || 0);
    return response.data;
  } catch (error) {
    console.error('❌ Get Public Reviews Error:', error);
    throw error;
  }
};

export const getAllReviews = async (): Promise<ApiResponse<Review[]>> => {
  try {
    console.log('🔄 Fetching all reviews (admin)...');
    const response = await api.get<ApiResponse<Review[]>>('/api/admin/reviews');
    console.log('✅ All reviews fetched:', response.data.reviews?.length || 0);
    return response.data;
  } catch (error) {
    console.error('❌ Get All Reviews Error:', error);
    throw error;
  }
};

export const approveReview = async (reviewId: string): Promise<ApiResponse<Review>> => {
  try {
    console.log('✔️ Approving review:', reviewId);
    const response = await api.put<ApiResponse<Review>>(
      `/api/reviews/approve/${reviewId}`, 
      { isActive: true }
    );
    console.log('✅ Review approved successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Approve Review Error:', error);
    throw error;
  }
};

export const addReviewAsAdmin = async (
  reviewData: ReviewSubmissionData
): Promise<ApiResponse<Review>> => {
  try {
    console.log('➕ Adding review as admin...', reviewData);
    const response = await api.post<ApiResponse<Review>>(
      '/api/admin/reviews', 
      reviewData
    );
    console.log('✅ Review added by admin successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Add Review as Admin Error:', error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════════════
// ADMIN AUTHENTICATION
// ════════════════════════════════════════════════════════════════════════

export const adminLogin = async (
  password: string
): Promise<ApiResponse<{ token: string }>> => {
  try {
    console.log('🔐 Admin Login Attempt:');
    console.log('- From Origin:', window.location.origin);
    console.log('- To Backend:', getApiBaseUrl());
    
    const response = await api.post<ApiResponse<{ token: string }>>(
      '/admin-auth', 
      { password }
    );
    
    console.log('✅ Admin Login Successful');
    
    // Store token
    if (response.data.token) {
      localStorage.setItem('ADMIN_TOKEN', response.data.token);
      console.log('💾 Auth token stored');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Admin Login Failed:', error);
    throw error;
  }
};

// ════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('ADMIN_TOKEN');
  const hasToken = !!token;
  console.log('🔐 Auth Check:', hasToken ? 'Authenticated' : 'Not Authenticated');
  return hasToken;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('ADMIN_TOKEN');
};

export const logout = (): void => {
  console.log('👋 Logging out...');
  localStorage.removeItem('ADMIN_TOKEN');
  console.log('✅ Auth token cleared');
};

// ✅ TEST API CONNECTION
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/api/health');
    console.log('✅ API Connection: OK', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Connection: FAILED', error);
    return false;
  }
};

export default api;