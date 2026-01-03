/**
 * User Controller - Örnek CRUD İşlemleri
 * 
 * Bu controller Railway deployment dökümanı için hazırlanmış
 * basit bir user yönetimi örneğidir.
 * 
 * Endpoints:
 * - GET /api/users/example - Tüm kullanıcıları listele
 * - POST /api/users/example - Yeni kullanıcı oluştur
 * - GET /api/users/example/:id - Tek kullanıcı detay
 * - PUT /api/users/example/:id - Kullanıcı güncelle
 * - DELETE /api/users/example/:id - Kullanıcı sil
 */

import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { logger } from '../services/logger.service';

/**
 * Tüm kullanıcıları listele
 * GET /api/users/example
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        // password alanını döndürme!
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    logger.error('Kullanıcılar listelenemedi:', error);
    return res.status(500).json({
      success: false,
      message: 'Kullanıcılar listelenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};

/**
 * Tek kullanıcı detayı
 * GET /api/users/example/:id
 */
export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            restaurants: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Kullanıcı getirilemedi:', error);
    return res.status(500).json({
      success: false,
      message: 'Kullanıcı getirilirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};

/**
 * Yeni kullanıcı oluştur (Basitleştirilmiş - Örnek amaçlı)
 * POST /api/users/example
 * 
 * NOT: Gerçek uygulamada /api/auth/register kullanın!
 * Bu endpoint sadece Railway deployment testi için
 */
export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, password } = req.body;

    // Validasyon
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, name ve password gereklidir'
      });
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    // NOT: Gerçek uygulamada password'ü bcrypt ile hash'leyin!
    // Bu sadece örnek amaçlı basitleştirilmiş versiyon
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // GERÇEK UYGULAMADA: await hashPassword(password)
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: user
    });
  } catch (error) {
    logger.error('Kullanıcı oluşturulamadı:', error);
    return res.status(500).json({
      success: false,
      message: 'Kullanıcı oluşturulurken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};

/**
 * Kullanıcı güncelle
 * PUT /api/users/example/:id
 */
export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    });

    return res.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: user
    });
  } catch (error: any) {
    logger.error('Kullanıcı güncellenemedi:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};

/**
 * Kullanıcı sil
 * DELETE /api/users/example/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error: any) {
    logger.error('Kullanıcı silinemedi:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Kullanıcı silinirken hata oluştu',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};

/**
 * Veritabanı bağlantı testi
 * GET /api/users/example/test-connection
 */
export const testDatabaseConnection = async (req: Request, res: Response) => {
  try {
    // Basit bir query ile bağlantıyı test et
    const result = await prisma.$queryRaw`SELECT current_database(), version()`;
    
    // Toplam kullanıcı sayısını al
    const userCount = await prisma.user.count();

    return res.json({
      success: true,
      message: 'PostgreSQL bağlantısı başarılı',
      data: {
        database: result,
        userCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Veritabanı bağlantı testi başarısız:', error);
    return res.status(500).json({
      success: false,
      message: 'Veritabanı bağlantısı kurulamadı',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
};
