/**
 * Health Check Routes
 * 
 * Bu endpoint'ler sistemin sağlık durumunu kontrol eder.
 * Cold start optimizasyonu ve monitoring için kullanılır.
 */

import { Router, Request, Response } from 'express';
import { logger } from '../services/logger.service';

const router = Router();

/**
 * GET /api/health
 * Basit health check - DB'ye dokunmaz
 * Cold start için ideal
 */
router.get('/', (req: Request, res: Response) => {
  const startTime = Date.now();
  
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    responseTime: Date.now() - startTime
  });
});

/**
 * GET /api/health/ready
 * Readiness check - DB bağlantısını kontrol eder
 */
router.get('/ready', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Lazy import prisma to avoid cold start issues
    const { prisma } = await import('../config/prisma');
    
    // Simple DB query
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
      responseTime: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (error as Error).message,
      responseTime: Date.now() - startTime
    });
  }
});

export default router;