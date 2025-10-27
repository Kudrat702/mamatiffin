// server.ts - PRODUCTION READY VERSION WITH INTERFACE_TYPE CONTROL
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

// ============================================
// STARTUP BANNER WITH INTERFACE TYPE
// ============================================
console.log('\n' + '='.repeat(70));
console.log('🚀 MAMA TIFFIN SERVER STARTING...');
console.log('='.repeat(70));
console.log(`📦 Environment     : ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
console.log(`🎯 Interface Type  : ${INTERFACE_TYPE.toUpperCase()}`);
console.log(`🔌 Port           : ${port}`);
console.log(`🏠 Host           : ${HOST}`);
console.log(`⏰ Started At     : ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
console.log('='.repeat(70) + '\n');

// ✅ VALIDATE REQUIRED ENVIRONMENT VARIABLES
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

if (isProduction) {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('⚠️  Server cannot start without these variables');
    process.exit(1);
  }
  console.log('✅ All required environment variables present');
  
  // Check Cloudinary configuration
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log('☁️  Cloudinary configuration detected');
  } else {
    console.log('⚠️  Cloudinary not configured - local storage will be used');
  }
}

const app: Express = express();

// ✅ TRUST PROXY - CRITICAL FOR RAILWAY/PRODUCTION (BEFORE MIDDLEWARE)
if (isProduction) {
  app.set('trust proxy', 1);
  console.log('✅ Trust proxy enabled for production');
}

// ✅ APPLY SECURITY MIDDLEWARE
configureMiddleware(app);

// ✅ ENHANCED CORS CONFIGURATION
console.log('🔧 Setting up CORS...');

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
    // ✅ PRODUCTION - Add ALL possible domain variations
    const origins = [
      'https://mamatiffin.vercel.app',
      'https://www.mamatiffin.vercel.app',
      'https://admin-mamatiffin.vercel.app',
      'https://www.admin-mamatiffin.vercel.app',
    ];

    // Add custom environment variable origins if provided
    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }
    if (process.env.ADMIN_FRONTEND_URL) {
      origins.push(process.env.ADMIN_FRONTEND_URL);
    }

    console.log('🔒 Production CORS Origins:', origins);
    return origins;
  }
};

// ✅ CORS OPTIONS
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = getAllowedOrigins();
    
    console.log('🔍 CORS Check:', {
      requestOrigin: origin || 'no-origin',
      timestamp: new Date().toISOString(),
      isDevelopment
    });
    
    // 1. Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
    if (!origin) {
      console.log('✅ No origin header - allowing (mobile/native app or tool)');
      return callback(null, true);
    }
    
    // 2. Normalize origin (remove trailing slash, lowercase)
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
    
    // 3. Development mode - Allow all localhost and 127.0.0.1
    if (isDevelopment) {
      if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
        console.log('✅ Dev origin allowed:', origin);
        return callback(null, true);
      }
    }
    
    // 4. Check against whitelist
    const isAllowed = allowedOrigins.some(allowed => 
      normalizedOrigin === allowed.toLowerCase().replace(/\/$/, '')
    );
    
    if (isAllowed) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    // 5. BLOCKED - Log detailed info
    console.error('❌ CORS BLOCKED:', {
      origin,
      normalizedOrigin,
      allowedOrigins,
      isDevelopment,
      timestamp: new Date().toISOString()
    });
    
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
  maxAge: 86400, // 24 hours - cache preflight requests
  optionsSuccessStatus: 204,
  preflightContinue: false
};

// Apply CORS
app.use(cors(corsOptions));

// ✅ HANDLE PREFLIGHT REQUESTS EXPLICITLY
app.options('*', cors(corsOptions));

console.log('✅ CORS Configuration Complete');
console.log('📋 Allowed Origins:', getAllowedOrigins());

// ✅ ADDITIONAL CORS HEADERS MIDDLEWARE (Belt and suspenders approach)
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();
  
  // Check if origin is allowed
  if (!origin || 
      allowedOrigins.some(allowed => 
        origin.toLowerCase().replace(/\/$/, '') === allowed.toLowerCase().replace(/\/$/, '')
      ) ||
      (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1')))
  ) {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, X-Auth-Token, Cache-Control, X-CSRF-Token');
    res.header('Access-Control-Expose-Headers', 
      'Content-Range, X-Content-Range, Set-Cookie, Authorization');
  }
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
});

// ✅ DATABASE CONNECTION WITH ERROR HANDLING
console.log('🗄️ Connecting to database...');
connectDB()
  .then(() => {
    console.log('✅ Database connected successfully');
    console.log('📊 DB Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    if (isProduction) {
      console.error('⚠️  Exiting due to database connection failure in production');
      process.exit(1);
    }
  });

// ✅ STATIC FILES SERVING - CONDITIONAL FOR DEVELOPMENT/HYBRID MODE
if (isDevelopment || process.env.SERVE_STATIC_FILES === 'true') {
  console.log('📁 Setting up static files serving...');
  
  const uploadsPath = path.join(__dirname, 'uploads');
  
  // Check if uploads directory exists
  if (fs.existsSync(uploadsPath)) {
    app.use('/uploads', express.static(uploadsPath, {
      maxAge: isDevelopment ? '0' : '1d', // No cache in dev, 1 day in prod
      etag: true,
      setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }));
    console.log('✅ Static uploads directory configured:', uploadsPath);
  } else {
    console.log('⚠️  Uploads directory not found - will be created on first upload');
  }
} else {
  console.log('🚫 Static file serving disabled (production mode - use Cloudinary)');
}

// ============================================
// DOMAIN MIDDLEWARE - ALWAYS ACTIVE
// ============================================
app.use(domainMiddleware); 

// ============================================
// INTERFACE TYPE OVERRIDE MIDDLEWARE
// ============================================
app.use((req: Request, res: Response, next: NextFunction) => {
  // Override interface type based on environment variable
  if (INTERFACE_TYPE === 'admin') {
    req.isAdmin = true;
    req.userType = 'admin';
    res.setHeader('X-Interface-Type', 'admin');
  } else if (INTERFACE_TYPE === 'user') {
    req.isAdmin = false;
    req.userType = 'user';
    res.setHeader('X-Interface-Type', 'user');
  }
  next();
});

// ============================================
// HEALTH & CONFIG ENDPOINTS
// ============================================
console.log('🏥 Setting up health endpoints...');

// Simple health check (no auth required)
app.get('/health', healthEndpoint);
app.get('/api/health', healthEndpoint);

// Config endpoint with interface info
app.get('/api/config', configEndpoint);

// Interface status endpoint
app.get('/api/interface-status', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Interface status',
    data: {
      interfaceType: INTERFACE_TYPE,
      isAdmin: req.isAdmin || false,
      userType: req.userType || 'user',
      environment: isDevelopment ? 'development' : 'production',
      timestamp: new Date().toISOString()
    }
  });
});

console.log('✅ Health endpoints configured');

// ============================================
// CORS DEBUG ENDPOINTS
// ============================================
app.get('/api/test-cors', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/debug-cors', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'CORS Debug Information',
    data: {
      requestOrigin: req.headers.origin,
      allowedOrigins: getAllowedOrigins(),
      environment: isDevelopment ? 'development' : 'production',
      corsEnabled: true,
      credentials: true,
      headers: {
        received: Object.keys(req.headers),
        origin: req.headers.origin,
        host: req.headers.host,
        userAgent: req.headers['user-agent']
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Storage configuration endpoint
app.get('/api/storage-info', (req: Request, res: Response): void => {
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({
    success: true,
    message: 'Storage configuration',
    data: {
      cloudinary: {
        configured: cloudinaryConfigured,
        cloudName: cloudinaryConfigured ? process.env.CLOUDINARY_CLOUD_NAME : null
      },
      localStorage: {
        enabled: isDevelopment || process.env.SERVE_STATIC_FILES === 'true',
        path: '/uploads'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================
// PROTECTED ROUTES
// ============================================
console.log('🔐 Setting up protected routes...');

// ADMIN ROUTES
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/veg-catalog', adminOnly, vegCatalogRoutes);
app.use('/api/non-veg-catalog', adminOnly, nonVegCatalogRoutes);
app.use('/api/orders', adminOnly, adminOrderRoutes);
app.use('/api/admin/upload', adminOnly, uploadRoutes);

// USER ROUTES (Protected)
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);

console.log('✅ Protected routes configured');

// ============================================
// TEST ENDPOINTS FOR INTERFACE
// ============================================
app.get('/api/user/dashboard', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'User Dashboard',
    data: {
      interface: 'user',
      isAdmin: req.isAdmin || false,
      userType: req.userType || 'user',
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/admin/dashboard', adminOnly, (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Admin Dashboard',
    data: {
      interface: 'admin',
      isAdmin: req.isAdmin || false,
      userType: req.userType || 'admin',
      timestamp: new Date().toISOString()
    }
  });
});

// Admin area test
app.get('/admin', adminOnly, (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Admin area accessible',
    interface: req.isAdmin ? 'admin' : 'user',
    timestamp: new Date().toISOString()
  });
});

// PUBLIC API ROUTES
console.log('🌐 Setting up public API routes...');
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/slider', sliderRoutes);

// MENU ROUTES - MUST BE LAST (most generic)
console.log('📋 Setting up menu routes...');
app.use('/api', menuRoutes);
console.log('✅ Menu routes registered');

console.log('✅ All routes configured successfully');

// API DOCUMENTATION ENDPOINT
app.get('/api', (req: Request, res: Response): void => {
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({
    success: true,
    message: 'Mama Tiffin API Server',
    version: '2.0.0',
    environment: isDevelopment ? 'development' : 'production',
    interfaceType: INTERFACE_TYPE,
    server: {
      port: port,
      host: req.headers.host,
      protocol: req.protocol,
      uptime: Math.floor(process.uptime())
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    },
    storage: {
      cloudinary: cloudinaryConfigured ? 'configured' : 'not-configured',
      staticFiles: isDevelopment || process.env.SERVE_STATIC_FILES === 'true' ? 'enabled' : 'disabled'
    },
    cors: {
      enabled: true,
      origin: req.headers.origin,
      allowedOrigins: getAllowedOrigins()
    },
    endpoints: {
      health: '/api/health',
      simpleHealth: '/health',
      config: '/api/config',
      interfaceStatus: '/api/interface-status',
      testCors: '/api/test-cors',
      debugCors: '/api/debug-cors',
      storageInfo: '/api/storage-info',
      orders: '/api/orders',
      payments: '/api/payments',
      messages: '/api/messages',
      user: '/api/user',
      auth: '/api/auth',
      slider: '/api/slider',
      locations: '/api/locations'
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ ERROR HANDLING MIDDLEWARE
app.use((error: any, req: Request, res: Response, _next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] Server Error:`, {
    message: error.message,
    url: req.url,
    method: req.method,
    origin: req.headers.origin,
    stack: isDevelopment ? error.stack : undefined
  });
  
  // CORS Error
  if (error.message === 'Not allowed by CORS policy') {
    res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      error: 'CORS_ORIGIN_NOT_ALLOWED',
      origin: req.headers.origin,
      allowedOrigins: getAllowedOrigins(),
      hint: isDevelopment 
        ? 'All localhost should be allowed in development' 
        : 'Your domain is not whitelisted. Contact administrator.',
      solution: 'Check /api/debug-cors for detailed information'
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
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.',
        error: 'FILE_COUNT_LIMIT_EXCEEDED'
      });
      return;
    }
  }

  // JSON Syntax Errors
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      error: 'INVALID_JSON_SYNTAX'
    });
    return;
  }

  // Database Errors
  if (error.name === 'MongoError' || error.name === 'MongooseError' || error.name === 'MongoServerError') {
    res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: 'DATABASE_ERROR'
    });
    return;
  }

  // Generic Server Error
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_SERVER_ERROR',
    details: isDevelopment ? error.message : 'Something went wrong',
    timestamp: timestamp
  });
});

// ✅ 404 HANDLER - Route not found
app.use((req: Request, res: Response): void => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    error: 'ROUTE_NOT_FOUND',
    path: req.path,
    method: req.method,
    suggestions: [
      'Check /api for documentation',
      'Verify HTTP method',
      'Ensure correct URL format'
    ],
    timestamp: new Date().toISOString()
  });
});

// ✅ GRACEFUL SHUTDOWN HANDLING
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  if (isProduction) {
    mongoose.connection.close();
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  if (isProduction) {
    mongoose.connection.close();
    process.exit(1);
  }
});

// ============================================
// START SERVER WITH CLICKABLE LINKS
// ============================================
try {
  const server = app.listen(port, HOST, (): void => {
    const localUrl = `http://localhost:${port}`;
    const networkUrl = `http://${HOST}:${port}`;
    
    console.log('\n' + '✅'.repeat(35));
    console.log('\n🎉 SERVER STARTED SUCCESSFULLY!\n');
    console.log('='.repeat(70));
    
    // Interface-specific banner
    if (INTERFACE_TYPE === 'admin') {
      console.log('👑 ADMIN INTERFACE MODE');
      console.log('='.repeat(70));
      console.log(`\n🔗 Admin Portal: ${localUrl}`);
      console.log(`🔗 Network:      ${networkUrl}`);
    } else {
      console.log('👤 USER INTERFACE MODE');
      console.log('='.repeat(70));
      console.log(`\n🔗 User Portal: ${localUrl}`);
      console.log(`🔗 Network:     ${networkUrl}`);
    }
    
    console.log('\n📚 API ENDPOINTS:');
    console.log('='.repeat(70));
    console.log(`📖 API Docs:        ${localUrl}/api`);
    console.log(`💚 Health Check:    ${localUrl}/health`);
    console.log(`⚙️  Config:          ${localUrl}/api/config`);
    console.log(`🎯 Interface:       ${localUrl}/api/interface-status`);
    console.log(`🔍 CORS Test:       ${localUrl}/api/test-cors`);
    console.log(`🐛 CORS Debug:      ${localUrl}/api/debug-cors`);
    console.log(`📦 Storage Info:    ${localUrl}/api/storage-info`);
    
    console.log('\n⚙️  SERVER CONFIGURATION:');
    console.log('='.repeat(70));
    console.log(`✅ Environment:     ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
    console.log(`✅ Interface Type:  ${INTERFACE_TYPE.toUpperCase()}`);
    console.log(`✅ Port:            ${port}`);
    console.log(`✅ Host:            ${HOST}`);
    console.log(`✅ Trust Proxy:     ${isProduction ? 'ENABLED' : 'DISABLED'}`);
    console.log(`✅ CORS Origins:    ${getAllowedOrigins().length} configured`);
    console.log(`✅ Database:        ${mongoose.connection.readyState === 1 ? 'Connected ✓' : 'Connecting...'}`);
    
    // Storage info
    const cloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );
    
    if (cloudinaryConfigured) {
      console.log('☁️  Image Storage:   Cloudinary (configured)');
    } else {
      console.log('📁 Image Storage:   Local file system');
    }
    
    if (isDevelopment || process.env.SERVE_STATIC_FILES === 'true') {
      console.log('✅ Static Files:    ENABLED');
    } else {
      console.log('🚫 Static Files:    DISABLED');
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('💡 TIP: Click on the links above to open in browser');
    console.log('='.repeat(70));
    console.log('\n✅'.repeat(35) + '\n');
  });

  // Server error handling
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use`);
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