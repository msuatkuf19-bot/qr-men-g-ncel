/**
 * Restaurant Type Definitions
 * Shared types for restaurant management
 */

export type BusinessType = 'RESTORAN' | 'KAFE' | 'OTEL' | 'DIGER';
export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
export type UserRole = 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'CUSTOMER';

export interface Restaurant {
  id: string;
  memberNo: string | null;
  businessType: BusinessType;
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  googleMapsUrl?: string | null;
  workingHours?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  fullAddress?: string | null;
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  internalNote?: string | null;
  logo?: string | null;
  headerImage?: string | null;
  themeColor?: string | null;
  themeSettings?: string | null;
  isActive: boolean;
  membershipStatus: MembershipStatus;
  membershipStartDate: Date | string | null;
  membershipEndDate: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  qrCodes?: QRCode[];
  _count?: {
    categories?: number;
    qrCodes?: number;
  };
}

export interface QRCode {
  id: string;
  code: string;
  imageData?: string | null;
  imageUrl?: string | null;
  scanCount: number;
  isActive: boolean;
  lastScannedAt?: Date | string | null;
  createdAt: Date | string;
  restaurantId: string;
}

export interface CreateRestaurantInput {
  // Business info
  businessType: BusinessType;
  name: string;
  slug?: string;
  description?: string;
  phone: string;
  email?: string;
  googleMapsUrl?: string;
  workingHours?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  fullAddress: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  internalNote?: string;
  themeColor?: string;
  
  // Membership
  membershipStartDate: string;
  membershipEndDate: string;
  
  // Owner
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface UpdateRestaurantInput extends Partial<CreateRestaurantInput> {
  id: string;
  isActive?: boolean;
  membershipStatus?: MembershipStatus;
}

export interface RestaurantFormData {
  // Business info
  businessType: BusinessType;
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  workingHours: string;
  instagramUrl: string;
  facebookUrl: string;
  fullAddress: string;
  internalNote: string;
  
  // Membership
  membershipStartDate: string;
  membershipEndDate: string;
  
  // Owner
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface SlugCheckResponse {
  slug: string;
  available: boolean;
  message: string;
}

export interface CreateRestaurantResponse {
  restaurant: Restaurant;
  qrCode: {
    id: string;
    code: string;
    imageData: string;
    menuUrl: string;
  };
  menuUrl: string;
}
