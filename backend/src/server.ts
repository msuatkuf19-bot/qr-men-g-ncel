/**
 * QR Menü Sistemi - Backend Server
 * 
 * Node.js + Express + TypeScript + PostgreSQL (Prisma ORM)
 * Railway deployment için optimize edilmiştir.
 * 
 * Özellikler:
 * - RESTful API
 * - JWT Authentication
 * - PostgreSQL veritabanı
 * - CORS koruması
 * - Rate limiting
 * - File upload (multer)
 * - Helmet security
 */

import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { config, validateConfig } from './config';
import { helmetConfig, apiLimiter, authLimiter } from './config/security';
import { errorHandler } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/logger.middleware';
import { sanitizeInput } from './middlewares/sanitize.middleware';
import { logger } from './services/logger.service';
import prisma, { warmupDatabase } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import restaurantRoutes from './routes/restaurant.routes';
import menuRoutes from './routes/menu.routes';
import qrRoutes from './routes/qr.routes';
import publicRoutes from './routes/public.routes';
import analyticsRoutes from './routes/analytics.routes';
import uploadRoutes from './routes/upload.routes';
import userRoutes from './routes/user.routes';
import userExampleRoutes from './routes/user-example.routes'; // Railway deployment örneği
import demoRequestRoutes from './routes/demo-requests.routes';

/**
 * Environment variables validasyonu
 * Eksik değişkenler varsa uyarı verir
 */
validateConfig();

const app: Application = express();

/**
 * CORS Ayarları
 * Vercel serverless için optimize edildi
 */
const corsOptions = {
  origin: true, // Tüm origin'lere izin ver
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmetConfig);

// Request logging
app.use(requestLogger);

// Rate limiting - Development'ta devre dışı
if (config.nodeEnv === 'production') {
  app.use('/api/auth', authLimiter);
  app.use('/api/', apiLimiter);
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// XSS koruması
app.use(sanitizeInput);

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/demo-requests', demoRequestRoutes);

// Railway Deployment Test Endpoints
app.use('/api/users/example', userExampleRoutes);

/**
 * Health Check Endpoint
 * Railway, Vercel gibi platformlar bu endpoint'i kullanarak
 * servisin çalışıp çalışmadığını kontrol eder
 */
app.get('/health', async (req, res) => {
  try {
    // Veritabanı bağlantısını test et
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      success: true,
      status: 'healthy', 
      message: 'Server ve veritabanı çalışıyor',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check başarısız:', error);
    res.status(503).json({ 
      success: false,
      status: 'unhealthy', 
      message: 'Veritabanı bağlantısı kurulamadı',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
});

/**
 * API Bilgi Endpoint
 * API hakkında genel bilgi döndürür
 */
app.get('/api', (req, res) => {
  res.json({
    success: true,
    name: 'QR Menü Sistemi API',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      menu: '/api/menu',
      qr: '/api/qr',
      public: '/api/public',
      analytics: '/api/analytics',
      upload: '/api/upload',
      users: '/api/users'
    },
    documentation: 'https://github.com/msuatkuf19-bot/Mss-qrgit#readme'
  });
});

/**
 * 404 Handler
 * Tanımsız route'lar için
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route bulunamadı: ${req.method} ${req.path}`,
  });
});

/**
 * Global Error Handler
 * Tüm hataları yakalar ve standart format döndürür
 */
app.use(errorHandler);

/**
 * Server Başlatma
 * Railway otomatik olarak PORT değişkenini sağlar
 */
const PORT = config.port;
const HOST = '0.0.0.0'; // Railway için gerekli

// Veritabanı bağlantısını önceden ısıt (warm-up)
// İlk QR okumalarını hızlandırmak için kritik
warmupDatabase()
  .then(() => {
    logger.info('✅ Veritabanı bağlantısı hazır (warm-up tamamlandı)');
  })
  .catch((err) => {
    logger.error('❌ Veritabanı warm-up hatası:', err);
  });

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 Server başlatıldı - Port: ${PORT}`);
  logger.info(`📝 Ortam: ${config.nodeEnv}`);
  logger.info(`🗄️  Veritabanı: PostgreSQL (Supabase Pooler)`);
  logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
  
  if (config.nodeEnv === 'development') {
    logger.info(`📡 API Dokümantasyon: http://localhost:${PORT}/api`);
  }
});

/**
 * Graceful Shutdown
 * SIGTERM/SIGINT sinyali geldiğinde temiz kapanış
 * Railway'de restart durumlarında kullanılır
 */
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} sinyali alındı - Kapanış işlemi başlatılıyor...`);
  
  // Yeni istekleri kabul etmeyi durdur
  server.close(async () => {
    logger.info('HTTP server kapatıldı');
    
    try {
      // Veritabanı bağlantısını kapat
      await prisma.$disconnect();
      logger.info('Veritabanı bağlantısı kapatıldı');
      
      process.exit(0);
    } catch (error) {
      logger.error('Graceful shutdown hatası:', error);
      process.exit(1);
    }
  });
  
  // 30 saniye sonra zorla kapat
  setTimeout(() => {
    logger.error('Graceful shutdown timeout - Zorla kapatılıyor');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection yakalama
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

export default app;
