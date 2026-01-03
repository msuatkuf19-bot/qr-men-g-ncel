import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Response bittiğinde log kaydet
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.http(req.method, req.originalUrl, res.statusCode, responseTime);
  });

  next();
};

/**
 * Performance Logger Middleware
 * Request sürelerini detaylı olarak loglar - cold start analizi için
 */
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const path = req.path;
  const method = req.method;

  // Response bittiğinde performance log'u yaz
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Kritik endpoint'leri özel olarak logla
    if (path.includes('/auth/login') || path.includes('/health') || responseTime > 1000) {
      logger.info(`[PERF] ${method} ${path} - ${statusCode} - ${responseTime}ms`);
    }

    // Çok yavaş request'leri warn olarak logla
    if (responseTime > 2000) {
      logger.warn(`[SLOW-REQUEST] ${method} ${path} - ${responseTime}ms (${statusCode})`);
    }

    // Cold start indicator - first request usually takes longer
    if (responseTime > 5000) {
      logger.warn(`[POTENTIAL-COLD-START] ${method} ${path} - ${responseTime}ms`);
    }
  });

  next();
};
