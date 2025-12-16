import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { ApiError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { hashPassword } from '../utils/bcrypt';
import { sendWelcomeKvkkEmail } from '../lib/email/sendWelcomeKvkk';

// SQLite için UserRole string sabitleri
const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RESTAURANT_ADMIN: 'RESTAURANT_ADMIN',
  CUSTOMER: 'CUSTOMER'
};

// Tüm kullanıcıları listele (Süper Admin)
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
};

// Kullanıcı detayı
export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
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
      },
    });

    if (!user) {
      throw new ApiError(404, 'Kullanıcı bulunamadı');
    }

    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

// Yeni kullanıcı oluştur (Süper Admin)
export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password, role } = req.body;

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(400, 'Bu email zaten kullanılıyor');
    }

    // Şifre hash
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: (role || UserRole.CUSTOMER) as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Hoş geldiniz + KVKK maili gönder (async, hata durumunda kullanıcı kaydı yine başarılı)
    let emailSent = false;
    try {
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const emailResult = await sendWelcomeKvkkEmail({
        to: user.email,
        name: user.name || '',
        loginEmail: user.email,
        loginUrl: `${appUrl}/login`,
        // tempPassword: password, // Güvenlik için şifreyi göndermiyoruz
        includePassword: false,
      });
      emailSent = emailResult.success;
      
      if (!emailSent) {
        console.warn('⚠️  Welcome email could not be sent:', emailResult.error);
      }
    } catch (emailError: any) {
      console.error('❌ Welcome email error:', emailError.message);
    }

    sendSuccess(
      res, 
      { ...user, emailSent }, 
      emailSent 
        ? 'Kullanıcı başarıyla oluşturuldu ve hoş geldiniz e-postası gönderildi' 
        : 'Kullanıcı başarıyla oluşturuldu (e-posta gönderilemedi)',
      201
    );
  } catch (error) {
    next(error);
  }
};

// Kullanıcı güncelle
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new ApiError(404, 'Kullanıcı bulunamadı');
    }

    // Email değişiyorsa kontrol et
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ApiError(400, 'Bu email zaten kullanılıyor');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    sendSuccess(res, updatedUser, 'Kullanıcı başarıyla güncellendi');
  } catch (error) {
    next(error);
  }
};

// Kullanıcı sil (Süper Admin)
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Kendini silemesin
    if (id === req.user?.userId) {
      throw new ApiError(400, 'Kendi hesabınızı silemezsiniz');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new ApiError(404, 'Kullanıcı bulunamadı');
    }

    await prisma.user.delete({ where: { id } });

    sendSuccess(res, null, 'Kullanıcı başarıyla silindi');
  } catch (error) {
    next(error);
  }
};

// Kullanıcı istatistikleri (Süper Admin)
export const getUserStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const [totalUsers, activeUsers, adminUsers, customerUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { in: [UserRole.SUPER_ADMIN as any, UserRole.RESTAURANT_ADMIN as any] } } }),
      prisma.user.count({ where: { role: UserRole.CUSTOMER as any } }),
    ]);

    sendSuccess(res, {
      totalUsers,
      activeUsers,
      adminUsers,
      customerUsers,
    });
  } catch (error) {
    next(error);
  }
};
