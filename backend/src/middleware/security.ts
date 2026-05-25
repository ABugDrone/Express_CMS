import { Request, Response, NextFunction } from 'express';
import { isProduction } from '../config/env.js';

/**
 * Security headers middleware
 * Adds additional security headers beyond helmet
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (isProduction) {
    // HSTS in production only
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
}

/**
 * Request sanitization middleware
 * Prevents common injection attacks
 */
export function sanitizeRequest(req: Request, res: Response, next: NextFunction): void {
  // Sanitize query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    }
  }
  
  // Sanitize body (for non-JSON content)
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

/**
 * IP whitelist middleware (for admin routes)
 */
export function ipWhitelist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    
    // In development, allow all
    if (!isProduction) {
      return next();
    }
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied: IP not whitelisted' });
    }
  };
}

/**
 * Request size limiter
 */
export function requestSizeLimiter(maxSizeKB: number = 1024) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxBytes = maxSizeKB * 1024;
    
    if (contentLength > maxBytes) {
      res.status(413).json({ 
        error: 'Request entity too large',
        maxSize: `${maxSizeKB}KB`,
      });
      return;
    }
    
    next();
  };
}
