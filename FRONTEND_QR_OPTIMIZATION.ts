// Frontend QR API Client Optimizasyonu
// Bu dosyayı frontend/src/lib/qr-api-client.ts olarak ekleyin

interface QRMenuResponse {
  success: boolean;
  data: {
    restaurant: any;
    categories: any[];
    _meta?: {
      isLiteMode?: boolean;
      supportsLazyLoad?: boolean;
      totalProductsShown?: number;
      lazyLoadEndpoint?: string;
    };
  };
}

export class QRApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // İlk yükleme - Lite mode ile hızlı başlangıç
  async getMenuLite(slug: string): Promise<QRMenuResponse> {
    console.log(`[QR-CLIENT] Loading lite menu for ${slug}...`);
    const start = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/public/menu/${slug}?lite=true`);
      const data = await response.json();
      
      const duration = Date.now() - start;
      console.log(`[QR-CLIENT] Lite menu loaded in ${duration}ms`);
      
      return data;
    } catch (error) {
      console.error('[QR-CLIENT] Lite menu load failed:', error);
      throw error;
    }
  }

  // Full menü - Kullanıcı ihtiyaç duyduğunda
  async getMenuFull(slug: string): Promise<QRMenuResponse> {
    console.log(`[QR-CLIENT] Loading full menu for ${slug}...`);
    const start = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/public/menu/${slug}`);
      const data = await response.json();
      
      const duration = Date.now() - start;
      console.log(`[QR-CLIENT] Full menu loaded in ${duration}ms`);
      
      return data;
    } catch (error) {
      console.error('[QR-CLIENT] Full menu load failed:', error);
      throw error;
    }
  }

  // Lazy loading - Belirli kategori ürünleri
  async getCategoryProducts(slug: string, categoryId: string, limit?: number): Promise<any> {
    console.log(`[QR-CLIENT] Loading category ${categoryId} products...`);
    const start = Date.now();
    
    try {
      const url = `${this.baseUrl}/api/public/menu/${slug}?lazy=true&categoryId=${categoryId}${limit ? `&limit=${limit}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const duration = Date.now() - start;
      console.log(`[QR-CLIENT] Category products loaded in ${duration}ms`);
      
      return data;
    } catch (error) {
      console.error('[QR-CLIENT] Category products load failed:', error);
      throw error;
    }
  }
}

// Kullanım örnegi:
/*
const qrClient = new QRApiClient();

// 1. İlk yükleme - Lite mode ile hızlı başlangıç
const liteMenu = await qrClient.getMenuLite('restaurant-slug');
// UI'da kategorileri ve ilk birkaç ürünü göster

// 2. Kullanıcı "Daha fazla ürün göster" dediğinde
const fullMenu = await qrClient.getMenuFull('restaurant-slug');
// UI'da tüm ürünleri göster

// 3. Kullanıcı başka kategoriye tıkladığında
const categoryProducts = await qrClient.getCategoryProducts('restaurant-slug', 'category-id');
// O kategorinin ürünlerini lazy load et
*/

export default QRApiClient;