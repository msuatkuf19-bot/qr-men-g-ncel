/**
 * Restaurant Form Validation Schemas
 * Zod validation schemas for restaurant creation and update
 */

import { z } from 'zod';

// Business type enum
export const businessTypeSchema = z.enum(['RESTORAN', 'KAFE', 'OTEL', 'DIGER'], {
  required_error: 'İşletme tipi seçilmelidir',
});

// Turkish phone number regex
const phoneRegex = /^(\+90|0)?[1-9]\d{9}$/;

// URL validation helper
const urlSchema = z.string().url('Geçerli bir URL giriniz').or(z.literal(''));

// Email validation
const emailSchema = z.string().email('Geçerli bir email adresi giriniz');

/**
 * Restaurant Creation Schema
 * Used for creating new restaurants
 */
export const createRestaurantSchema = z.object({
  // Business Information
  businessType: businessTypeSchema,
  name: z.string()
    .min(2, 'Restoran adı en az 2 karakter olmalıdır')
    .max(100, 'Restoran adı en fazla 100 karakter olmalıdır'),
  slug: z.string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .max(100, 'Slug en fazla 100 karakter olmalıdır')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .optional(),
  description: z.string()
    .max(500, 'Açıklama en fazla 500 karakter olmalıdır')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .min(10, 'Telefon numarası en az 10 karakter olmalıdır')
    .refine((val) => phoneRegex.test(val.replace(/\s/g, '')), {
      message: 'Geçerli bir telefon numarası giriniz (örn: 0532 123 4567)',
    }),
  email: emailSchema.optional().or(z.literal('')),
  googleMapsUrl: urlSchema.optional(),
  workingHours: z.string()
    .max(200, 'Çalışma saatleri en fazla 200 karakter olmalıdır')
    .optional()
    .or(z.literal('')),
  instagramUrl: urlSchema.optional(),
  facebookUrl: urlSchema.optional(),
  fullAddress: z.string()
    .min(10, 'Adres en az 10 karakter olmalıdır')
    .max(300, 'Adres en fazla 300 karakter olmalıdır'),
  city: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  neighborhood: z.string().optional().or(z.literal('')),
  internalNote: z.string()
    .max(1000, 'Not en fazla 1000 karakter olmalıdır')
    .optional()
    .or(z.literal('')),
  themeColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir renk kodu giriniz (örn: #3B82F6)')
    .optional()
    .or(z.literal('')),
  
  // Membership Dates
  membershipStartDate: z.string()
    .min(1, 'Üyelik başlangıç tarihi zorunludur')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Geçerli bir tarih giriniz',
    }),
  membershipEndDate: z.string()
    .min(1, 'Üyelik bitiş tarihi zorunludur')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Geçerli bir tarih giriniz',
    }),
  
  // Owner Information
  ownerName: z.string()
    .min(2, 'Sahip adı en az 2 karakter olmalıdır')
    .max(100, 'Sahip adı en fazla 100 karakter olmalıdır'),
  ownerEmail: emailSchema,
  ownerPassword: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .max(100, 'Şifre en fazla 100 karakter olmalıdır'),
}).refine((data) => {
  // Check if end date is after start date
  const start = new Date(data.membershipStartDate);
  const end = new Date(data.membershipEndDate);
  return end > start;
}, {
  message: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır',
  path: ['membershipEndDate'],
});

/**
 * Restaurant Update Schema
 * Used for updating existing restaurants
 */
export const updateRestaurantSchema = z.object({
  businessType: businessTypeSchema.optional(),
  name: z.string()
    .min(2, 'Restoran adı en az 2 karakter olmalıdır')
    .max(100, 'Restoran adı en fazla 100 karakter olmalıdır')
    .optional(),
  slug: z.string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .max(100, 'Slug en fazla 100 karakter olmalıdır')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir')
    .optional(),
  description: z.string()
    .max(500, 'Açıklama en fazla 500 karakter olmalıdır')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .min(10, 'Telefon numarası en az 10 karakter olmalıdır')
    .refine((val) => phoneRegex.test(val.replace(/\s/g, '')), {
      message: 'Geçerli bir telefon numarası giriniz',
    })
    .optional(),
  email: emailSchema.optional().or(z.literal('')),
  googleMapsUrl: urlSchema.optional(),
  workingHours: z.string().max(200).optional().or(z.literal('')),
  instagramUrl: urlSchema.optional(),
  facebookUrl: urlSchema.optional(),
  fullAddress: z.string().max(300).optional(),
  city: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  neighborhood: z.string().optional().or(z.literal('')),
  internalNote: z.string().max(1000).optional().or(z.literal('')),
  themeColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Geçerli bir renk kodu giriniz')
    .optional()
    .or(z.literal('')),
  membershipStartDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Geçerli bir tarih giriniz',
    })
    .optional(),
  membershipEndDate: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Geçerli bir tarih giriniz',
    })
    .optional(),
  isActive: z.boolean().optional(),
});

/**
 * Slug Generation Schema
 */
export const slugGenerationSchema = z.object({
  name: z.string().min(1, 'Restoran adı gereklidir'),
});

/**
 * Type exports from schemas
 */
export type CreateRestaurantFormData = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantFormData = z.infer<typeof updateRestaurantSchema>;
export type SlugGenerationData = z.infer<typeof slugGenerationSchema>;

/**
 * Default form values
 */
export const defaultRestaurantFormValues: Partial<CreateRestaurantFormData> = {
  businessType: 'RESTORAN',
  name: '',
  slug: '',
  description: '',
  phone: '',
  email: '',
  googleMapsUrl: '',
  workingHours: '09:00 - 22:00',
  instagramUrl: '',
  facebookUrl: '',
  fullAddress: '',
  city: '',
  district: '',
  neighborhood: '',
  internalNote: '',
  themeColor: '#3B82F6',
  membershipStartDate: new Date().toISOString().split('T')[0],
  membershipEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +1 year
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
};
