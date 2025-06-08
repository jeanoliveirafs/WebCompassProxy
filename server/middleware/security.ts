import { Request, Response, NextFunction } from 'express';

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Security headers for production
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // PWA and caching headers
  if (req.path === '/manifest.json') {
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
  } else if (req.path === '/sw.js') {
    res.setHeader('Cache-Control', 'no-cache');
  } else if (req.path.includes('/screenshots/')) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  }
  
  next();
};

// Request size limiting
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: 'Request body exceeds maximum size limit'
    });
  }
  
  next();
};