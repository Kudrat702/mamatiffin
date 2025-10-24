// // src/configapi/api.ts - FIXED API Configuration with Proper Types

// // ===== TYPE DEFINITIONS =====
// export interface MenuDetail {
//   id: string;
//   menuType: string;
//   category: 'veg' | 'non-veg';
//   name: string;
//   description?: string;
//   price?: number;
//   image?: string;
//   isAvailable?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface ApiResponse<T = unknown> {
//   success: boolean;
//   message?: string;
//   data?: T;
// }

// const getApiBaseUrl = (): string => {
//   const currentOrigin = window.location.origin;
//   console.log('Current Frontend Origin:', currentOrigin);
  
//   if (import.meta.env.VITE_API_URL) {
//     console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
//     return import.meta.env.VITE_API_URL;
//   }
  
//   if (process.env.REACT_APP_API_URL) {
//     console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
//     return process.env.REACT_APP_API_URL;
//   }
  
//   if (process.env.NODE_ENV === 'production') {
//     return 'https://your-production-api.com';
//   }
  
//   const apiUrl = 'http://localhost:3000';
//   console.log('Using fallback API URL:', apiUrl);
//   console.log('Make sure server CORS allows:', currentOrigin);
  
//   return apiUrl;
// };

// export const API_BASE_URL = getApiBaseUrl();

// // Current setup debug
// console.log('API Configuration Debug:');
// console.log('- Frontend Origin:', window.location.origin);
// console.log('- API Base URL:', API_BASE_URL);
// console.log('- Environment:', process.env.NODE_ENV);

// // ===== HELPER TYPES =====
// export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
// export type RequestBody = Record<string, unknown> | undefined;

// // ===== HTTP HELPER FUNCTIONS =====
// const jsonHeaders = (token?: string): Record<string, string> => ({
//   'Content-Type': 'application/json',
//   ...(token ? { Authorization: `Bearer ${token}` } : {}),
// });

// // Public GET request
// export const getJSON = async <T = unknown>(url: string): Promise<T> => {
//   const res = await fetch(`${API_BASE_URL}/api${url}`);
//   const json = await res.json();
//   if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
//   return json.data || json;
// };

// // Authenticated GET request (Bearer token)
// export const getAuthJSON = async <T = unknown>(url: string, token: string): Promise<T> => {
//   const res = await fetch(`${API_BASE_URL}/api${url}`, {
//     headers: jsonHeaders(token),
//   });
//   const json = await res.json();
//   if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
//   return json.data || json;
// };

// // Public POST request
// export const postJSON = async <T = unknown>(url: string, data: RequestBody): Promise<T> => {
//   const res = await fetch(`${API_BASE_URL}/api${url}`, {
//     method: 'POST',
//     headers: jsonHeaders(),
//     body: JSON.stringify(data),
//   });
//   const json = await res.json();
//   if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
//   return json.data || json;
// };

// // Authenticated POST request (Bearer token)
// export const postAuthJSON = async <T = unknown>(url: string, data: RequestBody, token: string): Promise<T> => {
//   const res = await fetch(`${API_BASE_URL}/api${url}`, {
//     method: 'POST',
//     headers: jsonHeaders(token),
//     body: JSON.stringify(data),
//   });
//   const json = await res.json();
//   if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
//   return json.data || json;
// };

// // Generic HTTP request helper
// export const makeRequest = async <T = unknown>(
//   url: string, 
//   method: HttpMethod = 'GET', 
//   data?: RequestBody, 
//   token?: string
// ): Promise<T> => {
//   const res = await fetch(`${API_BASE_URL}/api${url}`, {
//     method,
//     headers: jsonHeaders(token),
//     ...(data ? { body: JSON.stringify(data) } : {}),
//   });
//   const json = await res.json();
//   if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
//   return json.data || json;
// };

// // ===== COMPLETE API ENDPOINTS CONFIGURATION =====
// export const apiEndpoints = {
  
//   // ===== AUTH ENDPOINTS =====
//   signin: `${API_BASE_URL}/api/auth/signin`,
//   signup: `${API_BASE_URL}/api/auth/signup`,
//   addressOptions: `${API_BASE_URL}/api/auth/address-options`,
//   usersBase: `${API_BASE_URL}/api/auth`,
  
//   // ===== ADMIN AUTH =====
//   adminAuth: `${API_BASE_URL}/admin-auth`,
  
//   // ===== MAIN MENU DETAILS ENDPOINTS - FIXED FOR MENU DETAILS SECTION =====
  
//   // FIXED: Frontend Menu Retrieval - Main endpoint for MenuDetailsPage
//   menuDetails: (diet: string, category: string): string => 
//     `${API_BASE_URL}/api/menus/${diet}/${category}`,
  
//   // FIXED: Admin Menu Operations - Main endpoints for AdminDashboard Menu Details Section
//   adminMenuDetails: `${API_BASE_URL}/api/admin/menu-details`,
//   adminMenu: (id?: string): string => {
//     if (id) {
//       return `${API_BASE_URL}/api/admin/menu/${id}`;
//     }
//     return `${API_BASE_URL}/api/admin/menu`;
//   },
  
//   // FIXED: Admin CRUD operations for Menu Details
//   adminCategoryMenu: (category: string, menuType: string): string => 
//     `${API_BASE_URL}/api/admin/${category}/${encodeURIComponent(menuType)}`,
  
//   adminDeleteMenu: (category: string, menuType: string): string => 
//     `${API_BASE_URL}/api/admin/${category}/${encodeURIComponent(menuType)}`,
  
//   // ===== MENU DETAILS DATABASE ENDPOINTS - CORRECT ROUTES =====
  
//   // VEG MENU DETAILS ENDPOINTS - Database se data fetch karne ke liye
//   vegMenus: `${API_BASE_URL}/api/veg-menus`,                    // GET all veg menus
//   vegMenusByCategory: (category: string): string => 
//     `${API_BASE_URL}/api/veg-menus/category/${encodeURIComponent(category)}`,  // GET veg menus by category
//   vegMenuDetails: `${API_BASE_URL}/api/veg-menu-details`,       // POST create/update veg menu
  
//   // NON-VEG MENU DETAILS ENDPOINTS - Database se data fetch karne ke liye  
//   nonVegMenus: `${API_BASE_URL}/api/non-veg-menus`,            // GET all non-veg menus
//   nonVegMenusByCategory: (category: string): string => 
//     `${API_BASE_URL}/api/non-veg-menus/category/${encodeURIComponent(category)}`, // GET non-veg menus by category
//   nonVegMenuDetails: `${API_BASE_URL}/api/non-veg-menu-details`, // POST create/update non-veg menu
  
//   // ===== IMAGE UPLOAD =====
//   uploadImage: `${API_BASE_URL}/api/upload-image`,
  
//   // ===== HEALTH CHECK =====
//   health: `${API_BASE_URL}/api/health`,
  
//   // ===== LOCATIONS =====
//   locations: `${API_BASE_URL}/api/locations`,
//   location: (id: string): string => `${API_BASE_URL}/api/locations/${id}`,
  
//   // ===== ORDER ENDPOINTS =====
//   orders: `${API_BASE_URL}/api/orders`,
//   orderStatistics: `${API_BASE_URL}/api/orders/statistics`,
//   newOrders: `${API_BASE_URL}/api/orders/new`,
//   oldOrders: `${API_BASE_URL}/api/orders/old`,
//   skipOrders: `${API_BASE_URL}/api/orders/skip-orders`,
//   finalDelivery: `${API_BASE_URL}/api/orders/final-delivery`,
//   exportFinalDelivery: `${API_BASE_URL}/api/orders/export-final-delivery`,
  
//   ordersByType: (type: string): string => {
//     switch(type) {
//       case 'new':
//         return `${API_BASE_URL}/api/orders/new`;
//       case 'old':
//         return `${API_BASE_URL}/api/orders/old`;
//       default:
//         return `${API_BASE_URL}/api/orders`;
//     }
//   },
  
//   orderStatus: (id: string): string => `${API_BASE_URL}/api/orders/${id}/status`,
//   customerOrders: (phone: string): string => `${API_BASE_URL}/api/orders/customer/${phone}`,
//   orderById: (id: string): string => `${API_BASE_URL}/api/orders/${id}`,
//   ordersNew: `${API_BASE_URL}/api/orders/new`,
//   ordersOld: `${API_BASE_URL}/api/orders/old`,
  
//   // ===== REMOVED CATALOG ENDPOINTS (As per requirement) =====
//   // vegCatalog: `${API_BASE_URL}/api/veg/catalog`,
//   // vegCatalogByCategory: (category: string): string => 
//   //   `${API_BASE_URL}/api/veg/catalog/category/${encodeURIComponent(category)}`,
//   // nonVegCatalog: `${API_BASE_URL}/api/non-veg/catalog`,
//   // nonVegCatalogByCategory: (category: string): string => 
//   //   `${API_BASE_URL}/api/non-veg/catalog/category/${encodeURIComponent(category)}`,
  
//   // ===== PAYMENTS SECTION =====
//   createPayment: `${API_BASE_URL}/api/payments/create-order`,
//   verifyPayment: `${API_BASE_URL}/api/payments/verify`,
//   paymentStatus: (orderId: string): string => `${API_BASE_URL}/api/payments/status/${orderId}`,
//   paymentHistory: (userId: string): string => `${API_BASE_URL}/api/payments/history/${userId}`,
//   paymentRefund: (paymentId: string): string => `${API_BASE_URL}/api/payments/refund/${paymentId}`,
//   paymentWebhook: `${API_BASE_URL}/api/payments/webhook`,
//   paymentMethods: `${API_BASE_URL}/api/payments/methods`,
//   paymentSettings: `${API_BASE_URL}/api/payments/settings`,
//   subscriptionPayments: `${API_BASE_URL}/api/payments/subscriptions`,
//   subscriptionCancel: (subscriptionId: string): string => 
//     `${API_BASE_URL}/api/payments/subscriptions/${subscriptionId}/cancel`,
//   subscriptionRenew: (subscriptionId: string): string => 
//     `${API_BASE_URL}/api/payments/subscriptions/${subscriptionId}/renew`,
//   paymentAnalytics: `${API_BASE_URL}/api/payments/analytics`,
//   paymentReports: (type: string): string => `${API_BASE_URL}/api/payments/reports/${type}`,
//   paymentExport: (format: string): string => `${API_BASE_URL}/api/payments/export/${format}`,
  
//   // ===== MESSAGES =====
//   messages: `${API_BASE_URL}/api/messages`,
//   messageById: (id: string): string => `${API_BASE_URL}/api/messages/${id}`,
//   messageReply: (id: string): string => `${API_BASE_URL}/api/messages/${id}/reply`,
//   messageStatus: (id: string): string => `${API_BASE_URL}/api/messages/${id}/status`,
//   messageStats: `${API_BASE_URL}/api/messages/stats/summary`,
  
//   // ===== USER =====
//   userFoodPreferences: (phone: string): string => `${API_BASE_URL}/api/user/food-preferences/${phone}`,
//   userFoodSelection: `${API_BASE_URL}/api/user/food-selection`,
  
//   // ===== SLIDER =====
//   slider: `${API_BASE_URL}/api/slider`,
//   sliderAdmin: `${API_BASE_URL}/api/slider/admin`,
//   sliderAdminItem: (id: string): string => `${API_BASE_URL}/api/slider/admin/${id}`,
//   sliderToggle: (id: string): string => `${API_BASE_URL}/api/slider/admin/${id}/toggle`,
  
//   // ===== REVIEWS =====
//   reviews: `${API_BASE_URL}/api/reviews`,
//   reviewsSubmit: `${API_BASE_URL}/api/reviews/submit`,
//   reviewsPublic: `${API_BASE_URL}/api/reviews/public`,
//   adminReviews: `${API_BASE_URL}/api/admin/reviews`,
//   reviewApprove: (id: string): string => `${API_BASE_URL}/api/reviews/approve/${id}`,
  
//   // ===== UTILITY FUNCTIONS =====
//   getImageUrl: (imagePath: string): string => {
//     if (!imagePath) return '';
//     return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
//   }
// };

// // ===== MENU DETAILS SPECIFIC HELPER FUNCTIONS =====

// /**
//  * FIXED: Get all menu details for Admin Dashboard
//  * Uses proper endpoints that fetch from MenuDetails database
//  */
// export const getAllMenuDetailsForAdmin = async (): Promise<MenuDetail[]> => {
//   try {
//     const [vegResponse, nonVegResponse] = await Promise.all([
//       fetch(apiEndpoints.vegMenus),
//       fetch(apiEndpoints.nonVegMenus)
//     ]);

//     const [vegData, nonVegData] = await Promise.all([
//       vegResponse.json() as Promise<ApiResponse<MenuDetail[]>>,
//       nonVegResponse.json() as Promise<ApiResponse<MenuDetail[]>>
//     ]);

//     let allMenus: MenuDetail[] = [];

//     // Process veg menus from database
//     if (vegData.success && Array.isArray(vegData.data)) {
//       allMenus = [...allMenus, ...vegData.data];
//     }

//     // Process non-veg menus from database
//     if (nonVegData.success && Array.isArray(nonVegData.data)) {
//       allMenus = [...allMenus, ...nonVegData.data];
//     }

//     return allMenus;
//   } catch (error) {
//     console.error('Error fetching menu details:', error);
//     return [];
//   }
// };

// /**
//  * Get menu details by diet and category for frontend
//  */
// export const getMenuByDietCategory = (diet: 'veg' | 'non-veg', category: string): string => {
//   return apiEndpoints.menuDetails(diet, category);
// };

// /**
//  * Create or update menu details
//  */
// export const saveMenuDetails = async (
//   category: 'veg' | 'non-veg', 
//   menuData: FormData
// ): Promise<MenuDetail> => {
//   const endpoint = category === 'veg' 
//     ? apiEndpoints.vegMenuDetails 
//     : apiEndpoints.nonVegMenuDetails;
    
//   const response = await fetch(endpoint, {
//     method: 'POST',
//     body: menuData
//   });
  
//   const result = await response.json() as ApiResponse<MenuDetail>;
  
//   if (!response.ok || !result.success) {
//     throw new Error(result.message || 'Failed to save menu');
//   }
  
//   return result.data!;
// };

// /**
//  * Delete menu details by category and menuType
//  */
// export const deleteMenuDetails = async (
//   category: 'veg' | 'non-veg', 
//   menuType: string
// ): Promise<void> => {
//   const response = await fetch(
//     apiEndpoints.adminCategoryMenu(category, menuType), 
//     { method: 'DELETE' }
//   );
  
//   const result = await response.json() as ApiResponse;
  
//   if (!response.ok || !result.success) {
//     throw new Error(result.message || 'Failed to delete menu');
//   }
// };

// /**
//  * Get menu details by category (veg or non-veg)
//  */
// export const getMenuDetailsByCategory = async (
//   category: 'veg' | 'non-veg'
// ): Promise<MenuDetail[]> => {
//   try {
//     const endpoint = category === 'veg' 
//       ? apiEndpoints.vegMenus 
//       : apiEndpoints.nonVegMenus;
      
//     const response = await fetch(endpoint);
//     const data = await response.json() as ApiResponse<MenuDetail[]>;
    
//     return data.success && data.data ? data.data : [];
//   } catch (error) {
//     console.error(`Error fetching ${category} menus:`, error);
//     return [];
//   }
// };

// /**
//  * Upload image for menu
//  */
// export const uploadMenuImage = async (file: File): Promise<string> => {
//   const formData = new FormData();
//   formData.append('image', file);
  
//   const response = await fetch(apiEndpoints.uploadImage, {
//     method: 'POST',
//     body: formData
//   });
  
//   const result = await response.json() as ApiResponse<{ imageUrl: string }>;
  
//   if (!response.ok || !result.success || !result.data) {
//     throw new Error(result.message || 'Failed to upload image');
//   }
  
//   return result.data.imageUrl;
// };

// // ===== QUICK ACCESS FUNCTIONS FOR MENU DETAILS =====

// /**
//  * Get all veg menus from database
//  */
// export const getVegMenus = (): string => {
//   return apiEndpoints.vegMenus;
// };

// /**
//  * Get all non-veg menus from database
//  */
// export const getNonVegMenus = (): string => {
//   return apiEndpoints.nonVegMenus;
// };

// /**
//  * Get veg menus by specific category
//  */
// export const getVegMenusByCategory = (category: string): string => {
//   return apiEndpoints.vegMenusByCategory(category);
// };

// /**
//  * Get non-veg menus by specific category
//  */
// export const getNonVegMenusByCategory = (category: string): string => {
//   return apiEndpoints.nonVegMenusByCategory(category);
// };

// /**
//  * Create or update veg menu details
//  */
// export const createUpdateVegMenu = (): string => {
//   return apiEndpoints.vegMenuDetails;
// };

// /**
//  * Create or update non-veg menu details
//  */
// export const createUpdateNonVegMenu = (): string => {
//   return apiEndpoints.nonVegMenuDetails;
// };

// // ===== EXPORT CONSTANTS =====
// export const API_BASE = `${API_BASE_URL}/api`;

// // Default export
// export default apiEndpoints;

export interface MenuDetail {
  id: string;
  menuType: string;
  category: 'veg' | 'non-veg';
  name: string;
  description?: string;
  price?: number;
  image?: string;
  isAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ✅ PRODUCTION-READY API URL CONFIGURATION
const getApiBaseUrl = (): string => {
  const currentOrigin = window.location.origin;
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  console.log('🔧 API Configuration:');
  console.log('- Frontend Origin:', currentOrigin);
  console.log('- Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');
  
  // Priority 1: Environment Variable (Highest Priority)
  if (import.meta.env.VITE_API_URL) {
    console.log('✅ Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: React App Environment Variable (Fallback)
  if (import.meta.env.REACT_APP_API_URL) {
    console.log('✅ Using REACT_APP_API_URL:', import.meta.env.REACT_APP_API_URL);
    return import.meta.env.REACT_APP_API_URL;
  }
  
  // Priority 3: Environment-based defaults
  if (!isDevelopment) {
    // ⚠️ CRITICAL: Replace with your actual Railway backend URL
    const productionApiUrl = 'https://mamatiffin-production.up.railway.app';
    console.log('✅ Using Production API URL:', productionApiUrl);
    return productionApiUrl;
  }
  
  // Priority 4: Development fallback
  const apiUrl = 'http://localhost:3000';
  console.log('✅ Using Development API URL:', apiUrl);
  console.log('⚠️ Make sure backend CORS allows:', currentOrigin);
  
  return apiUrl;
};

export const API_BASE_URL = getApiBaseUrl();

console.log('📋 Final API Configuration:');
console.log('- Frontend Origin:', window.location.origin);
console.log('- API Base URL:', API_BASE_URL);
console.log('- Environment:', import.meta.env.MODE);
console.log('- Full API Path Example:', `${API_BASE_URL}/api/health`);

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type RequestBody = Record<string, unknown> | undefined;

// ✅ ENHANCED JSON HEADERS WITH BETTER ERROR HANDLING
const jsonHeaders = (token?: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ✅ ENHANCED FETCH WITH BETTER ERROR HANDLING
const handleResponse = async <T>(response: Response): Promise<T> => {
  let json;
  
  try {
    json = await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw new Error('Invalid server response');
  }
  
  if (!response.ok || !json.success) {
    const errorMessage = json.message || json.error || `Request failed with status ${response.status}`;
    console.error('API Error:', {
      status: response.status,
      message: errorMessage,
      url: response.url
    });
    throw new Error(errorMessage);
  }
  
  return json.data || json;
};

// ✅ BASIC GET REQUEST
export const getJSON = async <T = unknown>(url: string): Promise<T> => {
  try {
    const fullUrl = `${API_BASE_URL}/api${url}`;
    console.log('GET Request:', fullUrl);
    
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include', // For cookies/sessions
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    console.error('getJSON Error:', error);
    throw error;
  }
};

// ✅ AUTHENTICATED GET REQUEST
export const getAuthJSON = async <T = unknown>(url: string, token: string): Promise<T> => {
  try {
    const fullUrl = `${API_BASE_URL}/api${url}`;
    console.log('Authenticated GET Request:', fullUrl);
    
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: jsonHeaders(token),
      credentials: 'include',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    console.error('getAuthJSON Error:', error);
    throw error;
  }
};

// ✅ BASIC POST REQUEST
export const postJSON = async <T = unknown>(url: string, data: RequestBody): Promise<T> => {
  try {
    const fullUrl = `${API_BASE_URL}/api${url}`;
    console.log('POST Request:', fullUrl);
    
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    console.error('postJSON Error:', error);
    throw error;
  }
};

// ✅ AUTHENTICATED POST REQUEST
export const postAuthJSON = async <T = unknown>(
  url: string, 
  data: RequestBody, 
  token: string
): Promise<T> => {
  try {
    const fullUrl = `${API_BASE_URL}/api${url}`;
    console.log('Authenticated POST Request:', fullUrl);
    
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: jsonHeaders(token),
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    console.error('postAuthJSON Error:', error);
    throw error;
  }
};

// ✅ GENERIC REQUEST HANDLER
export const makeRequest = async <T = unknown>(
  url: string, 
  method: HttpMethod = 'GET', 
  data?: RequestBody, 
  token?: string
): Promise<T> => {
  try {
    const fullUrl = `${API_BASE_URL}/api${url}`;
    console.log(`${method} Request:`, fullUrl);
    
    const res = await fetch(fullUrl, {
      method,
      headers: jsonHeaders(token),
      ...(data ? { body: JSON.stringify(data) } : {}),
      credentials: 'include',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    console.error('makeRequest Error:', error);
    throw error;
  }
};

// ✅ ALL API ENDPOINTS - PRODUCTION READY
export const apiEndpoints = {
  
  // AUTH ENDPOINTS
  signin: `${API_BASE_URL}/api/auth/signin`,
  signup: `${API_BASE_URL}/api/auth/signup`,
  addressOptions: `${API_BASE_URL}/api/auth/address-options`,
  usersBase: `${API_BASE_URL}/api/auth`,
  
  // ADMIN AUTH
  adminAuth: `${API_BASE_URL}/admin-auth`,
  
  // MAIN MENU DETAILS ENDPOINTS
  menuDetails: (diet: string, category: string): string => 
    `${API_BASE_URL}/api/menus/${diet}/${category}`,
  
  adminMenuDetails: `${API_BASE_URL}/api/admin/menu-details`,
  adminMenu: (id?: string): string => {
    if (id) {
      return `${API_BASE_URL}/api/admin/menu/${id}`;
    }
    return `${API_BASE_URL}/api/admin/menu`;
  },
  
  adminCategoryMenu: (category: string, menuType: string): string => 
    `${API_BASE_URL}/api/admin/${category}/${encodeURIComponent(menuType)}`,
  
  adminDeleteMenu: (category: string, menuType: string): string => 
    `${API_BASE_URL}/api/admin/${category}/${encodeURIComponent(menuType)}`,
  
  // MENU DETAILS DATABASE ENDPOINTS
  vegMenus: `${API_BASE_URL}/api/veg-menus`,
  vegMenusByCategory: (category: string): string => 
    `${API_BASE_URL}/api/veg-menus/category/${encodeURIComponent(category)}`,
  vegMenuDetails: `${API_BASE_URL}/api/veg-menu-details`,
  
  nonVegMenus: `${API_BASE_URL}/api/non-veg-menus`,
  nonVegMenusByCategory: (category: string): string => 
    `${API_BASE_URL}/api/non-veg-menus/category/${encodeURIComponent(category)}`,
  nonVegMenuDetails: `${API_BASE_URL}/api/non-veg-menu-details`,
  
  // CATALOG ENDPOINTS (Time-based Menu Catalog)
  vegCatalog: `${API_BASE_URL}/api/veg/catalog`,
  vegCatalogById: (id: string): string => `${API_BASE_URL}/api/veg/catalog/${id}`,
  vegCatalogByCategory: (category: string): string => 
    `${API_BASE_URL}/api/veg/catalog/category/${encodeURIComponent(category)}`,
  
  nonVegCatalog: `${API_BASE_URL}/api/non-veg/catalog`,
  nonVegCatalogById: (id: string): string => `${API_BASE_URL}/api/non-veg/catalog/${id}`,
  nonVegCatalogByCategory: (category: string): string => 
    `${API_BASE_URL}/api/non-veg/catalog/category/${encodeURIComponent(category)}`,
  
  // IMAGE UPLOAD
  uploadImage: `${API_BASE_URL}/api/upload`,
  
  // HEALTH CHECK
  health: `${API_BASE_URL}/api/health`,
  
  // LOCATIONS
  locations: `${API_BASE_URL}/api/locations`,
  location: (id: string): string => `${API_BASE_URL}/api/locations/${id}`,
  
  // ORDER ENDPOINTS
  orders: `${API_BASE_URL}/api/orders`,
  orderStatistics: `${API_BASE_URL}/api/orders/statistics`,
  newOrders: `${API_BASE_URL}/api/orders/new`,
  oldOrders: `${API_BASE_URL}/api/orders/old`,
  skipOrders: `${API_BASE_URL}/api/orders/skip-orders`,
  finalDelivery: `${API_BASE_URL}/api/orders/final-delivery`,
  exportFinalDelivery: `${API_BASE_URL}/api/orders/export-final-delivery`,
  
  ordersByType: (type: string): string => {
    switch(type) {
      case 'new':
        return `${API_BASE_URL}/api/orders/new`;
      case 'old':
        return `${API_BASE_URL}/api/orders/old`;
      default:
        return `${API_BASE_URL}/api/orders`;
    }
  },
  
  orderStatus: (id: string): string => `${API_BASE_URL}/api/orders/${id}/status`,
  customerOrders: (phone: string): string => `${API_BASE_URL}/api/orders/customer/${phone}`,
  orderById: (id: string): string => `${API_BASE_URL}/api/orders/${id}`,
  ordersNew: `${API_BASE_URL}/api/orders/new`,
  ordersOld: `${API_BASE_URL}/api/orders/old`,
  
  // PAYMENTS SECTION
  createPayment: `${API_BASE_URL}/api/payments/create-order`,
  verifyPayment: `${API_BASE_URL}/api/payments/verify`,
  paymentStatus: (orderId: string): string => `${API_BASE_URL}/api/payments/status/${orderId}`,
  paymentHistory: (userId: string): string => `${API_BASE_URL}/api/payments/history/${userId}`,
  paymentRefund: (paymentId: string): string => `${API_BASE_URL}/api/payments/refund/${paymentId}`,
  paymentWebhook: `${API_BASE_URL}/api/payments/webhook`,
  paymentMethods: `${API_BASE_URL}/api/payments/methods`,
  paymentSettings: `${API_BASE_URL}/api/payments/settings`,
  subscriptionPayments: `${API_BASE_URL}/api/payments/subscriptions`,
  subscriptionCancel: (subscriptionId: string): string => 
    `${API_BASE_URL}/api/payments/subscriptions/${subscriptionId}/cancel`,
  subscriptionRenew: (subscriptionId: string): string => 
    `${API_BASE_URL}/api/payments/subscriptions/${subscriptionId}/renew`,
  paymentAnalytics: `${API_BASE_URL}/api/payments/analytics`,
  paymentReports: (type: string): string => `${API_BASE_URL}/api/payments/reports/${type}`,
  paymentExport: (format: string): string => `${API_BASE_URL}/api/payments/export/${format}`,
  
  // MESSAGES
  messages: `${API_BASE_URL}/api/messages`,
  messageById: (id: string): string => `${API_BASE_URL}/api/messages/${id}`,
  messageReply: (id: string): string => `${API_BASE_URL}/api/messages/${id}/reply`,
  messageStatus: (id: string): string => `${API_BASE_URL}/api/messages/${id}/status`,
  messageStats: `${API_BASE_URL}/api/messages/stats/summary`,
  
  // USER
  userFoodPreferences: (phone: string): string => `${API_BASE_URL}/api/user/food-preferences/${phone}`,
  userFoodSelection: `${API_BASE_URL}/api/user/food-selection`,
  
  // SLIDER
  slider: `${API_BASE_URL}/api/slider`,
  sliderAdmin: `${API_BASE_URL}/api/slider/admin`,
  sliderAdminItem: (id: string): string => `${API_BASE_URL}/api/slider/admin/${id}`,
  sliderToggle: (id: string): string => `${API_BASE_URL}/api/slider/admin/${id}/toggle`,
  
  // REVIEWS
  reviews: `${API_BASE_URL}/api/reviews`,
  reviewsSubmit: `${API_BASE_URL}/api/reviews/submit`,
  reviewsPublic: `${API_BASE_URL}/api/reviews/public`,
  adminReviews: `${API_BASE_URL}/api/admin/reviews`,
  reviewApprove: (id: string): string => `${API_BASE_URL}/api/reviews/approve/${id}`,
  
  // UTILITY FUNCTIONS
  getImageUrl: (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  }
};

// ✅ HELPER FUNCTIONS WITH BETTER ERROR HANDLING
export const getAllMenuDetailsForAdmin = async (): Promise<MenuDetail[]> => {
  try {
    console.log('🔄 Fetching all menu details for admin...');
    
    const [vegResponse, nonVegResponse] = await Promise.all([
      fetch(apiEndpoints.vegMenus, { credentials: 'include' }),
      fetch(apiEndpoints.nonVegMenus, { credentials: 'include' })
    ]);

    const [vegData, nonVegData] = await Promise.all([
      vegResponse.json() as Promise<ApiResponse<MenuDetail[]>>,
      nonVegResponse.json() as Promise<ApiResponse<MenuDetail[]>>
    ]);

    let allMenus: MenuDetail[] = [];

    if (vegData.success && Array.isArray(vegData.data)) {
      console.log('✅ Veg menus loaded:', vegData.data.length);
      allMenus = [...allMenus, ...vegData.data];
    }

    if (nonVegData.success && Array.isArray(nonVegData.data)) {
      console.log('✅ Non-veg menus loaded:', nonVegData.data.length);
      allMenus = [...allMenus, ...nonVegData.data];
    }

    console.log('✅ Total menus loaded:', allMenus.length);
    return allMenus;
  } catch (error) {
    console.error('❌ Error fetching menu details:', error);
    return [];
  }
};

export const getMenuByDietCategory = (diet: 'veg' | 'non-veg', category: string): string => {
  return apiEndpoints.menuDetails(diet, category);
};

export const saveMenuDetails = async (
  category: 'veg' | 'non-veg', 
  menuData: FormData
): Promise<MenuDetail> => {
  const endpoint = category === 'veg' 
    ? apiEndpoints.vegMenuDetails 
    : apiEndpoints.nonVegMenuDetails;
  
  console.log('💾 Saving menu details to:', endpoint);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    body: menuData,
    credentials: 'include',
  });
  
  const result = await response.json() as ApiResponse<MenuDetail>;
  
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to save menu');
  }
  
  console.log('✅ Menu saved successfully');
  return result.data!;
};

export const deleteMenuDetails = async (
  category: 'veg' | 'non-veg', 
  menuType: string
): Promise<void> => {
  const endpoint = apiEndpoints.adminCategoryMenu(category, menuType);
  console.log('🗑️ Deleting menu from:', endpoint);
  
  const response = await fetch(endpoint, { 
    method: 'DELETE',
    credentials: 'include',
  });
  
  const result = await response.json() as ApiResponse;
  
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to delete menu');
  }
  
  console.log('✅ Menu deleted successfully');
};

export const getMenuDetailsByCategory = async (
  category: 'veg' | 'non-veg'
): Promise<MenuDetail[]> => {
  try {
    const endpoint = category === 'veg' 
      ? apiEndpoints.vegMenus 
      : apiEndpoints.nonVegMenus;
    
    console.log('🔄 Fetching menus for category:', category);
    
    const response = await fetch(endpoint, { credentials: 'include' });
    const data = await response.json() as ApiResponse<MenuDetail[]>;
    
    if (data.success && data.data) {
      console.log(`✅ ${category} menus loaded:`, data.data.length);
      return data.data;
    }
    
    return [];
  } catch (error) {
    console.error(`❌ Error fetching ${category} menus:`, error);
    return [];
  }
};

export const uploadMenuImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  console.log('📤 Uploading image:', file.name);
  
  const response = await fetch(apiEndpoints.uploadImage, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  const result = await response.json() as ApiResponse<{ imageUrl: string }>;
  
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || 'Failed to upload image');
  }
  
  console.log('✅ Image uploaded:', result.data.imageUrl);
  return result.data.imageUrl;
};

// LEGACY SUPPORT FUNCTIONS
export const getVegMenus = (): string => apiEndpoints.vegMenus;
export const getNonVegMenus = (): string => apiEndpoints.nonVegMenus;
export const getVegMenusByCategory = (category: string): string => 
  apiEndpoints.vegMenusByCategory(category);
export const getNonVegMenusByCategory = (category: string): string => 
  apiEndpoints.nonVegMenusByCategory(category);
export const createUpdateVegMenu = (): string => apiEndpoints.vegMenuDetails;
export const createUpdateNonVegMenu = (): string => apiEndpoints.nonVegMenuDetails;

export const API_BASE = `${API_BASE_URL}/api`;

// ✅ EXPORT DEFAULT
export default apiEndpoints;