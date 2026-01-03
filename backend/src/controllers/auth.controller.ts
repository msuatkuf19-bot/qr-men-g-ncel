import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken, verifyToken } from '../utils/jwt';
import { ApiError, sendSuccess } from '../utils/response';

// PostgreSQL UserRole enum values
const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  RESTAURANT_ADMIN: 'RESTAURANT_ADMIN' as const,
  CUSTOMER: 'CUSTOMER' as const
};

/**
 * Login Timing Log Helper - Performans analizi için
 */
interface LoginTimingLog {
  t0_requestReceived: number;
  t1_dbConnectStart?: number;
  t1_dbConnectEnd?: number;
  t2_userQueryStart?: number;
  t2_userQueryEnd?: number;
  t3_passwordCheckStart?: number;
  t3_passwordCheckEnd?: number;
  t4_restaurantQueryStart?: number;
  t4_restaurantQueryEnd?: number;
  t5_tokenGenStart?: number;
  t5_tokenGenEnd?: number;
  t6_responseSent?: number;
  breakdown: {
    dbConnect?: number;
    userQuery?: number;
    passwordCheck?: number;
    restaurantQuery?: number;
    tokenGeneration?: number;
    totalResponse?: number;
  };
}

function createLoginTimingLog(): LoginTimingLog {
  return {
    t0_requestReceived: Date.now(),
    breakdown: {}
  };
}

function logLoginTiming(timing: LoginTimingLog, email: string): void {
  const total = timing.t6_responseSent! - timing.t0_requestReceived;
  const deltaConnect = timing.breakdown.dbConnect || 0;
  const deltaUserQuery = timing.breakdown.userQuery || 0;
  const deltaPassword = timing.breakdown.passwordCheck || 0;
  const deltaRestaurant = timing.breakdown.restaurantQuery || 0;
  const deltaToken = timing.breakdown.tokenGeneration || 0;
  
  console.log(`[LOGIN-PERF] email=${email} t0=${timing.t0_requestReceived}, t1=${timing.t1_dbConnectEnd || 0}, t2=${timing.t2_userQueryEnd || 0}, t3=${timing.t3_passwordCheckEnd || 0}, t4=${timing.t4_restaurantQueryEnd || 0}, t5=${timing.t5_tokenGenEnd || 0}, t6=${timing.t6_responseSent!}, deltaConnect=${deltaConnect}ms, deltaUserQuery=${deltaUserQuery}ms, deltaPassword=${deltaPassword}ms, deltaRestaurant=${deltaRestaurant}ms, deltaToken=${deltaToken}ms, deltaTotal=${total}ms`);
  
  // Detaylı breakdown
  console.log(`[LOGIN-PERF] BREAKDOWN: db_connect=${deltaConnect}ms, user_query=${deltaUserQuery}ms, password_check=${deltaPassword}ms, restaurant_query=${deltaRestaurant}ms, token_gen=${deltaToken}ms`);
  
  // Yavaş login'leri işaretle
  if (total > 5000) {
    console.error(`[LOGIN-PERF][CRITICAL] Login took ${total}ms - VERY SLOW for email=${email}`);
  } else if (total > 2000) {
    console.warn(`[LOGIN-PERF][SLOW] Login took ${total}ms for email=${email}`);
  } else if (total > 1000) {
    console.info(`[LOGIN-PERF][MEDIUM] Login took ${total}ms for email=${email}`);
  } else {
    console.log(`[LOGIN-PERF][FAST] Login took ${total}ms for email=${email}`);
  }
  
  // Hangi adımın yavaş olduğunu tespit et
  if (deltaConnect > 1000) {
    console.warn(`[LOGIN-PERF][DIAGNOSIS] DB CONNECTION is slow: ${deltaConnect}ms`);
  }
  if (deltaUserQuery > 1000) {
    console.warn(`[LOGIN-PERF][DIAGNOSIS] USER QUERY is slow: ${deltaUserQuery}ms`);
  }
  if (deltaPassword > 500) {
    console.warn(`[LOGIN-PERF][DIAGNOSIS] PASSWORD CHECK is slow: ${deltaPassword}ms`);
  }
  if (deltaRestaurant > 1000) {
    console.warn(`[LOGIN-PERF][DIAGNOSIS] RESTAURANT QUERY is slow: ${deltaRestaurant}ms`);
  }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(400, 'Bu email zaten kullanılıyor');
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(password);

    // Kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || UserRole.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Access token oluştur
    const accessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Refresh token oluştur (uzun ömürlü)
    const refreshToken = generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      '7d'
    );

    sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      'Kayıt başarılı',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const timing = createLoginTimingLog();
  
  try {
    const { email, password } = req.body;

    console.log(`[LOGIN-PERF] Login attempt for email: ${email}`);
    
    // === T1: DB Bağlantı Kontrolü ===
    timing.t1_dbConnectStart = Date.now();
    // Database connection established automatically
    timing.t1_dbConnectEnd = Date.now();
    timing.breakdown.dbConnect = timing.t1_dbConnectEnd - timing.t1_dbConnectStart;

    // === T2: Kullanıcı Sorgusu ===
    timing.t2_userQueryStart = Date.now();
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true,
      }
    });
    timing.t2_userQueryEnd = Date.now();
    timing.breakdown.userQuery = timing.t2_userQueryEnd - timing.t2_userQueryStart;
    
    if (!user) {
      timing.t6_responseSent = Date.now();
      logLoginTiming(timing, email);
      throw new ApiError(401, 'Email veya şifre hatalı');
    }

    // === T3: Şifre Kontrolü ===
    timing.t3_passwordCheckStart = Date.now();
    const isPasswordValid = await comparePassword(password, user.password);
    timing.t3_passwordCheckEnd = Date.now();
    timing.breakdown.passwordCheck = timing.t3_passwordCheckEnd - timing.t3_passwordCheckStart;
    
    if (!isPasswordValid) {
      timing.t6_responseSent = Date.now();
      logLoginTiming(timing, email);
      throw new ApiError(401, 'Email veya şifre hatalı');
    }

    // Aktif kullanıcı kontrolü
    if (!user.isActive) {
      timing.t6_responseSent = Date.now();
      logLoginTiming(timing, email);
      throw new ApiError(403, 'Hesabınız devre dışı bırakılmış');
    }

    // === T4: Restoran ID Sorgusu (sadece gerekiyorsa) ===
    let restaurantId;
    if (user.role === UserRole.RESTAURANT_ADMIN) {
      timing.t4_restaurantQueryStart = Date.now();
      const restaurant = await prisma.restaurant.findFirst({
        where: { ownerId: user.id },
        select: { id: true },
      });
      timing.t4_restaurantQueryEnd = Date.now();
      timing.breakdown.restaurantQuery = timing.t4_restaurantQueryEnd - timing.t4_restaurantQueryStart;
      restaurantId = restaurant?.id;
    } else {
      // Restoran sorgusu yapılmadı
      timing.breakdown.restaurantQuery = 0;
    }

    // === T5: Token Oluşturma ===
    timing.t5_tokenGenStart = Date.now();
    
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      restaurantId,
    };

    // Access token oluştur (kısa ömürlü)
    const accessToken = generateToken(tokenPayload, '15m');

    // Refresh token oluştur (uzun ömürlü)
    const refreshToken = generateToken(tokenPayload, '7d');
    
    timing.t5_tokenGenEnd = Date.now();
    timing.breakdown.tokenGeneration = timing.t5_tokenGenEnd - timing.t5_tokenGenStart;

    timing.t6_responseSent = Date.now();
    logLoginTiming(timing, email);

    sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId,
        },
      },
      'Giriş başarılı'
    );
  } catch (error) {
    timing.t6_responseSent = Date.now();
    logLoginTiming(timing, req.body.email || 'unknown');
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Restoran admin ise restaurant id'sini al
    let restaurantId;
    if (user.role === UserRole.RESTAURANT_ADMIN) {
      const restaurant = await prisma.restaurant.findFirst({
        where: { ownerId: user.id },
        select: { id: true },
      });
      restaurantId = restaurant?.id;
    }

    sendSuccess(res, { ...user, restaurantId });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new ApiError(400, 'Refresh token gerekli');
    }

    // Token'ı doğrula
    const decoded = verifyToken(token);

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'Geçersiz token');
    }

    // Yeni access token oluştur
    const accessToken = generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        restaurantId: decoded.restaurantId,
      },
      '15m'
    );

    sendSuccess(res, { accessToken }, 'Token yenilendi');
  } catch (error) {
    next(new ApiError(401, 'Geçersiz veya süresi dolmuş refresh token'));
  }
};
