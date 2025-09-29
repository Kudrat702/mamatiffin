// types/express-rate-limit.d.ts
declare module 'express-rate-limit' {
  import { Request, Response, NextFunction } from 'express';

  interface Options {
    windowMs?: number;
    max?: number | ((req: Request, res: Response) => number);
    message?: any;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
    trustProxy?: boolean; // ✅ Add missing trustProxy property
    keyGenerator?: (req: Request, res: Response) => string;
    skip?: (req: Request, res: Response) => boolean;
    onLimitReached?: (req: Request, res: Response, options: Options) => void;
    skipFailedRequests?: boolean;
    skipSuccessfulRequests?: boolean;
    store?: any;
    handler?: (req: Request, res: Response, next: NextFunction, options: Options) => void;
  }

  function rateLimit(options?: Options): (req: Request, res: Response, next: NextFunction) => void;
  export = rateLimit;
}