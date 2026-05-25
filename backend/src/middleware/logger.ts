import { Request, Response, NextFunction } from 'express';
import { isDevelopment } from '../config/env.js';

/**
 * Request logging middleware
 * Logs all incoming requests with method, path, status, and response time
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    // Color code based on status
    const statusColor = statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                       statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                       statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                       '\x1b[32m'; // Green for 2xx
    
    const reset = '\x1b[0m';
    
    if (isDevelopment) {
      console.log(
        `${statusColor}${method}${reset} ${originalUrl} ${statusColor}${statusCode}${reset} - ${duration}ms - ${ip}`
      );
    } else {
      // Production: JSON structured logging
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        method,
        path: originalUrl,
        statusCode,
        duration,
        ip,
        userAgent: req.get('user-agent'),
      }));
    }
  });

  next();
}

/**
 * Error request logger
 * Logs detailed error information
 */
export function errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('❌ Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    error: err.message,
    stack: isDevelopment ? err.stack : undefined,
    body: isDevelopment ? req.body : undefined,
  });
  
  next(err);
}
