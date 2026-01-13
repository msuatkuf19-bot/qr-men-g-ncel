/**
 * Restaurant Utility Functions
 * - Member number generation
 * - Slug generation and normalization
 * - QR code generation
 */

import QRCode from 'qrcode';
import prisma from '../config/prisma';
import { nanoid } from 'nanoid';

/**
 * Generate a unique 6-digit member number
 * @returns {Promise<string>} 6-digit numeric string
 */
export async function generateMemberNo(): Promise<string> {
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate 6-digit number (100000-999999)
    const memberNo = String(Math.floor(100000 + Math.random() * 900000));
    
    // Check if exists in database
    const existing = await prisma.restaurant.findUnique({
      where: { memberNo },
    });
    
    if (!existing) {
      return memberNo;
    }
  }
  
  throw new Error('Failed to generate unique member number after 10 attempts');
}

/**
 * Normalize Turkish characters and generate slug
 * @param {string} text - Input text
 * @returns {string} URL-friendly slug
 */
export function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
  };

  return text
    .split('')
    .map(char => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');     // Remove leading/trailing hyphens
}

/**
 * Generate unique slug from base text
 * @param {string} baseText - Base text for slug
 * @param {string} [existingSlug] - Existing slug to exclude from uniqueness check
 * @returns {Promise<string>} Unique slug
 */
export async function generateUniqueSlug(
  baseText: string,
  existingSlug?: string
): Promise<string> {
  const baseSlug = slugify(baseText);
  let slug = baseSlug;
  let counter = 2;
  
  while (true) {
    const existing = await prisma.restaurant.findUnique({
      where: { slug },
    });
    
    // If no conflict or it's the same restaurant being updated
    if (!existing || (existingSlug && existing.slug === existingSlug)) {
      return slug;
    }
    
    // Add numeric suffix and try again
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 100) {
      throw new Error('Failed to generate unique slug');
    }
  }
}

/**
 * Check if slug is available
 * @param {string} slug - Slug to check
 * @param {string} [excludeId] - Restaurant ID to exclude from check
 * @returns {Promise<boolean>} True if available
 */
export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.restaurant.findUnique({
    where: { slug },
  });
  
  return !existing || (excludeId && existing.id === excludeId);
}

/**
 * Generate a unique QR code string
 * @returns {Promise<string>} Unique 10-character alphanumeric code
 */
export async function generateQRCodeString(): Promise<string> {
  const MAX_ATTEMPTS = 10;
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate 10-character alphanumeric code
    const code = nanoid(10);
    
    // Check if exists
    const existing = await prisma.qRCode.findUnique({
      where: { code },
    });
    
    if (!existing) {
      return code;
    }
  }
  
  throw new Error('Failed to generate unique QR code');
}

/**
 * Generate QR code image as base64 PNG
 * @param {string} url - URL to encode in QR
 * @param {object} options - QR code options
 * @returns {Promise<string>} Base64 encoded PNG image (with data:image/png;base64, prefix)
 */
export async function generateQRCodeImage(
  url: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  const qrOptions = {
    width: options?.width || 400,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF',
    },
    errorCorrectionLevel: 'M' as const,
  };
  
  try {
    // Generate as data URL (base64)
    const dataUrl = await QRCode.toDataURL(url, qrOptions);
    return dataUrl; // Returns "data:image/png;base64,..."
  } catch (error) {
    throw new Error(`Failed to generate QR code image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate QR code image as buffer
 * @param {string} url - URL to encode in QR
 * @param {object} options - QR code options
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function generateQRCodeBuffer(
  url: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<Buffer> {
  const qrOptions = {
    width: options?.width || 400,
    margin: options?.margin || 2,
    color: {
      dark: options?.color?.dark || '#000000',
      light: options?.color?.light || '#FFFFFF',
    },
    errorCorrectionLevel: 'M' as const,
  };
  
  try {
    const buffer = await QRCode.toBuffer(url, qrOptions);
    return buffer;
  } catch (error) {
    throw new Error(`Failed to generate QR code buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if membership is expired
 * @param {Date | null} endDate - Membership end date
 * @returns {boolean} True if expired
 */
export function isMembershipExpired(endDate: Date | null): boolean {
  if (!endDate) return true;
  return new Date() > new Date(endDate);
}

/**
 * Calculate membership status based on dates
 * @param {Date | null} startDate - Membership start date
 * @param {Date | null} endDate - Membership end date
 * @param {boolean} isActive - Restaurant active status
 * @returns {'ACTIVE' | 'EXPIRED' | 'SUSPENDED'} Membership status
 */
export function calculateMembershipStatus(
  startDate: Date | null,
  endDate: Date | null,
  isActive: boolean = true
): 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' {
  if (!isActive) return 'SUSPENDED';
  if (!endDate) return 'EXPIRED';
  
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = new Date(endDate);
  
  // Not yet started
  if (start && now < start) return 'SUSPENDED';
  
  // Expired
  if (now > end) return 'EXPIRED';
  
  // Active
  return 'ACTIVE';
}
