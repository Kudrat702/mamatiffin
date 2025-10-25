// // server.ts - PRODUCTION READY VERSION
// import express, { Express, Request, Response, NextFunction } from 'express';
// import dotenv from 'dotenv';
// import multer from 'multer';
// import cors from 'cors';
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

// const port: number = parseInt(process.env.PORT || '3000', 10);
// const app: Express = express();

// // Environment check
// const isProduction = process.env.NODE_ENV === 'production';
// const isDevelopment = !isProduction;

// console.log('🚀 Starting Mama Tiffin Server...');
// console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

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
//     // ✅ PRODUCTION - Explicit origins (NO environment variables dependency)
//     const origins = [
//       'https://mamatiffin.vercel.app',
//       'https://admin-mamatiffin.vercel.app',
//       'https://www.mamatiffin.vercel.app',
//     ];

//     console.log('🔒 Production CORS Origins:', origins);
//     return origins;
//   }
// };

// // server.ts - CORS section ko ye version se replace karo

// app.use(cors({
//   origin: (origin, callback) => {
//     const allowedOrigins = getAllowedOrigins();
    
//     console.log('🔍 CORS Check:', {
//       requestOrigin: origin || 'no-origin',
//       allowedOrigins,
//       isDevelopment
//     });
    
//     // Allow requests with no origin (Postman, mobile apps, curl)
//     if (!origin) {
//       console.log('✅ No origin header - allowing');
//       return callback(null, true);
//     }
    
//     // Normalize origins (remove trailing slashes)
//     const normalizedOrigin = origin.replace(/\/$/, '');
//     const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
//     // Development: Allow all localhost
//     if (isDevelopment) {
//       if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
//         console.log('✅ Dev origin allowed:', origin);
//         return callback(null, true);
//       }
//     }
    
//     // Production: Check whitelist
//     if (normalizedAllowed.includes(normalizedOrigin)) {
//       console.log('✅ Origin allowed:', origin);
//       return callback(null, true);
//     }
    
//     // BLOCKED
//     console.error('❌ CORS BLOCKED:', {
//       origin,
//       normalizedOrigin,
//       allowedOrigins: normalizedAllowed,
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
//   optionsSuccessStatus: 204, // Some legacy browsers choke on 200
//   preflightContinue: false
// }));

// console.log('✅ CORS Configuration Complete');
// console.log('📋 Allowed Origins:', getAllowedOrigins());

// // DATABASE CONNECTION
// console.log('🗄️ Connecting to database...');
// connectDB();

// // STATIC FILES SERVING
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//   maxAge: '1d',
//   etag: true,
//   setHeaders: (res) => {
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//   }
// }));

// // BASIC HEALTH AND CONFIG ENDPOINTS
// app.get('/api/config', configEndpoint);
// app.get('/api/health', healthEndpoint);

// // CORS TEST ENDPOINT
// app.get('/api/test-cors', (req: Request, res: Response): void => {
//   const origin = (req.headers.origin || '') as string;
//   const allowed = getAllowedOrigins();

//   // Normalize allowed origins to include both with/without trailing slash
//   const normalizedAllowed = Array.from(new Set([
//     ...allowed,
//     ...allowed.map(o => o.replace(/\/+$/, '')),
//     ...allowed.map(o => o.endsWith('/') ? o : `${o}/`)
//   ])).sort();

//   const originNormalized = origin.replace(/\/+$/, '');
//   const isOriginAllowed = !origin || normalizedAllowed.includes(origin) || normalizedAllowed.includes(originNormalized);

//   res.json({
//     success: true,
//     message: 'CORS is working correctly!',
//     debug: {
//       origin: origin || null,
//       originNormalized: originNormalized || null,
//       host: req.headers.host || null,
//       allowedOrigins: normalizedAllowed,
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
//       protocol: req.protocol
//     },
//     cors: {
//       enabled: true,
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins()
//     },
//     endpoints: {
//       health: '/api/health',
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

// // ERROR HANDLING MIDDLEWARE
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
//   if (error.name === 'MongoError' || error.name === 'MongooseError') {
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

// // 404 HANDLER - Route not found
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

// // GRACEFUL SHUTDOWN HANDLING
// process.on('SIGTERM', () => {
//   console.log('🛑 SIGTERM received. Shutting down gracefully...');
//   process.exit(0);
// });

// process.on('SIGINT', () => {
//   console.log('🛑 SIGINT received. Shutting down gracefully...');
//   process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//   console.error('🔥 Uncaught Exception:', error);
//   if (isProduction) {
//     process.exit(1);
//   }
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
//   if (isProduction) {
//     process.exit(1);
//   }
// });

// // ✅ START SERVER - RAILWAY COMPATIBLE
// app.listen(port, '0.0.0.0', (): void => {
//   console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
//   console.log('--------------------------------------------------');
//   console.log(`🚀 Server: http://0.0.0.0:${port}`);
//   console.log(`📖 API Docs: http://0.0.0.0:${port}/api`);
//   console.log('--------------------------------------------------');
//   console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
//   console.log(`✅ Port: ${port} ${isProduction ? '(Railway assigned)' : '(Local)'}`);
//   console.log(`✅ Host: 0.0.0.0 (All interfaces)`);
//   console.log(`✅ Trust Proxy: ${isProduction ? 'ENABLED' : 'DISABLED'}`);
//   console.log(`✅ CORS Origins: ${getAllowedOrigins().length} configured`);
//   console.log('✅ All routes registered successfully');
//   console.log('--------------------------------------------------\n');
// });

// export default app;

// server.ts - PRODUCTION READY VERSION (IMPROVED)
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db';
import locationRoutes from './routes/location.routes';
import authRoutes from './routes/authRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import sliderRoutes from './routes/slider';
import vegCatalogRoutes from './routes/vegCatalogRoutes';
import nonVegCatalogRoutes from './routes/nonVegCatalogRoutes';
import menuRoutes from './routes/menuDetailsRoutes';
import path from 'path';
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
}

const port: number = parseInt(process.env.PORT || '3000', 10);
const app: Express = express();

// ✅ APPLY SECURITY MIDDLEWARE FIRST
configureMiddleware(app);

// ✅ TRUST PROXY - CRITICAL FOR RAILWAY/PRODUCTION
if (isProduction) {
  app.set('trust proxy', 1);
  console.log('✅ Trust proxy enabled for production');
}

// ✅ PRODUCTION-READY CORS CONFIGURATION
console.log('🔧 Setting up CORS...');

const getAllowedOrigins = (): string[] => {
  if (isDevelopment) {
    return [
      'http://localhost:5173',
      'http://admin.localhost:5173',
      'http://127.0.0.1:5173',
      'http://admin.127.0.0.1:5173',
      'http://localhost:3000'
    ];
  } else {
    // ✅ PRODUCTION - Explicit origins
    const origins = [
      'https://mamatiffin.vercel.app',
      'https://admin-mamatiffin.vercel.app',
      'https://www.mamatiffin.vercel.app',
    ];

    console.log('🔒 Production CORS Origins:', origins);
    return origins;
  }
};

// ✅ IMPROVED CORS CONFIGURATION
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    console.log('🔍 CORS Check:', {
      requestOrigin: origin || 'no-origin',
      isDevelopment
    });
    
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) {
      console.log('✅ No origin header - allowing');
      return callback(null, true);
    }
    
    // Normalize and check origin
    const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
    const isAllowed = allowedOrigins.some(allowed => 
      normalizedOrigin === allowed.toLowerCase().replace(/\/$/, '')
    );
    
    // Development: Allow all localhost/127.0.0.1
    if (isDevelopment && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      console.log('✅ Dev origin allowed:', origin);
      return callback(null, true);
    }
    
    // Production: Check whitelist
    if (isAllowed) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    // BLOCKED
    console.error('❌ CORS BLOCKED:', {
      origin,
      normalizedOrigin,
      allowedOrigins,
      timestamp: new Date().toISOString()
    });
    
    callback(new Error('Not allowed by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization', 
    'x-access-token',
    'Cache-Control',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie'],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 204,
  preflightContinue: false
}));

console.log('✅ CORS Configuration Complete');
console.log('📋 Allowed Origins:', getAllowedOrigins());

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

// STATIC FILES SERVING
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

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
    
    res.status(200).json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        readyState: mongoose.connection.readyState
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
      timestamp: new Date().toISOString()
    }
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
        : 'Your domain is not whitelisted. Contact administrator.'
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
    console.log('--------------------------------------------------');
    console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
    console.log(`✅ Port: ${port} ${isProduction ? '(Railway assigned)' : '(Local)'}`);
    console.log(`✅ Host: 0.0.0.0 (All interfaces)`);
    console.log(`✅ Trust Proxy: ${isProduction ? 'ENABLED' : 'DISABLED'}`);
    console.log(`✅ CORS Origins: ${getAllowedOrigins().length} configured`);
    console.log(`✅ Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
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