import express, { Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Review submission rate limiter
export const reviewLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // limit each IP to 5 review submissions per day
  message: {
    success: false,
    message: 'Too many review submissions, please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const configureMiddleware = (app: Application): void => {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development
    crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow cross-origin requests
  }));

  // ❌ CORS REMOVED - Handled in server.ts
  // DO NOT ADD CORS HERE - It conflicts with server.ts CORS setup

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Body parsing middleware
  app.use(express.json({
    limit: '10mb',
    strict: true
  }));
 
  app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
  }));

  // NOTE: Rate limiting is handled in server.ts for production
  // DO NOT add generalLimiter here if it's already in server.ts
  
  // Trust proxy if behind reverse proxy (like Nginx)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }
};