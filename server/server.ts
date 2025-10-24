// // server.ts - FIXED VERSION - ROUTE ORDERING CORRECTED
// import express, { Express, Request, Response, NextFunction } from 'express';
// import dotenv from 'dotenv';
// // import helmet from 'helmet'; // Unused in server.ts, used in middleware
// import multer from 'multer';
// import cors from 'cors';
// import connectDB from './config/db';
// import locationRoutes from './routes/location.routes';
// import authRoutes from './routes/authRoutes';
// // import rateLimit from 'express-rate-limit'; // Unused in server.ts, used in middleware
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

// const port: number = 3000;
// const app: Express = express();

// // Environment check
// const isProduction = process.env.NODE_ENV === 'production';
// const isDevelopment = !isProduction;

// console.log('🚀 Starting Mama Tiffin Server...');
// console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

// // ✅ APPLY SECURITY MIDDLEWARE FIRST
// configureMiddleware(app);

// // TRUST PROXY for production
// if (isProduction) {
//   app.set('trust proxy', 1);
//   console.log('✅ Trust proxy enabled for production');
// }

// // Define allowed origins for CORS
// const getAllowedOrigins = (): string[] => {
//   if (isDevelopment) {
//     return [
//       'http://localhost:5173',
//       'http://admin.localhost:5173',
//       'http://127.0.0.1:5173',
//       'http://admin.127.0.0.1:5173',
//       'http://localhost:3000',
//       'http://admin.localhost:3000'
//     ];
//   } else {
//     return [
//       'https://yourdomain.com',
//       'https://admin.yourdomain.com',
//       'https://www.yourdomain.com',
//       'https://mamatiffin.com',
//       'https://admin.mamatiffin.com'
//     ];
//   }
// };

// // CORS MIDDLEWARE - Enhanced with proper error handling
// console.log('🔧 Setting up CORS...');
// app.use(cors({
//   origin: (origin, callback) => {
//     const allowedOrigins = getAllowedOrigins();
    
//     // Allow requests with no origin (mobile apps, postman, curl)
//     if (!origin) {
//       return callback(null, true);
//     }
    
//     // Check if origin is in allowed list
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('Not allowed by CORS policy'));
//     }
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
//     'Cache-Control'
//   ],
//   maxAge: 86400, // 24 hours
//   optionsSuccessStatus: 200
// }));
// console.log('✅ CORS setup complete');

// // DATABASE CONNECTION
// console.log('🗄️ Connecting to database...');
// connectDB();

// // STATIC FILES SERVING
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//   maxAge: '1d',
//   etag: true
// }));

// // BASIC HEALTH AND CONFIG ENDPOINTS (No domain middleware needed)
// app.get('/api/config', configEndpoint);
// app.get('/api/health', healthEndpoint);

// // CORS TEST ENDPOINT (No domain middleware needed)
// app.get('/api/test-cors', (req: Request, res: Response): void => {
//   res.json({
//     success: true,
//     message: 'CORS is working correctly!',
//     debug: {
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins(),
//       timestamp: new Date().toISOString(),
//       userAgent: req.headers['user-agent']
//     }
//   });
// });

// // ✅ ROUTES SETUP - CRITICAL: PROPER ORDER AND REGISTRATION
// console.log('🛣️ Setting up application routes...');

// // ✅ MOST SPECIFIC ROUTES FIRST

// // ORDER ROUTES - Critical for admin dashboard - MUST BE FIRST
// console.log('📦 Setting up order routes...');
// app.use('/api/orders', adminOrderRoutes);
// console.log('✅ Order routes registered successfully');

// // PAYMENT ROUTES
// console.log('💳 Setting up payment routes...');
// app.use('/api/payments', paymentRoutes);
// console.log('✅ Payment routes registered successfully');

// // MESSAGE ROUTES
// console.log('📧 Setting up message routes...');
// app.use('/api/messages', messageRoutes);
// console.log('✅ Message routes registered successfully');

// // USER ROUTES
// console.log('👤 Setting up user routes...');
// app.use('/api/user', userRoutes);
// console.log('✅ User routes registered successfully');

// // UPLOAD ROUTES
// console.log('📤 Setting up upload routes...');
// app.use('/api/upload', uploadRoutes);
// console.log('✅ Upload routes registered successfully');

// // SPECIFIC CATALOG ROUTES
// console.log('🥗 Setting up catalog routes...');
// app.use('/api/veg/catalog', vegCatalogRoutes);
// app.use('/api/non-veg/catalog', nonVegCatalogRoutes);
// console.log('✅ Catalog routes registered successfully');

// // ADMIN AUTH ROUTES - Apply domain middleware only to admin-auth
// console.log('🔐 Setting up admin auth routes...');
// app.use('/admin-auth', domainMiddleware, adminAuthRoutes);
// console.log('✅ Admin auth routes registered successfully');

// // ADMIN-ONLY ROUTES - Apply domain middleware + adminOnly
// app.use('/api/admin', domainMiddleware, adminOnly, (req: Request, res: Response): void => {
//   const domainInfo = (req as any).domainInfo;
//   res.json({
//     success: true,
//     message: 'Admin area accessible',
//     interface: domainInfo?.isAdmin ? 'admin' : 'user',
//     timestamp: new Date().toISOString(),
//     availableEndpoints: [
//       '/api/admin/dashboard',
//       '/api/admin/users',
//       '/api/admin/reports'
//     ]
//   });
// });

// // OTHER PUBLIC API ROUTES
// console.log('🌐 Setting up public API routes...');
// app.use('/api/locations', locationRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/slider', sliderRoutes);

// // MENU ROUTES - MOST GENERIC, MUST BE LAST
// console.log('📋 Setting up menu routes...');
// app.use('/api', menuRoutes); // This catches /api/menus/:diet/:category
// console.log('✅ Menu routes registered successfully');

// console.log('✅ All routes configured successfully');

// // ✅ ROUTE DEBUG ENDPOINT - SHOWS ALL REGISTERED ROUTES
// app.get('/api/debug-routes', (_req: Request, res: Response): void => {
//   const routes: any[] = [];
  
//   app._router.stack.forEach((middleware: any) => {
//     if (middleware.route) {
//       routes.push({
//         path: middleware.route.path,
//         methods: Object.keys(middleware.route.methods)
//       });
//     } else if (middleware.name === 'router') {
//       const routerName = middleware.regexp.source;
//       middleware.handle.stack.forEach((handler: any) => {
//         if (handler.route) {
//           let basePath = '';
//           if (routerName.includes('orders')) basePath = '/api/orders';
//           else if (routerName.includes('messages')) basePath = '/api/messages';
//           else if (routerName.includes('payments')) basePath = '/api/payments';
//           else if (routerName.includes('user')) basePath = '/api/user';
//           else if (routerName.includes('upload')) basePath = '/api/upload';
//           else if (routerName.includes('veg')) basePath = '/api/veg/catalog';
//           else if (routerName.includes('non-veg')) basePath = '/api/non-veg/catalog';
          
//           const fullPath = basePath + handler.route.path;
//           routes.push({
//             path: fullPath,
//             methods: Object.keys(handler.route.methods),
//             router: basePath || 'unknown'
//           });
//         }
//       });
//     }
//   });
  
//   res.json({
//     success: true,
//     message: 'Registered routes debug info',
//     totalRoutes: routes.length,
//     routes: routes,
//     orderRoutesRegistered: routes.some(r => r.router === '/api/orders'),
//     messageRoutesRegistered: routes.some(r => r.router === '/api/messages'),
//     paymentRoutesRegistered: routes.some(r => r.router === '/api/payments'),
//     timestamp: new Date().toISOString()
//   });
// });

// // API DOCUMENTATION ENDPOINT
// app.get('/api', (req: Request, res: Response): void => {
//   res.json({
//     success: true,
//     message: 'Mama Tiffin API Server',
//     version: '2.0.0',
//     environment: isDevelopment ? 'development' : 'production',
//     cors: {
//       enabled: true,
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins()
//     },
//     availableRoutes: {
//       orders: [
//         'GET /api/orders/statistics',
//         'GET /api/orders/new',
//         'GET /api/orders/old',
//         'GET /api/orders/skip-orders',
//         'GET /api/orders/final-delivery',
//         'GET /api/orders/export-final-delivery',
//         'GET /api/orders/customer/:phone',
//         'PATCH /api/orders/:id/status',
//         'GET /api/orders/:id',
//         'GET /api/orders'
//       ],
//       public: [
//         'GET /api/health',
//         'GET /api/config',
//         'GET /api/test-cors',
//         'POST /api/auth/signin',
//         'POST /api/auth/signup',
//         'GET /api/locations',
//         'GET /api/slider',
//         'GET /api/veg/catalog',
//         'GET /api/non-veg/catalog',
//         'GET /api/menus/:diet/:category',
//         'POST /api/payments/create-order',
//         'POST /api/payments/verify',
//         'GET /api/payments/status/:orderId',
//         'POST /api/messages',
//         'GET /api/messages',
//         'GET /api/messages/:id'
//       ],
//       admin: [
//         'POST /admin-auth',
//         'GET /api/admin/*'
//       ]
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// // ENHANCED ERROR HANDLING MIDDLEWARE
// app.use((error: any, req: Request, res: Response, _next: NextFunction): void => {
//   const timestamp = new Date().toISOString();
//   console.error(`[${timestamp}] Server Error:`, {
//     message: error.message,
//     stack: isDevelopment ? error.stack : undefined,
//     url: req.url,
//     method: req.method,
//     origin: req.headers.origin
//   });
  
//   // CORS Error
//   if (error.message === 'Not allowed by CORS policy') {
//     res.status(403).json({
//       success: false,
//       message: 'CORS policy violation - Origin not allowed',
//       error: 'CORS_ORIGIN_NOT_ALLOWED',
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins(),
//       hint: 'Please contact administrator to whitelist your domain'
//     });
//     return;
//   }
  
//   // Multer File Upload Errors
//   if (error instanceof multer.MulterError) {
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       res.status(400).json({
//         success: false,
//         message: 'File size too large. Maximum allowed size is 5MB.',
//         error: 'FILE_SIZE_LIMIT_EXCEEDED',
//         maxSize: '5MB'
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
//       message: 'Invalid JSON format in request body',
//       error: 'INVALID_JSON_SYNTAX'
//     });
//     return;
//   }

//   // Database Connection Errors
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
//     details: isDevelopment ? error.message : 'Something went wrong on our end',
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
//       'Check the API documentation at /api',
//       'Use /api/debug-routes to see all registered routes',
//       'Verify the HTTP method (GET, POST, PUT, DELETE)',
//       'Ensure proper URL formatting',
//       'Check for typos in the endpoint'
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
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

// // START SERVER
// app.listen(port, (): void => {
//   console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
//   console.log('--------------------------------------------------');
//   console.log(`🚀 Server: http://localhost:${port}`);
//   console.log(`🌐 User: http://localhost:5173`);
//   console.log(`👑 Admin: http://admin.localhost:5173`);
//   console.log(`📖 API: http://localhost:${port}/api`);
//   // console.log(`🔍 Debug Routes: http://localhost:${port}/api/debug-routes`);
//   // console.log(`📦 Orders: http://localhost:${port}/api/orders`);
//   // console.log(`📧 Messages: http://localhost:${port}/api/messages`);
//   // console.log('--------------------------------------------------');
//   // console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
//   // console.log('✅ Order routes registered first (highest priority)');
//   // console.log('✅ Payment routes accessible without domain restriction');
//   // console.log('✅ Message routes registered and accessible');
// });

// export default app;

// // server.ts - FIXED VERSION - ROUTE ORDERING CORRECTED
// import express, { Express, Request, Response, NextFunction } from 'express';
// import dotenv from 'dotenv';
// // import helmet from 'helmet'; // Unused in server.ts, used in middleware
// import multer from 'multer';
// import cors from 'cors';
// import connectDB from './config/db';
// import locationRoutes from './routes/location.routes';
// import authRoutes from './routes/authRoutes';
// // import rateLimit from 'express-rate-limit'; // Unused in server.ts, used in middleware
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

// const port: number = 3000;
// const app: Express = express();

// // Environment check
// const isProduction = process.env.NODE_ENV === 'production';
// const isDevelopment = !isProduction;

// console.log('🚀 Starting Mama Tiffin Server...');
// console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

// // ✅ APPLY SECURITY MIDDLEWARE FIRST
// configureMiddleware(app);

// // TRUST PROXY for production
// if (isProduction) {
//   app.set('trust proxy', 1);
//   console.log('✅ Trust proxy enabled for production');
// }

// // Define allowed origins for CORS
// const getAllowedOrigins = (): string[] => {
//   if (isDevelopment) {
//     return [
//       'http://localhost:5173',
//       'http://admin.localhost:5173',
//       'http://127.0.0.1:5173',
//       'http://admin.127.0.0.1:5173',
//       'http://localhost:3000',
//       'http://admin.localhost:3000'
//     ];
//   } else {
//     return [
//       'https://yourdomain.com',
//       'https://admin.yourdomain.com',
//       'https://www.yourdomain.com',
//       'https://mamatiffin.com',
//       'https://admin.mamatiffin.com'
//     ];
//   }
// };

// // CORS MIDDLEWARE - Enhanced with proper error handling
// console.log('🔧 Setting up CORS...');
// app.use(cors({
//   origin: (origin, callback) => {
//     const allowedOrigins = getAllowedOrigins();
    
//     // Allow requests with no origin (mobile apps, postman, curl)
//     if (!origin) {
//       return callback(null, true);
//     }
    
//     // Check if origin is in allowed list
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('Not allowed by CORS policy'));
//     }
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
//     'Cache-Control'
//   ],
//   maxAge: 86400, // 24 hours
//   optionsSuccessStatus: 200
// }));
// console.log('✅ CORS setup complete');

// // DATABASE CONNECTION
// console.log('🗄️ Connecting to database...');
// connectDB();

// // STATIC FILES SERVING
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
//   maxAge: '1d',
//   etag: true
// }));

// // BASIC HEALTH AND CONFIG ENDPOINTS (No domain middleware needed)
// app.get('/api/config', configEndpoint);
// app.get('/api/health', healthEndpoint);

// // CORS TEST ENDPOINT (No domain middleware needed)
// app.get('/api/test-cors', (req: Request, res: Response): void => {
//   res.json({
//     success: true,
//     message: 'CORS is working correctly!',
//     debug: {
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins(),
//       timestamp: new Date().toISOString(),
//       userAgent: req.headers['user-agent']
//     }
//   });
// });

// // ✅ ROUTES SETUP - CRITICAL: PROPER ORDER AND REGISTRATION
// console.log('🛣️ Setting up application routes...');

// // ✅ MOST SPECIFIC ROUTES FIRST

// // ORDER ROUTES - Critical for admin dashboard - MUST BE FIRST
// console.log('📦 Setting up order routes...');
// app.use('/api/orders', adminOrderRoutes);
// console.log('✅ Order routes registered successfully');

// // PAYMENT ROUTES
// console.log('💳 Setting up payment routes...');
// app.use('/api/payments', paymentRoutes);
// console.log('✅ Payment routes registered successfully');

// // MESSAGE ROUTES
// console.log('📧 Setting up message routes...');
// app.use('/api/messages', messageRoutes);
// console.log('✅ Message routes registered successfully');

// // USER ROUTES
// console.log('👤 Setting up user routes...');
// app.use('/api/user', userRoutes);
// console.log('✅ User routes registered successfully');

// // UPLOAD ROUTES
// console.log('📤 Setting up upload routes...');
// app.use('/api/upload', uploadRoutes);
// console.log('✅ Upload routes registered successfully');

// // SPECIFIC CATALOG ROUTES
// console.log('🥗 Setting up catalog routes...');
// app.use('/api/veg/catalog', vegCatalogRoutes);
// app.use('/api/non-veg/catalog', nonVegCatalogRoutes);
// console.log('✅ Catalog routes registered successfully');

// // ADMIN AUTH ROUTES - Apply domain middleware only to admin-auth
// console.log('🔐 Setting up admin auth routes...');
// app.use('/admin-auth', domainMiddleware, adminAuthRoutes);
// console.log('✅ Admin auth routes registered successfully');

// // ADMIN-ONLY ROUTES - Apply domain middleware + adminOnly
// app.use('/api/admin', domainMiddleware, adminOnly, (req: Request, res: Response): void => {
//   const domainInfo = (req as any).domainInfo;
//   res.json({
//     success: true,
//     message: 'Admin area accessible',
//     interface: domainInfo?.isAdmin ? 'admin' : 'user',
//     timestamp: new Date().toISOString(),
//     availableEndpoints: [
//       '/api/admin/dashboard',
//       '/api/admin/users',
//       '/api/admin/reports'
//     ]
//   });
// });

// // OTHER PUBLIC API ROUTES
// console.log('🌐 Setting up public API routes...');
// app.use('/api/locations', locationRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/slider', sliderRoutes);

// // MENU ROUTES - MOST GENERIC, MUST BE LAST
// console.log('📋 Setting up menu routes...');
// app.use('/api', menuRoutes); // This catches /api/menus/:diet/:category
// console.log('✅ Menu routes registered successfully');

// console.log('✅ All routes configured successfully');

// // ✅ ROUTE DEBUG ENDPOINT - SHOWS ALL REGISTERED ROUTES
// app.get('/api/debug-routes', (_req: Request, res: Response): void => {
//   const routes: any[] = [];
  
//   app._router.stack.forEach((middleware: any) => {
//     if (middleware.route) {
//       routes.push({
//         path: middleware.route.path,
//         methods: Object.keys(middleware.route.methods)
//       });
//     } else if (middleware.name === 'router') {
//       const routerName = middleware.regexp.source;
//       middleware.handle.stack.forEach((handler: any) => {
//         if (handler.route) {
//           let basePath = '';
//           if (routerName.includes('orders')) basePath = '/api/orders';
//           else if (routerName.includes('messages')) basePath = '/api/messages';
//           else if (routerName.includes('payments')) basePath = '/api/payments';
//           else if (routerName.includes('user')) basePath = '/api/user';
//           else if (routerName.includes('upload')) basePath = '/api/upload';
//           else if (routerName.includes('veg')) basePath = '/api/veg/catalog';
//           else if (routerName.includes('non-veg')) basePath = '/api/non-veg/catalog';
          
//           const fullPath = basePath + handler.route.path;
//           routes.push({
//             path: fullPath,
//             methods: Object.keys(handler.route.methods),
//             router: basePath || 'unknown'
//           });
//         }
//       });
//     }
//   });
  
//   res.json({
//     success: true,
//     message: 'Registered routes debug info',
//     totalRoutes: routes.length,
//     routes: routes,
//     orderRoutesRegistered: routes.some(r => r.router === '/api/orders'),
//     messageRoutesRegistered: routes.some(r => r.router === '/api/messages'),
//     paymentRoutesRegistered: routes.some(r => r.router === '/api/payments'),
//     timestamp: new Date().toISOString()
//   });
// });

// // API DOCUMENTATION ENDPOINT
// app.get('/api', (req: Request, res: Response): void => {
//   res.json({
//     success: true,
//     message: 'Mama Tiffin API Server',
//     version: '2.0.0',
//     environment: isDevelopment ? 'development' : 'production',
//     cors: {
//       enabled: true,
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins()
//     },
//     availableRoutes: {
//       orders: [
//         'GET /api/orders/statistics',
//         'GET /api/orders/new',
//         'GET /api/orders/old',
//         'GET /api/orders/skip-orders',
//         'GET /api/orders/final-delivery',
//         'GET /api/orders/export-final-delivery',
//         'GET /api/orders/customer/:phone',
//         'PATCH /api/orders/:id/status',
//         'GET /api/orders/:id',
//         'GET /api/orders'
//       ],
//       public: [
//         'GET /api/health',
//         'GET /api/config',
//         'GET /api/test-cors',
//         'POST /api/auth/signin',
//         'POST /api/auth/signup',
//         'GET /api/locations',
//         'GET /api/slider',
//         'GET /api/veg/catalog',
//         'GET /api/non-veg/catalog',
//         'GET /api/menus/:diet/:category',
//         'POST /api/payments/create-order',
//         'POST /api/payments/verify',
//         'GET /api/payments/status/:orderId',
//         'POST /api/messages',
//         'GET /api/messages',
//         'GET /api/messages/:id'
//       ],
//       admin: [
//         'POST /admin-auth',
//         'GET /api/admin/*'
//       ]
//     },
//     timestamp: new Date().toISOString()
//   });
// });

// // ENHANCED ERROR HANDLING MIDDLEWARE
// app.use((error: any, req: Request, res: Response, _next: NextFunction): void => {
//   const timestamp = new Date().toISOString();
//   console.error(`[${timestamp}] Server Error:`, {
//     message: error.message,
//     stack: isDevelopment ? error.stack : undefined,
//     url: req.url,
//     method: req.method,
//     origin: req.headers.origin
//   });
  
//   // CORS Error
//   if (error.message === 'Not allowed by CORS policy') {
//     res.status(403).json({
//       success: false,
//       message: 'CORS policy violation - Origin not allowed',
//       error: 'CORS_ORIGIN_NOT_ALLOWED',
//       origin: req.headers.origin,
//       allowedOrigins: getAllowedOrigins(),
//       hint: 'Please contact administrator to whitelist your domain'
//     });
//     return;
//   }
  
//   // Multer File Upload Errors
//   if (error instanceof multer.MulterError) {
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       res.status(400).json({
//         success: false,
//         message: 'File size too large. Maximum allowed size is 5MB.',
//         error: 'FILE_SIZE_LIMIT_EXCEEDED',
//         maxSize: '5MB'
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
//       message: 'Invalid JSON format in request body',
//       error: 'INVALID_JSON_SYNTAX'
//     });
//     return;
//   }

//   // Database Connection Errors
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
//     details: isDevelopment ? error.message : 'Something went wrong on our end',
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
//       'Check the API documentation at /api',
//       'Use /api/debug-routes to see all registered routes',
//       'Verify the HTTP method (GET, POST, PUT, DELETE)',
//       'Ensure proper URL formatting',
//       'Check for typos in the endpoint'
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
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
//   process.exit(1);
// });

// // START SERVER
// app.listen(port, (): void => {
//   console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
//   console.log('--------------------------------------------------');
//   console.log(`🚀 Server: http://localhost:${port}`);
//   console.log(`🌐 User: http://localhost:5173`);
//   console.log(`👑 Admin: http://admin.localhost:5173`);
//   console.log(`📖 API: http://localhost:${port}/api`);
//   // console.log(`🔍 Debug Routes: http://localhost:${port}/api/debug-routes`);
//   // console.log(`📦 Orders: http://localhost:${port}/api/orders`);
//   // console.log(`📧 Messages: http://localhost:${port}/api/messages`);
//   // console.log('--------------------------------------------------');
//   // console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
//   // console.log('✅ Order routes registered first (highest priority)');
//   // console.log('✅ Payment routes accessible without domain restriction');
//   // console.log('✅ Message routes registered and accessible');
// });

// export default app;

// server.ts - PRODUCTION READY VERSION
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import cors from 'cors';
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

const port: number = parseInt(process.env.PORT || '3000', 10);
const app: Express = express();

// Environment check
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

console.log('🚀 Starting Mama Tiffin Server...');
console.log('🔧 Environment:', isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION');

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
    // ✅ PRODUCTION - Explicit origins (NO environment variables dependency)
    const origins = [
      'https://mamatiffin.vercel.app',
      'https://admin-mamatiffin.vercel.app',
      'https://www.mamatiffin.vercel.app',
    ];

    console.log('🔒 Production CORS Origins:', origins);
    return origins;
  }
};

// server.ts - CORS section ko ye version se replace karo

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    console.log('🔍 CORS Check:', {
      requestOrigin: origin || 'no-origin',
      allowedOrigins,
      isDevelopment
    });
    
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) {
      console.log('✅ No origin header - allowing');
      return callback(null, true);
    }
    
    // Normalize origins (remove trailing slashes)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    // Development: Allow all localhost
    if (isDevelopment) {
      if (normalizedOrigin.includes('localhost') || normalizedOrigin.includes('127.0.0.1')) {
        console.log('✅ Dev origin allowed:', origin);
        return callback(null, true);
      }
    }
    
    // Production: Check whitelist
    if (normalizedAllowed.includes(normalizedOrigin)) {
      console.log('✅ Origin allowed:', origin);
      return callback(null, true);
    }
    
    // BLOCKED
    console.error('❌ CORS BLOCKED:', {
      origin,
      normalizedOrigin,
      allowedOrigins: normalizedAllowed,
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
  optionsSuccessStatus: 204, // Some legacy browsers choke on 200
  preflightContinue: false
}));

console.log('✅ CORS Configuration Complete');
console.log('📋 Allowed Origins:', getAllowedOrigins());

// DATABASE CONNECTION
console.log('🗄️ Connecting to database...');
connectDB();

// STATIC FILES SERVING
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// BASIC HEALTH AND CONFIG ENDPOINTS
app.get('/api/config', configEndpoint);
app.get('/api/health', healthEndpoint);

// CORS TEST ENDPOINT
app.get('/api/test-cors', (req: Request, res: Response): void => {
  const origin = (req.headers.origin || '') as string;
  const allowed = getAllowedOrigins();

  // Normalize allowed origins to include both with/without trailing slash
  const normalizedAllowed = Array.from(new Set([
    ...allowed,
    ...allowed.map(o => o.replace(/\/+$/, '')),
    ...allowed.map(o => o.endsWith('/') ? o : `${o}/`)
  ])).sort();

  const originNormalized = origin.replace(/\/+$/, '');
  const isOriginAllowed = !origin || normalizedAllowed.includes(origin) || normalizedAllowed.includes(originNormalized);

  res.json({
    success: true,
    message: 'CORS is working correctly!',
    debug: {
      origin: origin || null,
      originNormalized: originNormalized || null,
      host: req.headers.host || null,
      allowedOrigins: normalizedAllowed,
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
      protocol: req.protocol
    },
    cors: {
      enabled: true,
      origin: req.headers.origin,
      allowedOrigins: getAllowedOrigins()
    },
    endpoints: {
      health: '/api/health',
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

// ERROR HANDLING MIDDLEWARE
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
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
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

// 404 HANDLER - Route not found
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

// GRACEFUL SHUTDOWN HANDLING
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('🔥 Uncaught Exception:', error);
  if (isProduction) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  if (isProduction) {
    process.exit(1);
  }
});

// ✅ START SERVER - RAILWAY COMPATIBLE
app.listen(port, '0.0.0.0', (): void => {
  console.log('\n🎉 SERVER STARTED SUCCESSFULLY!');
  console.log('--------------------------------------------------');
  console.log(`🚀 Server: http://0.0.0.0:${port}`);
  console.log(`📖 API Docs: http://0.0.0.0:${port}/api`);
  console.log('--------------------------------------------------');
  console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  console.log(`✅ Port: ${port} ${isProduction ? '(Railway assigned)' : '(Local)'}`);
  console.log(`✅ Host: 0.0.0.0 (All interfaces)`);
  console.log(`✅ Trust Proxy: ${isProduction ? 'ENABLED' : 'DISABLED'}`);
  console.log(`✅ CORS Origins: ${getAllowedOrigins().length} configured`);
  console.log('✅ All routes registered successfully');
  console.log('--------------------------------------------------\n');
});

export default app;