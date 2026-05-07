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
  
  if (import.meta.env.VITE_API_URL) {
    const apiUrl = import.meta.env.VITE_API_URL;
    console.log('✅ Using VITE_API_URL:', apiUrl);
    return apiUrl;
  }
  
  if (import.meta.env.VITE_API_BASE_URL) {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    console.log('✅ Using VITE_API_BASE_URL:', apiUrl);
    return apiUrl;
  }
  
  if (import.meta.env.REACT_APP_API_URL) {
    const apiUrl = import.meta.env.REACT_APP_API_URL;
    console.log('✅ Using REACT_APP_API_URL:', apiUrl);
    return apiUrl;
  }
  
  if (isDevelopment) {
    const apiUrl = 'http://localhost:3000';
    console.log('✅ Using Development API URL:', apiUrl);
    console.log('⚠️ Make sure backend CORS allows:', currentOrigin);
    return apiUrl;
  }
  
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

const jsonHeaders = (token?: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

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

export const getJSON = async <T = unknown>(url: string): Promise<T> => {
  try {
    const fullUrl = `${API_BASE_URL}/api${url}`;
    console.log('GET Request:', fullUrl);
    
    const res = await fetch(fullUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    });
    
    return handleResponse<T>(res);
  } catch (error) {
    console.error('getJSON Error:', error);
    throw error;
  }
};

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
  
  // ADMIN AUTH
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
    if (id) return `${API_BASE_URL}/api/admin/menu/${id}`;
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
  
  // VEG CATALOG
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

  // NON-VEG CATALOG
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
  
  // IMAGE UPLOAD
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
  
  // USER ORDER ENDPOINTS
  orders: `${API_BASE_URL}/api/orders`,
  createOrder: `${API_BASE_URL}/api/orders`,
  userOrders: (userId: string): string => `${API_BASE_URL}/api/orders/user/${userId}`,
  orderById: (id: string): string => `${API_BASE_URL}/api/orders/${id}`,
  
  // ADMIN ORDER ENDPOINTS
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
  
  // Legacy order endpoints
  orderStatistics: `${API_BASE_URL}/api/orders/statistics`,
  newOrders: `${API_BASE_URL}/api/orders/new`,
  oldOrders: `${API_BASE_URL}/api/orders/old`,
  skipOrders: `${API_BASE_URL}/api/orders/skip-orders`,
  finalDelivery: `${API_BASE_URL}/api/orders/final-delivery`,
  exportFinalDelivery: `${API_BASE_URL}/api/orders/export-final-delivery`,
  
  ordersByType: (type: string): string => {
    switch(type) {
      case 'new': return `${API_BASE_URL}/api/admin/orders/new`;
      case 'old': return `${API_BASE_URL}/api/admin/orders/old`;
      default: return `${API_BASE_URL}/api/admin/orders`;
    }
  },
  
  orderStatus: (id: string): string => `${API_BASE_URL}/api/orders/${id}/status`,
  customerOrders: (phone: string): string => `${API_BASE_URL}/api/orders/customer/${phone}`,
  ordersNew: `${API_BASE_URL}/api/orders/new`,
  ordersOld: `${API_BASE_URL}/api/orders/old`,
  
  // PAYMENTS
  createPayment: `${API_BASE_URL}/api/payments/create-order`,
  verifyPayment: `${API_BASE_URL}/api/payments/verify`,
  paymentStatus: (orderId: string): string => `${API_BASE_URL}/api/payments/status/${orderId}`,
  
  // MESSAGES
  messages: `${API_BASE_URL}/api/messages`,
  messageById: (id: string): string => `${API_BASE_URL}/api/messages/${id}`,
  messageReply: (id: string): string => `${API_BASE_URL}/api/messages/${id}/reply`,
  messageStatus: (id: string): string => `${API_BASE_URL}/api/messages/${id}/status`,
  messageStats: `${API_BASE_URL}/api/messages/stats/summary`,
  messageDelete: (id: string): string => `${API_BASE_URL}/api/messages/${id}`,
  messageHealth: `${API_BASE_URL}/api/messages/health`,

  // USER
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

  // ============================================
  // 📚 BOOK BUY/SELL ENDPOINTS
  // ============================================
  books: `${API_BASE_URL}/api/books`,
  bookById: (id: string): string => `${API_BASE_URL}/api/books/${id}`,
  myBookListings: `${API_BASE_URL}/api/books/my/listings`,
  createBook: `${API_BASE_URL}/api/books`,
  updateBook: (id: string): string => `${API_BASE_URL}/api/books/${id}`,
  markBookSold: (id: string): string => `${API_BASE_URL}/api/books/${id}/sold`,
  relistBook: (id: string): string => `${API_BASE_URL}/api/books/${id}/relist`,
  deleteBook: (id: string): string => `${API_BASE_URL}/api/books/${id}`,

  // ============================================
  // 🏠 ROOM (LODGE) ENDPOINTS (NEW)
  // ============================================
  // Public
  rooms: `${API_BASE_URL}/api/rooms`,
  roomById: (id: string): string => `${API_BASE_URL}/api/rooms/${id}`,
  // Admin
  adminRooms: `${API_BASE_URL}/api/admin/rooms`,
  adminRoomById: (id: string): string => `${API_BASE_URL}/api/admin/rooms/${id}`,
  adminRoomStats: `${API_BASE_URL}/api/admin/rooms/stats`,
  adminRoomToggle: (id: string): string => `${API_BASE_URL}/api/admin/rooms/${id}/toggle`,
  
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

// ============================================
// 📚 BOOK BUY/SELL TYPES & HELPER FUNCTIONS
// ============================================

export type BookClass = '9th' | '10th' | '11th' | '12th';
export type BookCondition = 'New' | 'Good' | 'Fair';
export type BookStatus = 'Available' | 'Sold';

export interface BookImage {
  url: string;
  publicId: string;
}

export interface Book {
  _id: string;
  userId: string;
  bookName: string;
  price: number;
  images: BookImage[];
  class: BookClass;
  subject: string;
  condition: BookCondition;
  description: string;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  status: BookStatus;
  soldDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookFilters {
  class?: BookClass | '';
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BooksListResponse {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
}

export const BOOK_CLASSES: readonly BookClass[] = ['9th', '10th', '11th', '12th'] as const;
export const BOOK_CONDITIONS: readonly BookCondition[] = ['New', 'Good', 'Fair'] as const;

export const SUBJECTS_BY_CLASS: Record<BookClass, string[]> = {
  '9th': ['Math', 'Science', 'S.St', 'English', 'Hindi', 'Computer Science', 'Notes'],
  '10th': ['Math', 'Science', 'S.St', 'English', 'Hindi', 'Computer Science', 'Notes'],
  '11th': ['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Economics', 'Notes'],
  '12th': ['Math', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Economics', 'Notes'],
};

// ✅ GET ALL AVAILABLE BOOKS (Public - Buy Page)
export const getAllBooks = async (filters: BookFilters = {}): Promise<BooksListResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.class) params.append('class', filters.class);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const url = `${apiEndpoints.books}?${params.toString()}`;
    console.log('🔄 Fetching books:', url);

    const response = await fetch(url, { credentials: 'include' });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch books');
    }

    console.log('✅ Books loaded:', result.books?.length || 0);
    return {
      books: result.books || [],
      total: result.total || 0,
      page: result.page || 1,
      totalPages: result.totalPages || 1,
    };
  } catch (error) {
    console.error('❌ getAllBooks Error:', error);
    throw error;
  }
};

// ✅ GET SINGLE BOOK BY ID (Public)
export const getBookById = async (id: string): Promise<Book> => {
  try {
    console.log('🔄 Fetching book:', id);
    const response = await fetch(apiEndpoints.bookById(id), { credentials: 'include' });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Book not found');
    }
    return result.book;
  } catch (error) {
    console.error('❌ getBookById Error:', error);
    throw error;
  }
};

// ✅ GET MY LISTINGS (Protected)
export const getMyBookListings = async (token: string): Promise<Book[]> => {
  try {
    console.log('🔄 Fetching my listings...');
    const response = await fetch(apiEndpoints.myBookListings, {
      headers: jsonHeaders(token),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch listings');
    }

    console.log('✅ My listings loaded:', result.books?.length || 0);
    return result.books || [];
  } catch (error) {
    console.error('❌ getMyBookListings Error:', error);
    throw error;
  }
};

// ✅ CREATE BOOK LISTING (Protected, Multipart)
export const createBookListing = async (
  formData: FormData,
  token: string
): Promise<Book> => {
  try {
    console.log('💾 Creating book listing...');
    const response = await fetch(apiEndpoints.createBook, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create listing');
    }

    console.log('✅ Book listing created');
    return result.book;
  } catch (error) {
    console.error('❌ createBookListing Error:', error);
    throw error;
  }
};

// ✅ UPDATE BOOK LISTING (Protected, Multipart)
export const updateBookListing = async (
  id: string,
  formData: FormData,
  token: string
): Promise<Book> => {
  try {
    console.log('✏️ Updating book listing:', id);
    const response = await fetch(apiEndpoints.updateBook(id), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update listing');
    }

    console.log('✅ Book updated');
    return result.book;
  } catch (error) {
    console.error('❌ updateBookListing Error:', error);
    throw error;
  }
};

// ✅ MARK BOOK AS SOLD (Protected)
export const markBookAsSold = async (id: string, token: string): Promise<Book> => {
  try {
    console.log('🏷️ Marking book as sold:', id);
    const response = await fetch(apiEndpoints.markBookSold(id), {
      method: 'PATCH',
      headers: jsonHeaders(token),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to mark as sold');
    }

    console.log('✅ Book marked as sold');
    return result.book;
  } catch (error) {
    console.error('❌ markBookAsSold Error:', error);
    throw error;
  }
};

// ✅ RELIST SOLD BOOK (Protected)
export const relistBook = async (id: string, token: string): Promise<Book> => {
  try {
    console.log('🔁 Relisting book:', id);
    const response = await fetch(apiEndpoints.relistBook(id), {
      method: 'PATCH',
      headers: jsonHeaders(token),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to relist');
    }

    console.log('✅ Book relisted');
    return result.book;
  } catch (error) {
    console.error('❌ relistBook Error:', error);
    throw error;
  }
};

// ✅ DELETE BOOK LISTING (Protected)
export const deleteBookListing = async (id: string, token: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting book:', id);
    const response = await fetch(apiEndpoints.deleteBook(id), {
      method: 'DELETE',
      headers: jsonHeaders(token),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete');
    }

    console.log('✅ Book deleted');
  } catch (error) {
    console.error('❌ deleteBookListing Error:', error);
    throw error;
  }
};

// ============================================
// 🏠 ROOM (LODGE) TYPES & HELPER FUNCTIONS (NEW)
// ============================================

export type RoomGender = 'boy' | 'girl';
export type RoomBedType = 'single' | 'double';

export interface RoomImage {
  url: string;
  publicId?: string;
}

export interface Room {
  _id: string;
  lodgeName: string;
  ownerName: string;
  ownerContact: string;
  address: string;
  googleMapLink: string;
  latitude?: number;
  longitude?: number;
  gender: RoomGender;
  bedType: RoomBedType;
  rentPrice?: number;
  description?: string;
  images: RoomImage[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomFilters {
  gender?: RoomGender | '';
  bedType?: RoomBedType | '';
  search?: string;
  page?: number;
  limit?: number;
}

export interface RoomsListResponse {
  rooms: Room[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface RoomStats {
  total: number;
  boyRooms: number;
  girlRooms: number;
  singleBed: number;
  doubleBed: number;
  available: number;
  unavailable: number;
}

export const ROOM_GENDERS: readonly RoomGender[] = ['boy', 'girl'] as const;
export const ROOM_BED_TYPES: readonly RoomBedType[] = ['single', 'double'] as const;

// ✅ GET ALL AVAILABLE ROOMS (Public - Customer Page)
export const getAllRooms = async (filters: RoomFilters = {}): Promise<RoomsListResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.bedType) params.append('bedType', filters.bedType);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const url = `${apiEndpoints.rooms}?${params.toString()}`;
    console.log('🔄 Fetching rooms:', url);

    const response = await fetch(url, { credentials: 'include' });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch rooms');
    }

    console.log('✅ Rooms loaded:', result.rooms?.length || 0);
    return {
      rooms: result.rooms || [],
      total: result.total || 0,
      page: result.page || 1,
      totalPages: result.totalPages || 1,
      limit: result.limit || 10,
    };
  } catch (error) {
    console.error('❌ getAllRooms Error:', error);
    throw error;
  }
};

// ✅ GET SINGLE ROOM BY ID (Public)
export const getRoomById = async (id: string): Promise<Room> => {
  try {
    console.log('🔄 Fetching room:', id);
    const response = await fetch(apiEndpoints.roomById(id), { credentials: 'include' });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Room not found');
    }
    return result.room;
  } catch (error) {
    console.error('❌ getRoomById Error:', error);
    throw error;
  }
};

// ✅ ADMIN: GET ALL ROOMS (including unavailable)
export const getAllRoomsAdmin = async (
  filters: RoomFilters = {},
  token: string
): Promise<RoomsListResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.bedType) params.append('bedType', filters.bedType);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const url = `${apiEndpoints.adminRooms}?${params.toString()}`;
    console.log('🔄 Admin fetching rooms:', url);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch rooms');
    }

    console.log('✅ Admin rooms loaded:', result.rooms?.length || 0);
    return {
      rooms: result.rooms || [],
      total: result.total || 0,
      page: result.page || 1,
      totalPages: result.totalPages || 1,
      limit: result.limit || 20,
    };
  } catch (error) {
    console.error('❌ getAllRoomsAdmin Error:', error);
    throw error;
  }
};

// ✅ ADMIN: GET ROOM STATS
export const getRoomStats = async (token: string): Promise<RoomStats> => {
  try {
    console.log('🔄 Fetching room stats...');
    const response = await fetch(apiEndpoints.adminRoomStats, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch stats');
    }

    console.log('✅ Room stats loaded');
    return result.stats;
  } catch (error) {
    console.error('❌ getRoomStats Error:', error);
    throw error;
  }
};

// ✅ ADMIN: CREATE ROOM (Multipart)
export const createRoom = async (formData: FormData, token: string): Promise<Room> => {
  try {
    console.log('💾 Creating room...');
    const response = await fetch(apiEndpoints.adminRooms, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to create room');
    }

    console.log('✅ Room created');
    return result.room;
  } catch (error) {
    console.error('❌ createRoom Error:', error);
    throw error;
  }
};

// ✅ ADMIN: UPDATE ROOM (Multipart)
export const updateRoom = async (
  id: string,
  formData: FormData,
  token: string
): Promise<Room> => {
  try {
    console.log('✏️ Updating room:', id);
    const response = await fetch(apiEndpoints.adminRoomById(id), {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to update room');
    }

    console.log('✅ Room updated');
    return result.room;
  } catch (error) {
    console.error('❌ updateRoom Error:', error);
    throw error;
  }
};

// ✅ ADMIN: TOGGLE ROOM AVAILABILITY
export const toggleRoomAvailability = async (id: string, token: string): Promise<Room> => {
  try {
    console.log('🔁 Toggling room availability:', id);
    const response = await fetch(apiEndpoints.adminRoomToggle(id), {
      method: 'PATCH',
      headers: jsonHeaders(token),
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to toggle availability');
    }

    console.log('✅ Room availability toggled');
    return result.room;
  } catch (error) {
    console.error('❌ toggleRoomAvailability Error:', error);
    throw error;
  }
};

// ✅ ADMIN: DELETE ROOM
export const deleteRoom = async (id: string, token: string): Promise<void> => {
  try {
    console.log('🗑️ Deleting room:', id);
    const response = await fetch(apiEndpoints.adminRoomById(id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete room');
    }

    console.log('✅ Room deleted');
  } catch (error) {
    console.error('❌ deleteRoom Error:', error);
    throw error;
  }
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

export default apiEndpoints;