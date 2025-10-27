// // server.ts - PRODUCTION READY VERSION (IMPROVED)
// import express, { Express, Request, Response, NextFunction } from 'express';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import connectDB from './config/db';
// import locationRoutes from './routes/location.routes';
// import authRoutes from './routes/authRoutes';
// import adminAuthRoutes from './routes/adminAuthRoutes';
// import sliderRoutes from './routes/slider';
// import vegCatalogRoutes from './routes/vegCatalogRoutes';
// import nonVegCatalogRoutes from './routes/nonVegCatalogRoutes';
// import menuRoutes from './routes/menuDetailsRoutes';
// import path from 'path';
// import uploadRoutes from './routes/uploadRoutes';
// import paymentRoutes from './routes/paymentRoutes';
// import adminOrderRoutes from './routes/adminOrderRoutes';
// import userRoutes from './routes/userRoutes';
// import messageRoutes from './routes/messageRoutes';

// // Import domain middleware
// import { 
//   domainMiddleware, 
//   adminOnly, 
//   configEndpoint,
//   healthEndpoint 
// } from './middleware/domainMiddleware';

// // Import configure middleware
// import { configureMiddleware } from './middleware/appMiddleware';

// dotenv.config();

// // Environment check
// const isProduction = process.env.NODE_ENV === 'production';
// const isDevelopment = !isProduction;

// console.log('🚀 Starting Mama Tiffin Server...');
// console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

// // ✅ VALIDATE REQUIRED ENVIRONMENT VARIABLES
// const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];

// if (isProduction) {
//   const missing = requiredEnvVars.filter(key => !process.env[key]);
//   if (missing.length > 0) {
//     console.error('❌ Missing required environment variables:', missing);
//     console.error('⚠️  Server cannot start without these variables');
//     process.exit(1);
//   }
//   console.log('✅ All required environment variables present');
// }

// const port: number = parseInt(process.env.PORT || '3000', 10);
// const app: Express = express();

// // ✅ APPLY SECURITY MIDDLEWARE FIRST
// configureMiddleware(app);

// // ✅ TRUST PROXY - CRITICAL FOR RAILWAY/PRODUCTION
// if (isProduction) {
//   app.set('trust proxy', 1);
//   console.log('✅ Trust proxy enabled for production');
// }

// // ✅ PRODUCTION-READY CORS CONFIGURATION
// console.log('🔧 Setting up CORS...');

// const getAllowedOrigins = (): string[] => {
//   if (isDevelopment) {
//     return [
//       'http://localhost:5173',
//       'http://admin.localhost:5173',
//       'http://127.0.0.1:5173',
//       'http://admin.127.0.0.1:5173',
//       'http://localhost:3000'
//     ];
//   } else {
//     // ✅ PRODUCTION - Explicit origins
//     const origins = [
//       'https://mamatiffin.vercel.app',
//       'https://admin-mamatiffin.vercel.app',
//       'https://www.mamatiffin.vercel.app',
//     ];

//     console.log('🔒 Production CORS Origins:', origins);
//     return origins;
//   }
// };

// // ✅ IMPROVED CORS CONFIGURATION
// app.use(cors({
//   origin: (origin, callback) => {
//     const allowedOrigins = getAllowedOrigins();
    
//     console.log('🔍 CORS Check:', {
//       requestOrigin: origin || 'no-origin',
//       isDevelopment
//     });
    
//     // Allow requests with no origin (Postman, mobile apps, curl)
//     if (!origin) {
//       console.log('✅ No origin header - allowing');
//       return callback(null, true);
//     }
    
//     // Normalize and check origin
//     const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
//     const isAllowed = allowedOrigins.some(allowed => 
//       normalizedOrigin === allowed.toLowerCase().replace(/\/$/, '')
//     );
    
//     // Development: Allow all localhost/127.0.0.1
//     if (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
//       console.log('✅ Dev origin allowed:', origin);
//       return callback(null, true);
//     }
    
//     // Production: Check whitelist
//     if (isAllowed) {
//       console.log('✅ Origin allowed:', origin);
//       return callback(null, true);
//     }
    
//     // BLOCKED
//     console.error('❌ CORS BLOCKED:', {
//       origin,
//       normalizedOrigin,
//       allowedOrigins,
//       timestamp: new Date().toISOString()
//     });
    
//     callback(new Error('Not allowed by CORS policy'));
//   },
//   credentials: true,
//   methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: [
//     'Origin', 
//     'X-Requested-With', 
//     'Content-Type', 
//     'Accept', 
//     'Authorization', 
//     'x-access-token',
//     'Cache-Control',
//     'X-CSRF-Token'
//   ],
//   exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie'],
//   maxAge: 86400, // 24 hours
//   optionsSuccessStatus: 204,
//   preflightContinue: false
// }));

// console.log('✅ CORS Configuration Complete');
// console.log('📋 Allowed Origins:', getAllowedOrigins());

// // ✅ DATABASE CONNECTION WITH ERROR HANDLING
// console.log('🗄️ Connecting to database...');
// connectDB()
//   .then(() => {
//     console.log('✅ Database connected successfully');
//     console.log('📊 DB Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
//   })
//   .catch((error) => {
//     console.error('❌ Database connection failed:', error.message);
//     if (isProduction) {
//       console.error('⚠️  Exiting due to database connection failure in production');
//       process.exit(1);
//     }
//   });

// // STATIC FILES SERVING
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//   maxAge: '1d',
//   etag: true,
//   setHeaders: (res) => {
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   }
// }));

// // ✅ RAILWAY STANDARD HEALTH CHECKS
// app.get('/health', (req: Request, res: Response): void => {
//   res.status(200).send('OK');
// });

// app.get('/healthz', (req: Request, res: Response): void => {
//   res.status(200).send('OK');
// });

// // ✅ DETAILED HEALTH CHECK WITH DB STATUS
// app.get('/api/health', async (req: Request, res: Response) => {
//   try {
//     const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
//     const memoryUsage = process.memoryUsage();
    
//     res.status(200).json({
//       success: true,
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//       uptime: Math.floor(process.uptime()),
//       database: {
//         status: dbStatus,
//         readyState: mongoose.connection.readyState
//       },
//       memory: {
//         heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
//         heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
//         rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
//       },
//       environment: isDevelopment ? 'development' : 'production',
//       version: '2.0.0'
//     });
//   } catch (error) {
//     res.status(503).json({
//       success: false,
//       status: 'error',
//       message: 'Service unavailable',
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// // BASIC CONFIG ENDPOINT
// app.get('/api/config', configEndpoint);

// // ✅ IMPROVED CORS TEST ENDPOINT
// app.get('/api/test-cors', (req: Request, res: Response): void => {
//   const origin = (req.headers.origin || '') as string;
//   const allowed = getAllowedOrigins();
//   const originNormalized = origin.toLowerCase().replace(/\/$/, '');
//   const isOriginAllowed = !origin || allowed.some(o => 
//     o.toLowerCase().replace(/\/$/, '') === originNormalized
//   );

//   res.json({
//     success: true,
//     message: 'CORS is working correctly!',
//     debug: {
//       origin: origin || null,
//       host: req.headers.host || null,
//       allowedOrigins: allowed,
//       isOriginAllowed,
//       environment: isDevelopment ? 'development' : 'production',
//       timestamp: new Date().toISOString()
//     }
//   });
// });

// // ✅ ROUTES SETUP - PROPER ORDER
// console.log('🛣️ Setting up application routes...');

// // ORDER ROUTES - Highest priority
// console.log('📦 Setting up order routes...');
// app.use('/api/orders', adminOrderRoutes);
// console.log('✅ Order routes registered');

// // PAYMENT ROUTES
// console.log('💳 Setting up payment routes...');
// app.use('/api/payments', paymentRoutes);
// console.log('✅ Payment routes registered');

// // MESSAGE ROUTES
// console.log('📧 Setting up message routes...');
// app.use('/api/messages', messageRoutes);
// console.log('✅ Message routes registered');

// // USER ROUTES
// console.log('👤 Setting up user routes...');
// app.use('/api/user', userRoutes);
// console.log('✅ User routes registered');

// // UPLOAD ROUTES
// console.log('📤 Setting up upload routes...');
// app.use('/api/upload', uploadRoutes);
// console.log('✅ Upload routes registered');

// // CATALOG ROUTES
// console.log('🥗 Setting up catalog routes...');
// app.use('/api/veg/catalog', vegCatalogRoutes);
// app.use('/api/non-veg/catalog', nonVegCatalogRoutes);
// console.log('✅ Catalog routes registered');

// // ADMIN AUTH ROUTES
// console.log('🔐 Setting up admin auth routes...');
// app.use('/admin-auth', domainMiddleware, adminAuthRoutes);
// console.log('✅ Admin auth routes registered');

// // ADMIN-ONLY ROUTES
// app.use('/api/admin', domainMiddleware, adminOnly, (req: Request, res: Response): void => {
//   res.json({
//     success: true,
//     message: 'Admin area accessible',
//     interface: req.isAdmin ? 'admin' : 'user',
//     timestamp: new Date().toISOString()
//   });
// });

// // PUBLIC API ROUTES
// console.log('🌐 Setting up public API routes...');
// app.use('/api/locations', locationRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/slider', sliderRoutes);

// // MENU ROUTES - MUST BE LAST (most generic)
// console.log('📋 Setting up menu routes...');
// app.use('/api', menuRoutes);
// console.log('✅ Menu routes registered');

// console.log('✅ All routes configured successfully');

// // API DOCUMENTATION ENDPOINT
// app.get('/api', (req: Request, res: Response): void => {
//   res.json({
//     success: true,
//     message: 'Mama Tiffin API Server',
//     version: '2.0.0',
//     environment: isDevelopment ? 'development' : 'production',
//     server: {
//       port: port,
//       host: req.headers.host,
//       protocol: req.protocol,
//       uptime: Math.floor(process.uptime())
//     },
//     database: {
//       status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
//     },
//     cors: {
//       enabled: true,
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins()
//     },
//     endpoints: {
//       health: '/api/health',
//       simpleHealth: '/health',
//       config: '/api/config',
//       testCors: '/api/test-cors',
//       orders: '/api/orders',
//       payments: '/api/payments',
//       messages: '/api/messages',
//       user: '/api/user',
//       auth: '/api/auth',
//       slider: '/api/slider',
//       locations: '/api/locations'
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// // ✅ ERROR HANDLING MIDDLEWARE
// app.use((error: any, req: Request, res: Response, _next: NextFunction): void => {
//   const timestamp = new Date().toISOString();
  
//   console.error(`[${timestamp}] Server Error:`, {
//     message: error.message,
//     url: req.url,
//     method: req.method,
//     origin: req.headers.origin,
//     stack: isDevelopment ? error.stack : undefined
//   });
  
//   // CORS Error
//   if (error.message === 'Not allowed by CORS policy') {
//     res.status(403).json({
//       success: false,
//       message: 'CORS policy violation',
//       error: 'CORS_ORIGIN_NOT_ALLOWED',
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins(),
//       hint: isDevelopment 
//         ? 'All localhost should be allowed in development' 
//         : 'Your domain is not whitelisted. Contact administrator.'
//     });
//     return;
//   }
  
//   // Multer File Upload Errors
//   if (error instanceof multer.MulterError) {
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       res.status(400).json({
//         success: false,
//         message: 'File size too large. Maximum 5MB.',
//         error: 'FILE_SIZE_LIMIT_EXCEEDED'
//       });
//       return;
//     }
    
//     if (error.code === 'LIMIT_FILE_COUNT') {
//       res.status(400).json({
//         success: false,
//         message: 'Too many files. Maximum 10 files allowed.',
//         error: 'FILE_COUNT_LIMIT_EXCEEDED'
//       });
//       return;
//     }
//   }

//   // JSON Syntax Errors
//   if (error instanceof SyntaxError && 'body' in error) {
//     res.status(400).json({
//       success: false,
//       message: 'Invalid JSON format',
//       error: 'INVALID_JSON_SYNTAX'
//     });
//     return;
//   }

//   // Database Errors
//   if (error.name === 'MongoError' || error.name === 'MongooseError' || error.name === 'MongoServerError') {
//     res.status(503).json({
//       success: false,
//       message: 'Database connection error',
//       error: 'DATABASE_ERROR'
//     });
//     return;
//   }

//   // Generic Server Error
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error',
//     error: 'INTERNAL_SERVER_ERROR',
//     details: isDevelopment ? error.message : 'Something went wrong',
//     timestamp: timestamp
//   });
// });

// // ✅ 404 HANDLER - Route not found
// app.use((req: Request, res: Response): void => {
//   console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  
//   res.status(404).json({
//     success: false,
//     message: 'API endpoint not found',
//     error: 'ROUTE_NOT_FOUND',
//     path: req.path,
//     method: req.method,
//     suggestions: [
//       'Check /api for documentation',
//       'Verify HTTP method',
//       'Ensure correct URL format'
//     ],
//     timestamp: new Date().toISOString()
//   });
// });

// // ✅ GRACEFUL SHUTDOWN HANDLING
// process.on('SIGTERM', () => {
//   console.log('🛑 SIGTERM received. Shutting down gracefully...');
//   mongoose.connection.close();
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   console.log('🛑 SIGINT received. Shutting down gracefully...');
//   mongoose.connection.close();
//   process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//   console.error('🔥 Uncaught Exception:', error);
//   if (isProduction) {
//     mongoose.connection.close();
//     process.exit(1);
//   }
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
//   if (isProduction) {
//     mongoose.connection.close();
//     process.exit(1);
//   }
// });

// // ✅ START SERVER - RAILWAY COMPATIBLE WITH ERROR HANDLING
// try {
//   const server = app.listen(port, '0.0.0.0', (): void => {
//     console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
//     console.log('--------------------------------------------------');
//     console.log(`🚀 Server: http://0.0.0.0:${port}`);
//     console.log(`📖 API Docs: http://0.0.0.0:${port}/api`);
//     console.log(`💚 Health Check: http://0.0.0.0:${port}/api/health`);
//     console.log('--------------------------------------------------');
//     console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
//     console.log(`✅ Port: ${port} ${isProduction ? '(Railway assigned)' : '(Local)'}`);
//     console.log(`✅ Host: 0.0.0.0 (All interfaces)`);
//     console.log(`✅ Trust Proxy: ${isProduction ? 'ENABLED' : 'DISABLED'}`);
//     console.log(`✅ CORS Origins: ${getAllowedOrigins().length} configured`);
//     console.log(`✅ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
//     console.log('✅ All routes registered successfully');
//     console.log('--------------------------------------------------\n');
//   });

//   // Server error handling
//   server.on('error', (error: any) => {
//     if (error.code === 'EADDRINUSE') {
//       console.error(`❌ Port ${port} is already in use`);
//       process.exit(1);
//     } else {
//       console.error('❌ Server error:', error);
//       process.exit(1);
//     }
//   });

// } catch (error) {
//   console.error('❌ Failed to start server:', error);
//   process.exit(1);
// }

// export default app;

// server.ts - PRODUCTION READY VERSION WITH CLOUDINARY SUPPORT
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

// Environment check
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

console.log('🚀 Starting Mama Tiffin Server...');
console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

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

const port: number = parseInt(process.env.PORT || '3000', 10);
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
      'https://mamatiffin-3tmdz9s87-mdkudratullah77-3420s-projects.vercel.app',
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
    console.log('✅ Static files serving enabled for /uploads');
    console.log(`📂 Uploads directory: ${uploadsPath}`);
  } else {
    console.log('⚠️  Uploads directory not found, skipping static file serving');
    console.log('💡 This is normal if using Cloudinary for all images');
  }
} else {
  console.log('☁️  Production mode: Images served from Cloudinary');
  console.log('📁 Local static file serving: DISABLED');
}

// ✅ RAILWAY STANDARD HEALTH CHECKS
app.get('/health', (req: Request, res: Response): void => {
  res.status(200).send('OK');
});

app.get('/healthz', (req: Request, res: Response): void => {
  res.status(200).send('OK');
});

// ✅ DETAILED HEALTH CHECK WITH DB STATUS
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const memoryUsage = process.memoryUsage();
    
    // Check Cloudinary configuration
    const cloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState
      },
      storage: {
        cloudinary: cloudinaryConfigured ? 'configured' : 'not-configured',
        staticFiles: isDevelopment || process.env.SERVE_STATIC_FILES === 'true' ? 'enabled' : 'disabled'
      },
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      },
      environment: isDevelopment ? 'development' : 'production',
      version: '2.0.0'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'error',
      message: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// BASIC CONFIG ENDPOINT
app.get('/api/config', configEndpoint);

// ✅ IMPROVED CORS TEST ENDPOINT
app.get('/api/test-cors', (req: Request, res: Response): void => {
  const origin = (req.headers.origin || '') as string;
  const allowed = getAllowedOrigins();
  const originNormalized = origin.toLowerCase().replace(/\/$/, '');
  const isOriginAllowed = !origin || allowed.some(o => 
    o.toLowerCase().replace(/\/$/, '') === originNormalized
  );

  res.json({
    success: true,
    message: 'CORS is working correctly!',
    debug: {
      origin: origin || null,
      host: req.headers.host || null,
      allowedOrigins: allowed,
      isOriginAllowed,
      environment: isDevelopment ? 'development' : 'production',
      timestamp: new Date().toISOString(),
      headers: {
        'access-control-allow-origin': res.getHeader('access-control-allow-origin'),
        'access-control-allow-credentials': res.getHeader('access-control-allow-credentials'),
      }
    }
  });
});

// ✅ DEBUG ENDPOINT FOR CORS TROUBLESHOOTING
app.get('/api/debug-cors', (req: Request, res: Response) => {
  res.json({
    requestHeaders: req.headers,
    origin: req.headers.origin,
    host: req.headers.host,
    method: req.method,
    allowedOrigins: getAllowedOrigins(),
    environment: isDevelopment ? 'development' : 'production',
    isProduction,
    isDevelopment,
    corsEnabled: true,
    cloudinaryConfigured: !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    ),
    timestamp: new Date().toISOString()
  });
});

// ✅ STORAGE INFO ENDPOINT
app.get('/api/storage-info', (req: Request, res: Response) => {
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
  
  const uploadsPath = path.join(__dirname, 'uploads');
  const uploadsExists = fs.existsSync(uploadsPath);
  
  res.json({
    success: true,
    storage: {
      mode: isProduction ? 'production' : 'development',
      cloudinary: {
        configured: cloudinaryConfigured,
        enabled: isProduction && cloudinaryConfigured
      },
      local: {
        directory: uploadsPath,
        exists: uploadsExists,
        serving: isDevelopment || process.env.SERVE_STATIC_FILES === 'true'
      }
    },
    recommendation: cloudinaryConfigured 
      ? 'Using Cloudinary for image storage' 
      : 'Using local file system for image storage',
    timestamp: new Date().toISOString()
  });
});

// ✅ ROUTES SETUP - PROPER ORDER
console.log('🛣️ Setting up application routes...');

// ORDER ROUTES - Highest priority
console.log('📦 Setting up order routes...');
app.use('/api/orders', adminOrderRoutes);
console.log('✅ Order routes registered');

// PAYMENT ROUTES
console.log('💳 Setting up payment routes...');
app.use('/api/payments', paymentRoutes);
console.log('✅ Payment routes registered');

// MESSAGE ROUTES
console.log('📧 Setting up message routes...');
app.use('/api/messages', messageRoutes);
console.log('✅ Message routes registered');

// USER ROUTES
console.log('👤 Setting up user routes...');
app.use('/api/user', userRoutes);
console.log('✅ User routes registered');

// UPLOAD ROUTES
console.log('📤 Setting up upload routes...');
app.use('/api/upload', uploadRoutes);
console.log('✅ Upload routes registered');

// CATALOG ROUTES
console.log('🥗 Setting up catalog routes...');
app.use('/api/veg/catalog', vegCatalogRoutes);
app.use('/api/non-veg/catalog', nonVegCatalogRoutes);
console.log('✅ Catalog routes registered');

// ADMIN AUTH ROUTES
console.log('🔐 Setting up admin auth routes...');
app.use('/admin-auth', domainMiddleware, adminAuthRoutes);
console.log('✅ Admin auth routes registered');

// ADMIN-ONLY ROUTES
app.use('/api/admin', domainMiddleware, adminOnly, (req: Request, res: Response): void => {
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

// ✅ START SERVER - RAILWAY COMPATIBLE WITH ERROR HANDLING
try {
  const server = app.listen(port, '0.0.0.0', (): void => {
    console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
    console.log('--------------------------------------------------');
    console.log(`🚀 Server: http://0.0.0.0:${port}`);
    console.log(`📖 API Docs: http://0.0.0.0:${port}/api`);
    console.log(`💚 Health Check: http://0.0.0.0:${port}/api/health`);
    console.log(`🔍 CORS Test: http://0.0.0.0:${port}/api/test-cors`);
    console.log(`🐛 CORS Debug: http://0.0.0.0:${port}/api/debug-cors`);
    console.log(`📦 Storage Info: http://0.0.0.0:${port}/api/storage-info`);
    console.log('--------------------------------------------------');
    console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
    console.log(`✅ Port: ${port} ${isProduction ? '(Railway assigned)' : '(Local)'}`);
    console.log(`✅ Host: 0.0.0.0 (All interfaces)`);
    console.log(`✅ Trust Proxy: ${isProduction ? 'ENABLED' : 'DISABLED'}`);
    console.log(`✅ CORS Origins: ${getAllowedOrigins().length} configured`);
    console.log(`✅ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
    
    // Storage info
    const cloudinaryConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );
    
    if (cloudinaryConfigured) {
      console.log('☁️  Image Storage: Cloudinary (configured)');
    } else {
      console.log('📁 Image Storage: Local file system');
    }
    
    if (isDevelopment || process.env.SERVE_STATIC_FILES === 'true') {
      console.log('✅ Static file serving: ENABLED');
    } else {
      console.log('🚫 Static file serving: DISABLED');
    }
    
    console.log('✅ All routes registered successfully');
    console.log('--------------------------------------------------\n');
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