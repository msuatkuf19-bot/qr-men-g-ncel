import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiError, sendSuccess } from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { qrCodeService } from '../services/qr.service';
import '../services/qr.service.helpers'; // Service'i genişlet

// QR kod oluştur (CRUD - Create)
export const createQRCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = req.body.restaurantId || req.user?.restaurantId;
    const { type, tableNumber } = req.body;

    if (!restaurantId) {
      throw new ApiError(400, 'Restoran ID gerekli');
    }

    // Ownership kontrolü - RESTAURANT_ADMIN sadece kendi restoranına QR ekleyebilir
    if (req.user?.role === 'RESTAURANT_ADMIN' && req.user.restaurantId !== restaurantId) {
      throw new ApiError(403, 'Bu restorana QR kod ekleme yetkiniz yok');
    }

    const qrData = await qrCodeService.generateQRCode(
      restaurantId,
      tableNumber,
      'png'
    );

    sendSuccess(res, {
      qrCode: {
        id: qrData.code,
        code: qrData.code,
        url: qrData.url,
        image: qrData.image,
        type: type || (tableNumber ? 'TABLE' : 'RESTAURANT'),
        tableNumber: tableNumber || null,
        isActive: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// QR kod oluştur (Legacy)
export const generateQRCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { tableNumber, format } = req.query;

    if (!restaurantId) {
      throw new ApiError(400, 'Restoran ID gerekli');
    }

    const qrData = await qrCodeService.generateQRCode(
      restaurantId,
      tableNumber as string,
      (format as 'png' | 'svg') || 'png'
    );

    sendSuccess(res, {
      qrCode: {
        code: qrData.code,
        url: qrData.url,
        image: qrData.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Toplu QR kod oluştur
export const generateBulkQRCodes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { startTable, endTable } = req.body;

    if (!restaurantId) {
      throw new ApiError(400, 'Restoran ID gerekli');
    }

    if (!startTable || !endTable) {
      throw new ApiError(400, 'Başlangıç ve bitiş masa numarası gerekli');
    }

    const qrCodes = await qrCodeService.generateBulkQRCodes(
      restaurantId,
      parseInt(startTable),
      parseInt(endTable)
    );

    sendSuccess(res, { qrCodes, count: qrCodes.length });
  } catch (error) {
    next(error);
  }
};

// PDF QR kod oluştur
export const generateQRPDF = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const { tableNumbers } = req.body;

    if (!restaurantId) {
      throw new ApiError(400, 'Restoran ID gerekli');
    }

    if (!tableNumbers || !Array.isArray(tableNumbers)) {
      throw new ApiError(400, 'Masa numaraları array olarak gönderilmeli');
    }

    const pdfBytes = await qrCodeService.generateQRPDF(restaurantId, tableNumbers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=qr-codes-${Date.now()}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    next(error);
  }
};

// Restoran QR kodlarını listele
export const getQRCodes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;

    if (!restaurantId) {
      throw new ApiError(400, 'Restoran ID gerekli');
    }

    // Ownership kontrolü - RESTAURANT_ADMIN sadece kendi restoranının QR kodlarını görebilir
    if (req.user?.role === 'RESTAURANT_ADMIN' && req.user.restaurantId !== restaurantId) {
      throw new ApiError(403, 'Bu restoranın QR kodlarını görme yetkiniz yok');
    }

    const qrCodes = await qrCodeService.getQRCodes(restaurantId);

    sendSuccess(res, qrCodes);
  } catch (error) {
    next(error);
  }
};

// QR kod tarama - Restaurant slug'a redirect
export const scanQRCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code } = req.params;

    // QR kodu bul
    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        restaurant: {
          select: {
            slug: true,
            name: true,
            isActive: true,
            membershipStatus: true,
          },
        },
      },
    });

    if (!qrCode) {
      throw new ApiError(404, 'QR kod bulunamadı');
    }

    if (!qrCode.isActive) {
      throw new ApiError(403, 'Bu QR kod devre dışı');
    }

    if (!qrCode.restaurant.isActive) {
      throw new ApiError(403, 'Bu restoran şu anda aktif değil');
    }

    // Scan count'u artır (non-blocking)
    prisma.qRCode.update({
      where: { id: qrCode.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
      },
    }).catch(err => console.error('QR scan count update failed:', err));

    // Menu URL'ine redirect
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
    const menuUrl = `${frontendUrl}/menu/${qrCode.restaurant.slug}`;
    
    res.redirect(menuUrl);
  } catch (error) {
    next(error);
  }
};

// QR kod güncelle
export const updateQRCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isActive, tableNumber } = req.body;

    // QR kodu veritabanında güncelle (şimdilik mock)
    sendSuccess(res, {
      qrCode: {
        id,
        isActive,
        tableNumber,
        updatedAt: new Date(),
      },
    }, 'QR kod başarıyla güncellendi');
  } catch (error) {
    next(error);
  }
};

// QR kod sil
export const deleteQRCode = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await qrCodeService.deleteQRCode(id);

    sendSuccess(res, null, 'QR kod başarıyla silindi');
  } catch (error) {
    next(error);
  }
};

// QR kod görselini döndür (PNG)
export const getQRCodeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const imageBuffer = await qrCodeService.getQRCodeImage(id);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 saat cache
    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
};

// QR kod indir
export const downloadQRCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const imageBuffer = await qrCodeService.getQRCodeImage(id);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-code-${id}.png"`);
    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
};
