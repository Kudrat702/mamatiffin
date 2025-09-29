import { Document, ObjectId } from 'mongoose';

// Base interface for all MongoDB documents
export interface BaseDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User related types
export interface IUser extends BaseDocument {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin' | 'delivery';
  isVerified: boolean;
  avatar?: string;
  address?: IAddress;
  preferences?: IUserPreferences;
  lastLogin?: Date;
  isActive: boolean;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface IUserPreferences {
  dietType: 'veg' | 'non-veg' | 'both';
  spiceLevel: 'mild' | 'medium' | 'spicy';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Menu related types
export interface IMenuDetails extends BaseDocument {
  category: 'veg' | 'non-veg';
  menuType: string;
  title: string;
  description: string;
  image?: string;
  deliveryTime: string;
  priceMonthly: number;
  priceTrial: number;
  weeklyMenu: IWeeklyMenu;
  isActive: boolean;
  tags: string[];
  nutritionInfo?: INutritionInfo;
  allergens?: string[];
}

export interface IWeeklyMenu {
  monday: IDayMenu;
  tuesday: IDayMenu;
  wednesday: IDayMenu;
  thursday: IDayMenu;
  friday: IDayMenu;
  saturday: IDayMenu;
  sunday: IDayMenu;
}

export interface IDayMenu {
  breakfast?: IMeal;
  lunch?: IMeal;
  dinner?: IMeal;
  snacks?: IMeal[];
}

export interface IMeal {
  name: string;
  description?: string;
  ingredients: string[];
  calories?: number;
  image?: string;
  cookingTime?: string;
}

export interface INutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

// Order related types
export interface IOrder extends BaseDocument {
  userId: ObjectId;
  menuId: ObjectId;
  orderType: 'trial' | 'monthly';
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  amount: number;
  deliveryAddress: IAddress;
  deliveryDate: Date;
  specialInstructions?: string;
  deliveryPersonId?: ObjectId;
  trackingInfo?: ITrackingInfo;
  feedback?: IOrderFeedback;
}

export interface ITrackingInfo {
  estimatedDeliveryTime: Date;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  statusHistory: Array<{
    status: IOrder['status'];
    timestamp: Date;
    note?: string;
  }>;
}

export interface IOrderFeedback {
  rating: number; // 1-5
  comment?: string;
  foodQuality: number;
  deliveryTime: number;
  packaging: number;
  submittedAt: Date;
}

// Catalog related types
export interface ICatalog extends BaseDocument {
  category: 'veg' | 'non-veg';
  items: ICatalogItem[];
  isActive: boolean;
}

export interface ICatalogItem {
  name: string;
  description: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  preparationTime: string;
  tags: string[];
  nutritionInfo?: INutritionInfo;
}

// Message/Contact related types
export interface IMessage extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  userId?: ObjectId;
  adminResponse?: string;
  respondedAt?: Date;
  respondedBy?: ObjectId;
}

// Slider/Banner related types
export interface ISlider extends BaseDocument {
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive: boolean;
  order: number;
  startDate?: Date;
  endDate?: Date;
  targetAudience?: 'all' | 'new-users' | 'existing-users';
}

// Location related types
export interface ILocation extends BaseDocument {
  name: string;
  type: 'city' | 'area' | 'pincode';
  parentLocation?: ObjectId;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isServiceable: boolean;
  deliveryCharge: number;
  minimumOrderAmount: number;
}

// Payment related types
export interface IPayment extends BaseDocument {
  orderId: ObjectId;
  userId: ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'razorpay' | 'paytm' | 'upi' | 'card' | 'netbanking';
  paymentGateway: string;
  gatewayTransactionId: string;
  gatewayResponse?: any;
  status: 'initiated' | 'success' | 'failed' | 'refunded';
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;
}

// Admin related types
export interface IAdmin extends BaseDocument {
  username: string;
  email: string;
  password: string;
  role: 'super-admin' | 'admin' | 'moderator';
  permissions: string[];
  lastLogin?: Date;
  isActive: boolean;
}

// Notification related types
export interface INotification extends BaseDocument {
  userId: ObjectId;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'delivery' | 'promotion' | 'system';
  isRead: boolean;
  data?: any; // Additional data for the notification
  expiresAt?: Date;
}

// Database connection types
export interface IDatabaseConfig {
  uri: string;
  options: {
    dbName: string;
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    serverSelectionTimeoutMS: number;
    socketTimeoutMS: number;
    bufferMaxEntries: number;
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination types
export interface IPaginationQuery {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// File upload types
export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

// Search and filter types
export interface ISearchQuery {
  q?: string; // search term
  category?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

// JWT payload types
export interface IJWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Environment variables type
export interface IEnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  DB_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  SMS_API_KEY: string;
  EMAIL_SERVICE_API_KEY: string;
  UPLOAD_PATH: string;
  CLIENT_URL: string;
  MAX_FILE_SIZE: number;
}

// Error types
export interface ICustomError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
  keyValue?: any;
  errors?: any;
}

export type DatabaseCollections =
  | 'users'
  | 'menus'
  | 'orders'
  | 'catalogs'
  | 'messages'
  | 'sliders'
  | 'locations'
  | 'payments'
  | 'admins'
  | 'notifications';

// Utility types for MongoDB operations
export type CreateDocument<T> = Omit<T, keyof BaseDocument>;
export type UpdateDocument<T> = Partial<Omit<T, keyof BaseDocument>>;
export type QueryFilter<T> = Partial<T> & {
  _id?: ObjectId | string;
  createdAt?: Date | { $gte?: Date; $lte?: Date };
  updatedAt?: Date | { $gte?: Date; $lte?: Date };
};