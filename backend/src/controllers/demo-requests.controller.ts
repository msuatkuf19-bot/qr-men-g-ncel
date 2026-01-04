import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { ApiError } from '../utils/response';
import { DemoRequestStatus } from '@prisma/client';

// Potansiyel Durum ENUM - tek kaynak
const PotentialStatus = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  DEMO_CREATED: 'DEMO_CREATED',
  HIGH_PROBABILITY: 'HIGH_PROBABILITY',
  EVALUATING: 'EVALUATING',
  FOLLOW_UP: 'FOLLOW_UP',
  LONG_TERM: 'LONG_TERM',
  NEGATIVE: 'NEGATIVE'
} as const;

type PotentialStatusType = typeof PotentialStatus[keyof typeof PotentialStatus];

const normalizeWhatsappPhone = (raw: unknown) => {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) return '';

  const normalized = (hasPlus ? '+' : '') + digits;

  // Basic sanity check (WhatsApp-friendly range)
  if (digits.length < 8 || digits.length > 20) {
    throw new ApiError(400, 'Telefon/WhatsApp numarası geçersiz');
  }

  return normalized;
};

export const createDemoRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      fullName,
      restaurantName,
      phone,
      email = null,
      restaurantType = '',
      tableCount,
    } = req.body ?? {};

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      throw new ApiError(400, 'Ad Soyad zorunlu');
    }

    if (!restaurantName || typeof restaurantName !== 'string' || !restaurantName.trim()) {
      throw new ApiError(400, 'Restoran Adı zorunlu');
    }

    const normalizedPhone = normalizeWhatsappPhone(phone);
    if (!normalizedPhone) {
      throw new ApiError(400, 'Telefon / WhatsApp zorunlu');
    }

    const normalizedEmail =
      email === null || email === undefined || (typeof email === 'string' && !email.trim())
        ? null
        : String(email).trim();

    const parsedTableCount =
      tableCount === null || tableCount === undefined || tableCount === ''
        ? 0
        : Number(tableCount);

    if (!Number.isFinite(parsedTableCount) || parsedTableCount < 0) {
      throw new ApiError(400, 'Masa sayısı geçersiz');
    }

    await prisma.demoRequest.create({
      data: {
        fullName: String(fullName).trim(),
        restaurantName: String(restaurantName).trim(),
        phone: normalizedPhone,
        email: normalizedEmail,
        restaurantType: String(restaurantType ?? '').trim(),
        tableCount: Math.trunc(parsedTableCount),
        status: DemoRequestStatus.PENDING,
        potentialStatus: PotentialStatus.PENDING as any,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Demo talebi başarıyla alındı',
    });
  } catch (error) {
    next(error);
  }
};

export const listDemoRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await prisma.demoRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      message: 'Demo talepleri başarıyla getirildi',
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDemoRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { potentialStatus, followUpMonth } = req.body ?? {};

    if (!id) {
      throw new ApiError(400, 'ID gerekli');
    }

    if (!potentialStatus || typeof potentialStatus !== 'string') {
      throw new ApiError(400, 'Potansiyel durum gerekli');
    }

    // Validate potentialStatus
    const allowedStatuses = Object.values(PotentialStatus);
    const nextStatus = potentialStatus as PotentialStatusType;
    
    if (!allowedStatuses.includes(nextStatus)) {
      throw new ApiError(400, 'Geçersiz potansiyel durum');
    }

    // Validate followUpMonth if provided (now a date string YYYY-MM-DD)
    let nextFollowUpMonth: string | undefined;
    if (followUpMonth && typeof followUpMonth === 'string' && followUpMonth.trim()) {
      // Optionally validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(followUpMonth.trim())) {
        nextFollowUpMonth = followUpMonth.trim();
      } else {
        nextFollowUpMonth = followUpMonth.trim(); // Allow any format for flexibility
      }
    }

    const updateData: any = { potentialStatus: nextStatus as any };
    if (nextFollowUpMonth !== undefined) {
      updateData.followUpMonth = nextFollowUpMonth;
    }

    const updated = await prisma.demoRequest.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Durum güncellendi',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDemoRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, 'ID gerekli');
    }

    // Check if record exists
    const existing = await prisma.demoRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, 'Demo talebi bulunamadı');
    }

    await prisma.demoRequest.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Demo talebi başarıyla silindi',
    });
  } catch (error) {
    next(error);
  }
};
