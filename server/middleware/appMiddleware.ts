// middleware/appMiddleware.ts - FIXED VERSION FOR ORDER ROUTES
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';

// ✅ RATE LIMITERS - OPTIMIZED FOR DEVELOPMENT

// General API rate limiter - More lenient for development
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for development environment health checks
    if (process.env.NODE_ENV !== 'production' && 
        (req.path === '/health' || req.path === '/api/health')) {
      return true;
    }
    return false;
  }
});

// Stricter limit for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // More lenient for development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Message submission rate limiter
export const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // More lenient for development
  message: {
    success: false,
    message: 'Too many messages submitted, please try again later.',
    error: 'MESSAGE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 200, // More lenient for development
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.',
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const configureMiddleware = (app: Express): void => {
  console.log('🔧 Configuring security middleware...');
  
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // ✅ TRUST PROXY CONFIGURATION
  if (!isDevelopment) {
    app.set('trust proxy', 1); // Trust first proxy
    console.log('✅ Proxy trust enabled for production');
  }

  // ✅ COMPRESSION MIDDLEWARE - EARLY
  app.use(compression({
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024 // Only compress responses larger than 1kb
  }));

  // ✅ LOGGING MIDDLEWARE - DEVELOPMENT FRIENDLY
  if (isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined', {
      skip: (req: Request, res: Response) => {
        return req.url === '/health' || req.url.startsWith('/static');
      }
    }));
  }

  // ✅ SECURITY MIDDLEWARE - HELMET (RELAXED FOR DEVELOPMENT)
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: isDevelopment ? false : {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { 
      policy: isDevelopment ? 'cross-origin' : 'same-site'
    }
  }));

  // ✅ BODY PARSERS - MUST BE BEFORE ROUTES
  app.use(express.json({ 
    limit: isDevelopment ? '50mb' : '10mb',
    strict: true,
    verify: (req: Request, res: Response, buf: Buffer, encoding: string): void => {
      // Only verify JSON in production to avoid development issues
      if (!isDevelopment) {
        try {
          JSON.parse(buf.toString());
        } catch (err) {
          const error = new Error('Invalid JSON format');
          error.name = 'SyntaxError';
          throw error;
        }
      }
    }
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: isDevelopment ? '50mb' : '10mb',
    parameterLimit: 1000
  }));

  // ✅ CUSTOM REQUEST LOGGING MIDDLEWARE - ENHANCED FOR DEBUGGING
  app.use((req: Request, res: Response, next: NextFunction): void => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    
    // Enhanced logging for development
    if (isDevelopment) {
      console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - Origin: ${req.headers.origin || 'None'}`);
      
      // Log query parameters for debugging
      if (Object.keys(req.query).length > 0) {
        console.log(`Query Params:`, req.query);
      }
      
      // Log request body size and keys for debugging (exclude sensitive routes)
      if (req.method === 'POST' && !req.path.includes('/auth')) {
        const bodySize = JSON.stringify(req.body || {}).length;
        if (bodySize > 0) {
          console.log(`Request Body Size: ${bodySize} bytes, Keys:`, Object.keys(req.body || {}));
        }
      }
    }
    
    next();
  });

  // ✅ RESPONSE TIME MIDDLEWARE - ENHANCED
  app.use((req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusColor = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
      
      if (isDevelopment) {
        console.log(`${statusColor} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
      }
      
      // Log slow requests in production
      if (!isDevelopment && duration > 3000) {
        console.log(`⚠️ SLOW REQUEST: ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
      }
    });
    
    next();
  });

  // ✅ ADDITIONAL SECURITY HEADERS - RELAXED FOR DEVELOPMENT
  app.use((req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    if (!isDevelopment) {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }
    
    // Remove server information
    res.removeHeader('X-Powered-By');
    
    next();
  });

  // ✅ API VERSIONING AND SERVICE HEADERS
  app.use('/api', (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('API-Version', '2.0.0');
    res.setHeader('Service', 'Mama Tiffin API');
    
    // Different caching strategies for development vs production
    if (isDevelopment) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    next();
  });

  // ✅ APPLY RATE LIMITING - ONLY IN PRODUCTION OR WHEN SPECIFICALLY ENABLED
  if (!isDevelopment || process.env.ENABLE_RATE_LIMITING === 'true') {
    console.log('✅ Applying rate limiting...');
    app.use('/api/', generalLimiter);
    app.use('/api/auth', authLimiter);
    app.use('/api/messages', messageLimiter);
    app.use('/api/contact', messageLimiter);
    app.use('/api/upload', uploadLimiter);
    app.use('/admin-auth', authLimiter);
  } else {
    console.log('⚠️ Rate limiting disabled for development');
  }

  // ✅ ERROR HANDLING FOR JSON PARSE ERRORS
  app.use((error: any, req: Request, res: Response, next: NextFunction): void => {
    if (error instanceof SyntaxError && 'body' in error) {
      console.error('JSON Parse Error:', error.message);
      res.status(400).json({
        success: false,
        message: 'Invalid JSON format in request body',
        error: 'MALFORMED_JSON',
        details: isDevelopment ? error.message : undefined
      });
      return;
    }
    next(error);
  });

  // ✅ HEALTH CHECK ENDPOINT (before other routes)
  app.get('/health', (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memoryUsage: process.memoryUsage()
    });
  });

  // ✅ API HEALTH CHECK
  app.get('/api/health', (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'API is healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  console.log('✅ Security middleware configured successfully');
  console.log(`✅ Environment: ${isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  console.log('✅ CORS will be configured separately in server.ts');
  console.log('✅ Body parsers configured (JSON + URL-encoded)');
  console.log(`✅ Rate limiting: ${(!isDevelopment || process.env.ENABLE_RATE_LIMITING === 'true') ? 'ENABLED' : 'DISABLED'}`);
  console.log('✅ Request logging and security headers enabled');
  console.log('✅ Compression and error handling configured');
  console.log('✅ Health check endpoints available at /health and /api/health');
};