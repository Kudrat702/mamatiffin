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

// ✅ DOMAIN MIDDLEWARE IMPORT
import { 
  domainMiddleware, 
  adminOnly, 
  configEndpoint,
  healthEndpoint 
} from './middleware/domainMiddleware';

import { configureMiddleware } from './middleware/appMiddleware';

// Load environment variables
dotenv.config();

// Environment check
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

console.log('🚀 Starting Mama Tiffin Server...');
console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

// Validate required environment variables
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
    // Development - Allow all local origins (both main and admin)
    return [
      // Main frontend URLs
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Admin subdomain URLs (for local development)
      'http://admin.localhost:5173',
      'http://admin.localhost:5174',
      'http://admin.localhost:5175',
      'http://admin.localhost:3000',
      'http://admin.localhost:3001',
      'http://admin.127.0.0.1:5173',
      'http://admin.127.0.0.1:5174',
      'http://admin.127.0.0.1:5175',
      'http://admin.127.0.0.1:3000',
      'http://admin.127.0.0.1:3001',
    ];
  } else {
    // Production - Explicit domains
    const origins = [
      'https://mamatiffin.vercel.app',
      'https://admin-mamatiffin.vercel.app',
      'https://www.mamatiffin.vercel.app',
      'https://www.admin-mamatiffin.vercel.app',
      // Production custom domains (if you have)
      'https://mamatiffin.com',
      'https://www.mamatiffin.com',
      'https://admin.mamatiffin.com',
    ];

    console.log('🔒 Production CORS Origins:', origins);
    return origins;
  }
};

// ✅ Helper function to check if origin is allowed
const isOriginAllowed = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow requests with no origin (Postman, mobile apps)

  const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '');
  const allowedOrigins = getAllowedOrigins();

  // Direct match
  const directMatch = allowedOrigins.some(allowed =>
    normalizedOrigin === allowed.toLowerCase().replace(/\/$/, '')
  );

  if (directMatch) return true;

  // Development: Allow all localhost/127.0.0.1 on any port
  if (isDevelopment && (
    normalizedOrigin.includes('localhost') || 
    normalizedOrigin.includes('127.0.0.1')
  )) {
    return true;
  }

  // Production: Allow all Vercel preview/deployment URLs
  if (isProduction && normalizedOrigin.includes('.vercel.app')) {
    console.log('✅ Vercel preview URL allowed:', origin);
    return true;
  }

  return false;
};

// ✅ IMPROVED CORS CONFIGURATION
app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 CORS Check:', {
      requestOrigin: origin || 'no-origin',
      isDevelopment,
      timestamp: new Date().toISOString()
    });
    
    if (isOriginAllowed(origin)) {
      console.log('✅ Origin allowed:', origin || 'no-origin');
      callback(null, true);
    } else {
      console.error('❌ CORS BLOCKED:', {
        origin,
        allowedOrigins: getAllowedOrigins(),
        isDevelopment,
        timestamp: new Date().toISOString()
      });
      callback(new Error('Not allowed by CORS policy'));
    }
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

// Handle preflight requests
app.options('*', cors());

console.log('✅ CORS Configuration Complete');
console.log('📋 Allowed Origins:', getAllowedOrigins());

// ✅ DOMAIN MIDDLEWARE - APPLY GLOBALLY TO DETECT ADMIN/USER
app.use(domainMiddleware);

// ✅ DATABASE CONNECTION WITH RETRY LOGIC
console.log('🗄️ Connecting to database...');

const connectWithRetry = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await connectDB();
      console.log('✅ Database connected successfully');
      console.log('📊 DB Status:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
      return;
    } catch (error: any) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        console.error('❌ All database connection attempts failed');
        if (isProduction) {
          console.error('⚠️  Exiting due to database connection failure in production');
          process.exit(1);
        }
      } else {
        console.log(`⏳ Retrying in 5 seconds... (${i + 2}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
};

connectWithRetry();

// STATIC FILES SERVING
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ✅ DOMAIN MIDDLEWARE ENDPOINTS
app.get('/api/config', configEndpoint);
app.get('/api/domain-health', healthEndpoint);

// ✅ RAILWAY STANDARD HEALTH CHECKS
app.get('/health', (req: Request, res: Response): void => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString() 
  });
});

app.get('/healthz', (req: Request, res: Response): void => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString() 
  });
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
        host: mongoose.connection.host || 'not connected'
      },
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: error.message
    });
  }
});

// ✅ CORS TEST ENDPOINT
app.get('/api/test-cors', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// ✅ CORS DEBUG ENDPOINT
app.get('/api/debug-cors', (req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'CORS Debug Information',
    request: {
      origin: req.headers.origin,
      host: req.headers.host,
      method: req.method,
      headers: req.headers
    },
    configuration: {
      allowedOrigins: getAllowedOrigins(),
      environment: isDevelopment ? 'development' : 'production',
      corsEnabled: true
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ API ROUTES - WITH ADMIN MIDDLEWARE PROTECTION
app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/slider', sliderRoutes);
app.use('/api/veg-catalog', vegCatalogRoutes);
app.use('/api/non-veg-catalog', nonVegCatalogRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/messages', messageRoutes);

// ✅ ADMIN ROUTES - PROTECTED WITH ADMIN MIDDLEWARE
app.use('/api/admin/orders', adminOnly, adminOrderRoutes);
app.use('/api/admin', adminOnly); // General admin protection

// ✅ API ROOT DOCUMENTATION
app.get('/api', (req: Request, res: Response): void => {
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({
    success: true,
    message: 'Mama Tiffin API Server',
    version: '3.0.0',
    domain: {
      isAdmin: req.isAdmin || false,
      userType: req.userType || 'user',
      hostname: req.get('host')
    },
    environment: {
      mode: isDevelopment ? 'development' : 'production',
      nodeVersion: process.version,
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
      health: '/health, /healthz, /api/health',
      domainHealth: '/api/domain-health',
      config: '/api/config',
      testCors: '/api/test-cors',
      debugCors: '/api/debug-cors',
      documentation: '/api',
      locations: '/api/locations',
      slider: '/api/slider',
      auth: '/api/auth',
      user: '/api/user',
      payments: '/api/payments',
      messages: '/api/messages',
      catalogs: '/api/veg-catalog, /api/non-veg-catalog',
      admin: '/api/admin/* (requires admin access)'
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
      solution: 'Check /api/debug-cors for detailed information',
      timestamp: timestamp
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

// ✅ 404 HANDLER
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
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  if (isProduction) {
    mongoose.connection.close().then(() => process.exit(1));
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  if (isProduction) {
    mongoose.connection.close().then(() => process.exit(1));
  }
});

// ✅ START SERVER - WORKS IN BOTH LOCAL & RAILWAY
const startServer = async () => {
  try {
    const server = app.listen(port, '0.0.0.0', (): void => {
      console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Backend API running at: http://localhost:${port}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Frontend URLs (Development)
      if (isDevelopment) {
        console.log('\n📱 FRONTEND URLs (Click to open):');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n👤 USER APP (Customer Interface):');
        console.log('   🌐 http://localhost:5173           ← Main user app');
        console.log('   🌐 http://127.0.0.1:5173');
        console.log('\n👑 ADMIN PANEL (Management Interface):');
        console.log('   🌐 http://admin.localhost:5173     ← Subdomain (Recommended ✅)');
        console.log('   🌐 http://localhost:5174           ← Different port');
        console.log('   🌐 http://127.0.0.1:5174');
        console.log('\n💡 TIP: Domain middleware will detect "admin" subdomain automatically!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } else {
        console.log('\n🌍 PRODUCTION URLs:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 USER APP:');
        console.log('   🌐 https://mamatiffin.vercel.app');
        console.log('   🌐 https://www.mamatiffin.vercel.app');
        console.log('\n👑 ADMIN PANEL:');
        console.log('   🌐 https://admin-mamatiffin.vercel.app');
        console.log('   🌐 https://admin.mamatiffin.com (if configured)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
      
      // API Endpoints
      console.log('\n🔗 API ENDPOINTS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📖 API Docs:        http://localhost:${port}/api`);
      console.log(`💚 Health Check:    http://localhost:${port}/health`);
      console.log(`🏥 Domain Health:   http://localhost:${port}/api/domain-health`);
      console.log(`⚙️  Config Info:     http://localhost:${port}/api/config`);
      console.log(`🔍 CORS Test:       http://localhost:${port}/api/test-cors`);
      console.log(`🐛 CORS Debug:      http://localhost:${port}/api/debug-cors`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Server Status
      console.log('\n⚙️  SERVER STATUS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Environment:     ${isDevelopment ? 'DEVELOPMENT 🏠' : 'PRODUCTION 🚀'}`);
      console.log(`✅ Port:            ${port}`);
      console.log(`✅ Host:            0.0.0.0 (All interfaces)`);
      console.log(`✅ Domain Detect:   ENABLED (Admin/User separation)`);
      console.log(`✅ Trust Proxy:     ${isProduction ? 'ENABLED' : 'DISABLED'}`);
      console.log(`✅ CORS Origins:    ${getAllowedOrigins().length} configured`);
      console.log(`✅ Database:        ${mongoose.connection.readyState === 1 ? 'Connected ✓' : 'Connecting... ⏳'}`);
      
      // Storage info
      const cloudinaryConfigured = !!(
        process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET
      );
      
      if (cloudinaryConfigured) {
        console.log('☁️  Image Storage:  Cloudinary (configured)');
      } else {
        console.log('📁 Image Storage:  Local file system');
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (isDevelopment) {
        console.log('\n💡 QUICK TEST COMMANDS:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   curl http://localhost:${port}/health`);
        console.log(`   curl http://localhost:${port}/api/test-cors`);
        console.log(`   curl http://localhost:${port}/api/config`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log('\n📝 HOW TO START FRONTEND:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   👤 USER APP:');
        console.log('      cd client && npm run dev');
        console.log('      Opens at: http://localhost:5173');
        console.log('\n   👑 ADMIN PANEL (Option 1 - Subdomain):');
        console.log('      cd admin && npm run dev');
        console.log('      Opens at: http://admin.localhost:5173');
        console.log('\n   👑 ADMIN PANEL (Option 2 - Different Port):');
        console.log('      cd admin && npm run dev -- --port 5174');
        console.log('      Opens at: http://localhost:5174');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log('\n🎯 DOMAIN MIDDLEWARE FEATURES:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   ✅ Auto-detects admin subdomain (admin.localhost)');
        console.log('   ✅ Sets req.isAdmin flag for all requests');
        console.log('   ✅ Adds X-Interface-Type header');
        console.log('   ✅ Protects /api/admin routes with adminOnly middleware');
        console.log('   ✅ Works in both development and production');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    });

    // Server error handling
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        console.error(`💡 Try: killall -9 node  or use a different port`);
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
};

// Start the server
startServer();

export default app;