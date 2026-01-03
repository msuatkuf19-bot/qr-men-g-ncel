import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/response';
import { DemoRequestStatus } from '@prisma/client';

// Define potential enum values as constants
const DemoRequestPotential = {
  HIGH_PROBABILITY: 'HIGH_PROBABILITY',
  LONG_TERM: 'LONG_TERM'
} as const;

type DemoRequestPotentialType = typeof DemoRequestPotential[keyof typeof DemoRequestPotential];

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
    const { status, potential, followUpMonth, membershipStartDate, membershipEndDate } = req.body ?? {};

    if (!id) {
      throw new ApiError(400, 'ID gerekli');
    }

    if (!status || typeof status !== 'string') {
      throw new ApiError(400, 'Durum gerekli');
    }

    const allowed = [
      'PENDING',
      'DEMO_CREATED',
      'FOLLOW_UP',
      'NEGATIVE',
    ];

    const nextStatus = status as DemoRequestStatus;
    if (!allowed.includes(nextStatus)) {
      throw new ApiError(400, 'Geçersiz durum');
    }

    // Validate potential if provided
    const potentialOptions = [
      DemoRequestPotential.HIGH_PROBABILITY,
      DemoRequestPotential.LONG_TERM,
    ];

    let nextPotential: DemoRequestPotentialType | undefined;
    if (potential && typeof potential === 'string') {
      nextPotential = potential as DemoRequestPotentialType;
      if (!potentialOptions.includes(nextPotential)) {
        throw new ApiError(400, 'Geçersiz potansiyel durumu');
      }
    }

    // Validate followUpMonth format (YYYY-MM)
    let nextFollowUpMonth: string | undefined;
    if (followUpMonth && typeof followUpMonth === 'string') {
      const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!monthRegex.test(followUpMonth)) {
        throw new ApiError(400, 'Takip ayı YYYY-MM formatında olmalı');
      }
      nextFollowUpMonth = followUpMonth;
    }

    // Validate membership dates format (YYYY-MM-DD)
    let nextMembershipStartDate: string | undefined;
    let nextMembershipEndDate: string | undefined;
    
    if (membershipStartDate && typeof membershipStartDate === 'string') {
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      if (!dateRegex.test(membershipStartDate)) {
        throw new ApiError(400, 'Üyelik başlangıç tarihi YYYY-MM-DD formatında olmalı');
      }
      nextMembershipStartDate = membershipStartDate;
    }
    
    if (membershipEndDate && typeof membershipEndDate === 'string') {
      const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      if (!dateRegex.test(membershipEndDate)) {
        throw new ApiError(400, 'Üyelik bitiş tarihi YYYY-MM-DD formatında olmalı');
      }
      nextMembershipEndDate = membershipEndDate;
    }

    const updateData: any = { status: nextStatus };
    if (nextPotential !== undefined) updateData.potential = nextPotential;
    if (nextFollowUpMonth !== undefined) updateData.followUpMonth = nextFollowUpMonth;
    if (nextMembershipStartDate !== undefined) updateData.membershipStartDate = nextMembershipStartDate;
    if (nextMembershipEndDate !== undefined) updateData.membershipEndDate = nextMembershipEndDate;

    const updated = await prisma.demoRequest.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Bilgiler güncellendi',
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
