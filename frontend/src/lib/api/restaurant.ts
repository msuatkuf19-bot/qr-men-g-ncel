/**
 * Restaurant API Client
 * API functions for restaurant CRUD operations
 */

import axios from 'axios';
import type {
  Restaurant,
  CreateRestaurantInput,
  UpdateRestaurantInput,
  CreateRestaurantResponse,
  SlugCheckResponse,
} from '@/types/restaurant';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Create axios instance with auth
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Restaurant API Functions
 */
export const restaurantApi = {
  /**
   * Get all restaurants (Super Admin only)
   */
  async getAll(): Promise<Restaurant[]> {
    const { data } = await api.get('/api/admin/restaurants');
    return data.data;
  },

  /**
   * Get single restaurant by ID
   */
  async getById(id: string): Promise<Restaurant> {
    const { data } = await api.get(`/api/admin/restaurants/${id}`);
    return data.data;
  },

  /**
   * Get my restaurant (Restaurant Admin)
   */
  async getMy(): Promise<Restaurant> {
    const { data } = await api.get('/api/admin/restaurants/my-restaurant');
    return data.data;
  },

  /**
   * Create new restaurant with owner and QR code
   */
  async create(input: CreateRestaurantInput): Promise<CreateRestaurantResponse> {
    const { data } = await api.post('/api/admin/restaurants', input);
    return data.data;
  },

  /**
   * Update restaurant
   */
  async update(id: string, input: UpdateRestaurantInput): Promise<Restaurant> {
    const { data } = await api.put(`/api/admin/restaurants/${id}`, input);
    return data.data;
  },

  /**
   * Delete restaurant (Super Admin only)
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/admin/restaurants/${id}`);
  },

  /**
   * Check if slug is available
   */
  async checkSlug(slug: string, excludeId?: string): Promise<SlugCheckResponse> {
    const params = new URLSearchParams({ slug });
    if (excludeId) params.append('excludeId', excludeId);
    
    const { data } = await api.get(`/api/admin/restaurants/check-slug?${params.toString()}`);
    return data.data;
  },

  /**
   * Generate slug from name
   */
  async generateSlug(name: string): Promise<{ name: string; slug: string }> {
    const { data } = await api.post('/api/admin/restaurants/generate-slug', { name });
    return data.data;
  },
};

/**
 * React Query Keys
 */
export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (filters?: any) => [...restaurantKeys.lists(), filters] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
  my: () => [...restaurantKeys.all, 'my'] as const,
};
