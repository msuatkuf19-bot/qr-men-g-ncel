import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Token ekle
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const authData = localStorage.getItem('auth-storage');
          if (authData) {
            try {
              const { state } = JSON.parse(authData);
              if (state?.accessToken) {
                config.headers.Authorization = `Bearer ${state.accessToken}`;
              }
            } catch (error) {
              console.error('Auth data parse error:', error);
            }
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Token refresh ve hata yönetimi
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<any>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.tryRefreshToken();
            this.processQueue(null, newToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-storage');
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async tryRefreshToken(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Cannot refresh token on server side');
    }

    const authData = localStorage.getItem('auth-storage');
    if (!authData) {
      throw new Error('No auth data found');
    }

    const { state } = JSON.parse(authData);
    if (!state?.refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refreshToken: state.refreshToken,
    });

    const newAccessToken = response.data.data.accessToken;
    
    // Zustand store'u güncelle
    const updatedState = {
      ...state,
      accessToken: newAccessToken,
    };
    localStorage.setItem('auth-storage', JSON.stringify({ state: updatedState }));

    return newAccessToken;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // Auth
  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password });
    return data;
  }

  async register(userData: any) {
    const { data } = await this.client.post('/auth/register', userData);
    return data;
  }

  async getProfile() {
    const { data } = await this.client.get('/auth/profile');
    return data;
  }

  // Restaurants
  async getRestaurants() {
    const { data } = await this.client.get('/restaurants');
    return data;
  }

  async getRestaurant(id: string) {
    const { data } = await this.client.get(`/restaurants/${id}`);
    return data;
  }

  async getMyRestaurant() {
    const response = await this.client.get('/restaurants/my-restaurant');
    return response.data; // { success: true, message: '...', data: restaurant }
  }

  async createRestaurant(restaurantData: any) {
    const { data } = await this.client.post('/restaurants', restaurantData);
    return data;
  }

  async updateRestaurant(id: string, restaurantData: any) {
    const { data } = await this.client.put(`/restaurants/${id}`, restaurantData);
    return data;
  }

  async deleteRestaurant(id: string) {
    const { data } = await this.client.delete(`/restaurants/${id}`);
    return data;
  }

  // Users (Super Admin)
  async getUsers() {
    const { data } = await this.client.get('/users');
    return data;
  }

  async getUserStats() {
    const { data } = await this.client.get('/users/stats');
    return data;
  }

  async createUser(userData: any) {
    const { data } = await this.client.post('/users', userData);
    return data;
  }

  async updateUser(id: string, userData: any) {
    const { data } = await this.client.put(`/users/${id}`, userData);
    return data;
  }

  async deleteUser(id: string) {
    const { data } = await this.client.delete(`/users/${id}`);
    return data;
  }

  // Menu - Categories
  async getCategories(restaurantId?: string) {
    const { data } = await this.client.get('/menu/categories', {
      params: { restaurantId },
    });
    return data;
  }

  async createCategory(categoryData: any) {
    const { data } = await this.client.post('/menu/categories', categoryData);
    return data;
  }

  async updateCategory(id: string, categoryData: any) {
    const { data } = await this.client.put(`/menu/categories/${id}`, categoryData);
    return data;
  }

  async deleteCategory(id: string) {
    const { data } = await this.client.delete(`/menu/categories/${id}`);
    return data;
  }

  async reorderCategories(categoryIdsInOrder: string[]) {
    const { data } = await this.client.patch('/menu/categories/reorder', { categoryIdsInOrder });
    return data;
  }

  // Menu - Products
  async getProducts(categoryId?: string, restaurantId?: string) {
    const { data } = await this.client.get('/menu/products', {
      params: { categoryId, restaurantId },
    });
    return data;
  }

  async createProduct(productData: any) {
    const { data } = await this.client.post('/menu/products', productData);
    return data;
  }

  async updateProduct(id: string, productData: any) {
    const { data } = await this.client.put(`/menu/products/${id}`, productData);
    return data;
  }

  async deleteProduct(id: string) {
    const { data } = await this.client.delete(`/menu/products/${id}`);
    return data;
  }

  // QR Codes
  async createQRCode(qrData: any) {
    const { data } = await this.client.post('/qr', qrData);
    return data;
  }

  async getQRCodes(restaurantId: string) {
    const { data } = await this.client.get(`/qr/restaurant/${restaurantId}`);
    return data;
  }

  async updateQRCode(id: string, qrData: any) {
    const { data } = await this.client.put(`/qr/${id}`, qrData);
    return data;
  }

  async deleteQRCode(id: string) {
    const { data } = await this.client.delete(`/qr/${id}`);
    return data;
  }

  async downloadQRCode(id: string) {
    const { data } = await this.client.get(`/qr/${id}/download`, {
      responseType: 'blob',
    });
    return data;
  }

  // Analytics
  async getDashboard() {
    const { data } = await this.client.get('/analytics/dashboard');
    return data;
  }

  async getAnalytics(startDate?: string, endDate?: string) {
    const { data } = await this.client.get('/analytics', {
      params: { startDate, endDate },
    });
    return data;
  }

  async getRestaurantAnalytics(restaurantId: string, startDate?: string, endDate?: string) {
    const { data } = await this.client.get(`/analytics/restaurant/${restaurantId}`, {
      params: { startDate, endDate },
    });
    return data;
  }

  // Public
  async getPublicMenu(slug: string, table?: string) {
    const { data } = await this.client.get(`/public/menu/${slug}`, {
      params: { table },
    });
    return data;
  }

  // Demo Requests (Public create, Super Admin manage)
  async createDemoRequest(payload: {
    fullName: string;
    restaurantName: string;
    phone: string;
    email?: string | null;
    restaurantType?: string;
    tableCount?: number;
  }) {
    const { data } = await this.client.post('/demo-requests', payload);
    return data;
  }

  async getDemoRequests() {
    const { data } = await this.client.get('/demo-requests');
    return data;
  }

  async updateDemoRequestStatus(id: string, updateData: { 
    status: 'PENDING' | 'DEMO_CREATED' | 'FOLLOW_UP' | 'NEGATIVE',
    potential?: 'HIGH_PROBABILITY' | 'LONG_TERM',
    followUpMonth?: string | null,
    membershipStartDate?: string | null,
    membershipEndDate?: string | null
  }) {
    const { data } = await this.client.patch(`/demo-requests/${id}/status`, updateData);
    return data;
  }

  async deleteDemoRequest(id: string) {
    const { data } = await this.client.delete(`/demo-requests/${id}`);
    return data;
  }

  async getProductDetail(id: string) {
    const { data } = await this.client.get(`/public/product/${id}`);
    return data;
  }

  // Files
  async uploadFile(file: File, type: 'logo' | 'product' | 'qr') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const { data } = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  }
}

export const apiClient = new ApiClient();
