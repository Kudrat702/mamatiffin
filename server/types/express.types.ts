import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongoose';
import { IJWTPayload, IFileUpload, IPaginationQuery, ISearchQuery } from './database.types';

// Extended Request interface with user authentication
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'delivery';
    name?: string;
  };
  // Use Express.Multer.File instead of IFileUpload
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// Admin Request interface
export interface AdminRequest extends AuthenticatedRequest {
  admin?: {
    id: string;
    username: string;
    email: string;
    role: 'super-admin' | 'admin' | 'moderator';
    permissions: string[];
  };
}

// Request with pagination and search
export interface PaginatedRequest extends AuthenticatedRequest {
  query: IPaginationQuery & ISearchQuery & {
    [key: string]: any;
  };
}

// Response interface with consistent structure
export interface ApiResponse extends Response {
  success: (data?: any, message?: string, statusCode?: number) => Response;
  error: (message: string, statusCode?: number, errors?: any) => Response;
  paginated: (data: any[], pagination: any, message?: string) => Response;
}

// Controller function types
export type Controller = (
  req: AuthenticatedRequest,
  res: ApiResponse,
  next: NextFunction
) => Promise<void> | void;

export type AdminController = (
  req: AdminRequest,
  res: ApiResponse,
  next: NextFunction
) => Promise<void> | void;

export type PaginatedController = (
  req: PaginatedRequest,
  res: ApiResponse,
  next: NextFunction
) => Promise<void> | void;

// Middleware types
export type Middleware = (
  req: AuthenticatedRequest,
  res: ApiResponse,
  next: NextFunction
) => Promise<void> | void;

export type ErrorMiddleware = (
  error: any,
  req: AuthenticatedRequest,
  res: ApiResponse,
  next: NextFunction
) => Promise<void> | void;

// Route parameter types
export interface UserParams {
  userId: string;
}

export interface MenuParams {
  menuId: string;
  category?: 'veg' | 'non-veg';
  menuType?: string;
}

export interface OrderParams {
  orderId: string;
  userId?: string;
}

export interface AdminParams {
  adminId: string;
}

// Request body types for different endpoints
export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

export interface CreateMenuBody {
  category: 'veg' | 'non-veg';
  menuType: string;
  title: string;
  description: string;
  deliveryTime: string;
  priceMonthly: number;
  priceTrial: number;
  weeklyMenu: any;
  tags?: string[];
}

export interface UpdateMenuBody extends Partial<CreateMenuBody> {
  isActive?: boolean;
}

export interface CreateOrderBody {
  menuId: string;
  orderType: 'trial' | 'monthly';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  deliveryDate: string;
  specialInstructions?: string;
}

export interface UpdateOrderBody {
  status?: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  deliveryPersonId?: string;
  specialInstructions?: string;
}

export interface PaymentBody {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface ContactMessageBody {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface CreateSliderBody {
  title: string;
  description?: string;
  link?: string;
  order: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: 'all' | 'new-users' | 'existing-users';
}

export interface CreateCatalogBody {
  category: 'veg' | 'non-veg';
  items: Array<{
    name: string;
    description: string;
    price: number;
    preparationTime: string;
    tags: string[];
  }>;
}

export interface AdminCreateBody {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'moderator';
  permissions: string[];
}

export interface NotificationBody {
  userId?: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'delivery' | 'promotion' | 'system';
  data?: any;
  expiresAt?: string;
}

// Query parameter types
export interface MenuQueryParams extends IPaginationQuery, ISearchQuery {
  category?: 'veg' | 'non-veg';
  menuType?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface OrderQueryParams extends IPaginationQuery {
  userId?: string;
  status?: string;
  paymentStatus?: string;
  orderType?: 'trial' | 'monthly';
  startDate?: string;
  endDate?: string;
}

export interface UserQueryParams extends IPaginationQuery, ISearchQuery {
  role?: 'user' | 'admin' | 'delivery';
  isVerified?: boolean;
  isActive?: boolean;
}

export interface PaymentQueryParams extends IPaginationQuery {
  userId?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}

// File upload request types
export interface FileUploadRequest extends AuthenticatedRequest {
  file: Express.Multer.File;
}

export interface MultipleFileUploadRequest extends AuthenticatedRequest {
  files: Express.Multer.File[];
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Route configuration types
export interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  controller: Controller | AdminController | PaginatedController;
  middleware?: Middleware[];
  validation?: any;
  auth?: boolean;
  adminOnly?: boolean;
  permissions?: string[];
}

// API versioning types
export interface VersionedRoute {
  version: string;
  routes: RouteConfig[];
}

// Rate limiting types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// CORS configuration types
export interface CorsConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  optionsSuccessStatus: number;
}

// Security headers configuration
export interface SecurityConfig {
  contentSecurityPolicy: boolean;
  crossOriginEmbedderPolicy: boolean;
  crossOriginOpenerPolicy: boolean;
  crossOriginResourcePolicy: boolean;
  dnsPrefetchControl: boolean;
  frameguard: boolean;
  hidePoweredBy: boolean;
  hsts: boolean;
  ieNoOpen: boolean;
  noSniff: boolean;
  originAgentCluster: boolean;
  permittedCrossDomainPolicies: boolean;
  referrerPolicy: boolean;
  xssFilter: boolean;
}

// Server configuration types
export interface ServerConfig {
  port: number;
  host: string;
  cors: CorsConfig;
  security: SecurityConfig;
  rateLimit: RateLimitConfig;
  bodyParser: {
    json: { limit: string };
    urlencoded: { limit: string; extended: boolean };
  };
  compression: boolean;
  morgan: string;
}

// Health check response type
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database: {
    connected: boolean;
    collections: number;
    indexes: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  dependencies: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
  };
}

// Webhook types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
  signature: string;
}

export interface WebhookRequest extends Request {
  body: WebhookPayload;
  rawBody: Buffer;
}

// Cache types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  max: number; // Maximum number of items
  stale: boolean; // Allow stale data
}

export interface CacheKey {
  prefix: string;
  identifier: string;
  version?: string;
}

// Logger types
export interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  [key: string]: any;
}

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: LogContext;
  timestamp: Date;
  stack?: string;
}

// Background job types
export interface JobData {
  type: string;
  payload: any;
  options?: {
    delay?: number;
    attempts?: number;
    backoff?: string | number;
    priority?: number;
  };
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

// Email types
export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// SMS types
export interface SMSOptions {
  to: string;
  message: string;
  template?: string;
  variables?: { [key: string]: string };
}

// Push notification types
export interface PushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  badge?: number;
  sound?: string;
}