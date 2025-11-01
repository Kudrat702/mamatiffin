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
  console.log('- Available Env Vars:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV
  });
  
  // Priority 1: VITE_API_URL Environment Variable (Highest Priority)
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log('✅ Using VITE_API_URL:', apiUrl);
    return apiUrl;
  }
  
  // Priority 2: VITE_API_BASE_URL (Alternative naming)
  if (import.meta.env.VITE_API_BASE_URL) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    console.log('✅ Using VITE_API_BASE_URL:', apiUrl);
    return apiUrl;
  }
  
  // Priority 3: React App Environment Variable (Fallback)
  if (import.meta.env.REACT_APP_API_URL) {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    console.log('✅ Using REACT_APP_API_URL:', apiUrl);
    return apiUrl;
  }
  
  // Priority 4: Development fallback
  if (isDevelopment) {
    const apiUrl = 'http://localhost:3000';
    console.log('✅ Using Development API URL:', apiUrl);
    console.log('⚠️ Make sure backend CORS allows:', currentOrigin);
    return apiUrl;
  }
  
  // Priority 5: Production Fallback (Only if env var not set)
  // ⚠️ WARNING: This is a fallback. Always set VITE_API_URL in Vercel!
  const fallbackUrl = 'https://mamatiffin-production.up.railway.app';
  console.warn('⚠️ NO ENVIRONMENT VARIABLE SET!');
  console.warn('⚠️ Using fallback URL:', fallbackUrl);
  console.warn('⚠️ Please set VITE_API_URL in Vercel Environment Variables!');
  
  return fallbackUrl;
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
      credentials: 'include',
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
  getAllUsers: `${API_BASE_URL}/api/auth/users`,
  
// ADMIN AUTH - ✅ FIXED PATHS
adminAuth: `${API_BASE_URL}/api/admin/auth`,
adminSignin: `${API_BASE_URL}/api/admin/auth/signin`,
adminSignup: `${API_BASE_URL}/api/admin/auth/signup`,
adminProfile: `${API_BASE_URL}/api/admin/auth/profile`,
adminVerifyToken: `${API_BASE_URL}/api/admin/auth/verify-token`,
adminLogout: `${API_BASE_URL}/api/admin/auth/logout`,
adminHashPassword: `${API_BASE_URL}/api/admin/auth/hash-password`,
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
  vegMenuDetails: `${API_BASE_URL}/api/menus/veg-menu-details`,
  
  nonVegMenus: `${API_BASE_URL}/api/non-veg-menus`,
  nonVegMenusByCategory: (category: string): string => 
    `${API_BASE_URL}/api/non-veg-menus/category/${encodeURIComponent(category)}`,
  nonVegMenuDetails: `${API_BASE_URL}/api/menus/non-veg-menu-details`,
  
  // CATALOG ENDPOINTS (Time-based Menu Catalog)
// ✅ VEG CATALOG
vegCatalog: `${API_BASE_URL}/api/veg-menus`,
vegCatalogById: (id: string): string => `${API_BASE_URL}/api/veg-menus/${id}`,
vegCatalogByCategory: (category: string): string => 
  `${API_BASE_URL}/api/veg-menus/category/${encodeURIComponent(category)}`,
vegCatalogSearch: (searchTerm: string): string => 
  `${API_BASE_URL}/api/veg-menus/search/${encodeURIComponent(searchTerm)}`,
vegCatalogBulk: (category: string): string => 
  `${API_BASE_URL}/api/veg-menus/bulk/${encodeURIComponent(category)}`,
vegCatalogSummary: `${API_BASE_URL}/api/veg-menus/categories/summary`,
vegCatalogHealth: `${API_BASE_URL}/api/veg-menus/health`,

// ✅ NON-VEG CATALOG
nonVegCatalog: `${API_BASE_URL}/api/non-veg-menus`,
nonVegCatalogById: (id: string): string => `${API_BASE_URL}/api/non-veg-menus/${id}`,
nonVegCatalogByCategory: (category: string): string => 
  `${API_BASE_URL}/api/non-veg-menus/category/${encodeURIComponent(category)}`,
nonVegCatalogSearch: (searchTerm: string): string => 
  `${API_BASE_URL}/api/non-veg-menus/search/${encodeURIComponent(searchTerm)}`,
nonVegCatalogBulk: (category: string): string => 
  `${API_BASE_URL}/api/non-veg-menus/bulk/${encodeURIComponent(category)}`,
nonVegCatalogSummary: `${API_BASE_URL}/api/non-veg-menus/categories/summary`,
nonVegCatalogHealth: `${API_BASE_URL}/api/non-veg-menus/health`,
  
  // IMAGE UPLOAD ENDPOINTS
uploadImage: `${API_BASE_URL}/api/upload/image`,
uploadMultipleImages: `${API_BASE_URL}/api/upload/images`,
deleteImage: (filename: string): string => 
  `${API_BASE_URL}/api/upload/image/${filename}`,
getImageInfo: (filename: string): string => 
  `${API_BASE_URL}/api/upload/info/${filename}`,
listUploadedImages: `${API_BASE_URL}/api/upload/list`,
uploadHealth: `${API_BASE_URL}/api/upload/health`,
  
  // HEALTH CHECK
  health: `${API_BASE_URL}/api/health`,
  
  // LOCATIONS
  locations: `${API_BASE_URL}/api/locations`,
  location: (id: string): string => `${API_BASE_URL}/api/locations/${id}`,
  
  // ✅ USER ORDER ENDPOINTS (Public)
  orders: `${API_BASE_URL}/api/orders`,
  createOrder: `${API_BASE_URL}/api/orders`,
  userOrders: (userId: string): string => `${API_BASE_URL}/api/orders/user/${userId}`,
  orderById: (id: string): string => `${API_BASE_URL}/api/orders/${id}`,
  
  // ✅ ADMIN ORDER ENDPOINTS (Admin Only)
  adminOrders: `${API_BASE_URL}/api/admin/orders`,
  adminOrderStatistics: `${API_BASE_URL}/api/admin/orders/statistics`,
  adminOrderAnalytics: `${API_BASE_URL}/api/admin/orders/analytics`,
  adminCustomerOverview: `${API_BASE_URL}/api/admin/orders/customer-overview`,
  adminExportFinalDelivery: `${API_BASE_URL}/api/admin/orders/export-final-delivery`,
  adminExportOrders: `${API_BASE_URL}/api/admin/orders/export`,
  adminSearchOrders: `${API_BASE_URL}/api/admin/orders/search`,
  adminNewOrders: `${API_BASE_URL}/api/admin/orders/new`,
  adminOldOrders: `${API_BASE_URL}/api/admin/orders/old`,
  adminSkipOrders: `${API_BASE_URL}/api/admin/orders/skip-orders`,
  adminFinalDelivery: `${API_BASE_URL}/api/admin/orders/final-delivery`,
  adminOrdersByDay: `${API_BASE_URL}/api/admin/orders/by-day`,
  adminBulkUpdate: `${API_BASE_URL}/api/admin/orders/bulk-update`,
  adminCustomerOrders: (customerPhone: string): string => 
    `${API_BASE_URL}/api/admin/orders/customer/${customerPhone}`,
  adminOrderStatus: (orderId: string): string => 
    `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
  adminDeleteOrder: (orderId: string): string => 
    `${API_BASE_URL}/api/admin/orders/${orderId}`,
  adminOrderDetails: (orderId: string): string => 
    `${API_BASE_URL}/api/admin/orders/${orderId}`,
  
  // Legacy order endpoints (for backward compatibility)
  orderStatistics: `${API_BASE_URL}/api/orders/statistics`,
  newOrders: `${API_BASE_URL}/api/orders/new`,
  oldOrders: `${API_BASE_URL}/api/orders/old`,
  skipOrders: `${API_BASE_URL}/api/orders/skip-orders`,
  finalDelivery: `${API_BASE_URL}/api/orders/final-delivery`,
  exportFinalDelivery: `${API_BASE_URL}/api/orders/export-final-delivery`,
  
  ordersByType: (type: string): string => {
    switch(type) {
      case 'new':
        return `${API_BASE_URL}/api/admin/orders/new`;
      case 'old':
        return `${API_BASE_URL}/api/admin/orders/old`;
      default:
        return `${API_BASE_URL}/api/admin/orders`;
    }
  },
  
  orderStatus: (id: string): string => `${API_BASE_URL}/api/orders/${id}/status`,
  customerOrders: (phone: string): string => `${API_BASE_URL}/api/orders/customer/${phone}`,
  ordersNew: `${API_BASE_URL}/api/orders/new`,
  ordersOld: `${API_BASE_URL}/api/orders/old`,
  
  // PAYMENTS SECTION
  createPayment: `${API_BASE_URL}/api/payments/create-order`,
  verifyPayment: `${API_BASE_URL}/api/payments/verify`,
  paymentStatus: (orderId: string): string => `${API_BASE_URL}/api/payments/status/${orderId}`,
  
// MESSAGES SECTION
messages: `${API_BASE_URL}/api/messages`,
messageById: (id: string): string => `${API_BASE_URL}/api/messages/${id}`,
messageReply: (id: string): string => `${API_BASE_URL}/api/messages/${id}/reply`,
messageStatus: (id: string): string => `${API_BASE_URL}/api/messages/${id}/status`,
messageStats: `${API_BASE_URL}/api/messages/stats/summary`,
messageDelete: (id: string): string => `${API_BASE_URL}/api/messages/${id}`,  // ✅ ADD THIS
messageHealth: `${API_BASE_URL}/api/messages/health`,  // ✅ OPTIONAL: Add this too
  // USER - ✅ COMPLETE
userFoodPreferences: (phone: string): string => 
  `${API_BASE_URL}/api/user/food-preferences/${phone}`,
userFoodSelection: `${API_BASE_URL}/api/user/food-selection`,
userDashboard: (phone: string): string => 
  `${API_BASE_URL}/api/user/dashboard/${phone}`,
  
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