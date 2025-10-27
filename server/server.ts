// server.ts - CLEAN VERSION
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import connectDB from './config/db';
import locationRoutes from './routes/location.routes';
import authRoutes from './routes/authRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import sliderRoutes from './routes/slider';
import vegCatalogRoutes from './routes/vegCatalogRoutes';
import nonVegCatalogRoutes from './routes/nonVegCatalogRoutes';
import menuRoutes from './routes/menuDetailsRoutes';
import uploadRoutes from './routes/uploadRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminOrderRoutes from './routes/adminOrderRoutes';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';

// Import domain middleware
import { 
  domainMiddleware, 
  adminOnly, 
  configEndpoint,
  healthEndpoint 
} from './middleware/domainMiddleware';

// Import configure middleware
import { configureMiddleware } from './middleware/appMiddleware';

dotenv.config();

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================
const port: number = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;
const INTERFACE_TYPE = (process.env.INTERFACE_TYPE || 'user').toLowerCase(); // 'user' or 'admin'

const app: Express = express();

// ✅ TRUST PROXY - CRITICAL FOR RAILWAY/PRODUCTION (BEFORE MIDDLEWARE)
if (isProduction) {
  app.set('trust proxy', 1);
}

// ✅ APPLY SECURITY MIDDLEWARE
configureMiddleware(app);

// ✅ ENHANCED CORS CONFIGURATION
const getAllowedOrigins = (): string[] => {
  if (isDevelopment) {
    return [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      'http://admin.localhost:5173',
      'http://admin.127.0.0.1:5173'
    ];
  } else {
    const origins = [
      'https://mamatiffin.vercel.app',
      'https://www.mamatiffin.vercel.app',
      'https://admin-mamatiffin.vercel.app',
      'https://www.admin-mamatiffin.vercel.app',
    ];

    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }
    if (process.env.ADMIN_FRONTEND_URL) {
      origins.push(process.env.ADMIN_FRONTEND_URL);
    }

    return origins;
  }
};

// ✅ CORS OPTIONS
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    // 1. Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    
    // 2. Normalize origin (remove trailing slash, lowercase)
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
    
    // 3. Development mode - Allow all localhost and 127.0.0.1
    if (isDevelopment) {
      if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // 4. Check against whitelist
    const isAllowed = allowedOrigins.some(allowed => 
      normalizedOrigin === allowed.toLowerCase().replace(/\/$/, '')
    );
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    // 5. BLOCKED
    console.error('❌ CORS BLOCKED:', origin);
    callback(new Error('Not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-access-token',
    'X-Auth-Token',
    'Cache-Control',
    'X-CSRF-Token',
    'x-client-id',
    'x-api-key'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Set-Cookie',
    'Authorization'
  ],
  maxAge: 86400,
  optionsSuccessStatus: 204,
  preflightContinue: false
};

// Apply CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ ADDITIONAL CORS HEADERS MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  if (!origin || 
      allowedOrigins.some(allowed => 
        origin.toLowerCase().replace(/\/$/, '') === allowed.toLowerCase().replace(/\/$/, '')
      ) ||
      (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1')))
  ) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, X-Auth-Token, Cache-Control, X-CSRF-Token');
    res.header('Access-Control-Expose-Headers', 
      'Content-Range, X-Content-Range, Set-Cookie, Authorization');
  }
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// ✅ DATABASE CONNECTION
connectDB()
  .then(() => console.log('✅ Database Connected'))
  .catch((error) => {
    console.error('❌ Database Error:', error.message);
    if (isProduction) {
      process.exit(1);
    }
  });

// ✅ REQUEST LOGGING MIDDLEWARE
app.use((req: Request, res: Response, next: NextFunction) => {
  const logPrefix = INTERFACE_TYPE === 'admin' ? '🔧' : '📱';
  console.log(`${logPrefix} ${req.method} ${req.path}`);
  next();
});

// ============================================
// STATIC FILES - ONLY IN DEVELOPMENT OR IF EXPLICITLY ENABLED
// ============================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (isDevelopment || process.env.SERVE_STATIC_FILES === 'true') {
  app.use('/uploads', express.static(uploadsDir));
}

// ============================================
// HEALTH & UTILITY ENDPOINTS
// ============================================

// Simple health endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Detailed health endpoint
app.get('/api/health', healthEndpoint);

// Configuration endpoint
app.get('/api/config', configEndpoint);

// Interface status endpoint
app.get('/api/interface-status', (req: Request, res: Response) => {
  res.json({
    success: true,
    interface: INTERFACE_TYPE,
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/api/test-cors', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'CORS is working correctly',
    origin: req.headers.origin || 'no-origin',
    timestamp: new Date().toISOString()
  });
});

// Debug CORS endpoint
app.get('/api/debug-cors', (req: Request, res: Response) => {
  res.json({
    success: true,
    cors: {
      requestOrigin: req.headers.origin || 'no-origin',
      allowedOrigins: getAllowedOrigins(),
      corsEnabled: true,
      credentials: true
    },
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Storage info endpoint
app.get('/api/storage-info', (req: Request, res: Response) => {
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    success: true,
    storage: {
      cloudinary: {
        configured: cloudinaryConfigured,
        cloudName: cloudinaryConfigured ? process.env.CLOUDINARY_CLOUD_NAME : null
      },
      local: {
        enabled: isDevelopment || process.env.SERVE_STATIC_FILES === 'true',
        uploadsPath: '/uploads'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API ROUTES WITH DOMAIN MIDDLEWARE
// ============================================
app.use('/api/locations', domainMiddleware, locationRoutes);
app.use('/api/auth', domainMiddleware, authRoutes);
app.use('/api/admin/auth', domainMiddleware, adminAuthRoutes);
app.use('/api/slider', domainMiddleware, sliderRoutes);
app.use('/api/veg-menus', domainMiddleware, vegCatalogRoutes);
app.use('/api/non-veg-menus', domainMiddleware, nonVegCatalogRoutes);
app.use('/api/menus', domainMiddleware, menuRoutes);
app.use('/api/upload', domainMiddleware, uploadRoutes);
app.use('/api/payments', domainMiddleware, paymentRoutes);
app.use('/api/admin/orders', domainMiddleware, adminOnly, adminOrderRoutes);
app.use('/api/user', domainMiddleware, userRoutes);
app.use('/api/messages', domainMiddleware, messageRoutes);

// API documentation
app.get('/api', (req: Request, res: Response) => {
  const host = req.headers.host;
  const protocol = req.protocol;
  
  res.json({
    success: true,
    message: 'Mama Tiffin API',
    version: '1.0.0',
    interface: INTERFACE_TYPE,
    server: {
      environment: isDevelopment ? 'development' : 'production',
      host: req.headers.host,
      protocol: req.protocol,
      uptime: Math.floor(process.uptime())
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    },
    endpoints: {
      health: '/api/health',
      simpleHealth: '/health',
      config: '/api/config',
      interfaceStatus: '/api/interface-status',
      testCors: '/api/test-cors',
      debugCors: '/api/debug-cors',
      storageInfo: '/api/storage-info',
      locations: '/api/locations'
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
app.use((error: any, req: Request, res: Response, _next: NextFunction): void => {
  console.error('❌ Error:', error.message);
  
  // CORS Error
  if (error.message === 'Not allowed by CORS policy') {
    res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: 'CORS_ORIGIN_NOT_ALLOWED',
      origin: req.headers.origin
    });
    return;
  }
  
  // Multer File Upload Errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB.',
        error: 'FILE_SIZE_LIMIT_EXCEEDED'
      });
      return;
    }
  }

  // Generic Server Error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req: Request, res: Response): void => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    error: 'ROUTE_NOT_FOUND',
    path: req.path,
    method: req.method
  });
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  mongoose.connection.close();
  process.exit(0);
});

// ============================================
// START SERVER - CLEAN OUTPUT
// ============================================
try {
  const server = app.listen(port, HOST, (): void => {
    console.clear();
    console.log('\n🚀 SERVER STARTED');
    console.log('📱 User:  http://localhost:3000');
    console.log('🔧 Admin: http://admin.localhost:5173');
    console.log('💚 Health: http://localhost:3000/health\n');
  });

  // Server error handling
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} already in use`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });

} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

export default app;