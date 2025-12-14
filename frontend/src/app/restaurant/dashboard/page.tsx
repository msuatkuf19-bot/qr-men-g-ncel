'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface DashboardStats {
  categories: number;
  products: number;
  qrCodes: number;
  views: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count: {
    categories: number;
    qrCodes: number;
  };
  categories: Array<{
    id: string;
    name: string;
    _count: { products: number };
  }>;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: { name: string };
  isAvailable: boolean;
}

// Skeleton component for loading states
const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// Stat card component for consistent styling
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  loading = false,
  emptyHint,
  href
}: { 
  title: string; 
  value: number; 
  subtitle: string; 
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  loading?: boolean;
  emptyHint?: string;
  href?: string;
}) => {
  // All colors derived from primary brand blue
  const colorClasses = {
    blue: 'text-primary-600 bg-primary-50 group-hover:bg-primary-100',
    green: 'text-primary-600 bg-primary-50/70 group-hover:bg-primary-100',
    purple: 'text-primary-600 bg-primary-50/80 group-hover:bg-primary-100',
    orange: 'text-primary-600 bg-primary-50/60 group-hover:bg-primary-100',
  };

  const content = (
    <>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500 tracking-wide">{title}</h3>
        <div className={`w-11 h-11 rounded-xl ${colorClasses[color]} flex items-center justify-center transition-colors duration-200`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-10 w-24 mb-2" />
      ) : (
        <p className="text-4xl sm:text-[2.75rem] font-extrabold text-gray-900 mb-1 tracking-tight">
          {value}
        </p>
      )}
      <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
      {!loading && value === 0 && emptyHint && (
        <a href={href || '#'} className="inline-flex items-center gap-1 text-xs text-primary-500 mt-3 font-semibold hover:text-primary-600 transition-colors">
          {emptyHint}
        </a>
      )}
    </>
  );

  return (
    <div className="group bg-white p-5 sm:p-6 rounded-2xl shadow-soft border border-gray-100/80 hover:shadow-soft-lg hover:border-primary-200 hover:-translate-y-1 transition-all duration-200 cursor-default">
      {content}
    </div>
  );
};

// Action card component - all using brand primary color
const ActionCard = ({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <a
      href={href}
      className="group relative bg-white p-5 sm:p-6 rounded-2xl shadow-soft border border-gray-100/80 hover:border-primary-300 hover:shadow-soft-lg hover:bg-primary-50/30 transition-all duration-200 flex items-center gap-4 hover:-translate-y-0.5"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
        <div className="text-primary-500 group-hover:text-primary-600 transition-colors">{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-0.5">
          {title}
        </h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-primary-100 flex items-center justify-center transition-all">
        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
};

export default function RestaurantDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    categories: 0,
    products: 0,
    qrCodes: 0,
    views: 0,
  });
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Kendi restoranını getir
      const restaurantRes = await apiClient.getMyRestaurant();
      const restaurantData = restaurantRes.data;
      setRestaurant(restaurantData);

      // Kategorileri ve ürünleri say
      const totalCategories = restaurantData.categories?.length || 0;
      let totalProducts = 0;
      restaurantData.categories?.forEach((cat: any) => {
        totalProducts += cat._count?.products || 0;
      });

      // Ürün listesini getir
      try {
        const productsRes = await apiClient.getProducts(restaurantData.id);
        setRecentProducts(productsRes.data?.slice(0, 5) || []);
      } catch (err) {
        console.log('Ürünler yüklenemedi:', err);
      }

      // Analytics verileri - Yeni endpoint kullan
      let totalViews = 0;
      try {
        const analyticsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/restaurant/${restaurantData.id}/overview`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          totalViews = analyticsData.data?.summary?.weekViews || 0;
        }
      } catch (err) {
        console.log('Analytics verisi alınamadı:', err);
      }

      setStats({
        categories: totalCategories,
        products: totalProducts,
        qrCodes: restaurantData._count?.qrCodes || 0,
        views: totalViews,
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyMenuLink = () => {
    if (restaurant?.slug) {
      const menuUrl = `${window.location.origin}/m/${restaurant.slug}`;
      navigator.clipboard.writeText(menuUrl);
      // Could add a toast notification here
    }
  };

  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
      <DashboardLayout title="🏪 Restoran Yönetim Paneli">
        {loading ? (
          // Loading skeleton
          <div className="space-y-6">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Restaurant Hero Card - Premium Style */}
            {restaurant && (
              <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg">
                {/* Background Pattern - Subtle grid */}
                <div className="absolute inset-0 opacity-[0.07]">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="heroGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#heroGrid)" />
                  </svg>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary-400/20 rounded-full blur-xl"></div>
                
                <div className="relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">{restaurant.name}</h2>
                      <p className="text-primary-100/90 mb-5 text-sm sm:text-base max-w-lg leading-relaxed">
                        {restaurant.description || 'Restoranınızın açıklamasını ayarlardan ekleyebilirsiniz'}
                      </p>
                      
                      {/* Quick Stats Chips - Compact & brand-consistent */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">
                          <svg className="w-3.5 h-3.5 text-primary-200" fill="currentColor" viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                          <span>{stats.categories} Kategori</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">
                          <svg className="w-3.5 h-3.5 text-primary-200" fill="currentColor" viewBox="0 0 24 24"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>
                          <span>{stats.products} Ürün</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-medium border border-white/10">
                          <svg className="w-3.5 h-3.5 text-primary-200" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5z"/></svg>
                          <span>{stats.qrCodes} QR Kod</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Menu Link Actions */}
                    <div className="flex flex-col gap-3 sm:min-w-[200px]">
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm border border-white/10">
                        <svg className="w-4 h-4 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="font-mono text-white/90">/{restaurant.slug}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={copyMenuLink}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-primary-600 rounded-xl text-sm font-semibold hover:bg-primary-50 hover:shadow-lg transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Kopyala
                        </button>
                        <a
                          href={`/m/${restaurant.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border-2 border-white/40 text-white rounded-xl text-sm font-semibold hover:bg-white/10 hover:border-white/60 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Menüyü Gör
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard
                title="Kategoriler"
                value={stats.categories}
                subtitle="Aktif kategoriler"
                icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>}
                color="blue"
                loading={loading}
                emptyHint="İlk kategorini ekleyerek başla →"
              />
              <StatCard
                title="Ürünler"
                value={stats.products}
                subtitle="Toplam ürün"
                icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/></svg>}
                color="green"
                loading={loading}
                emptyHint="Menüne ürün ekle →"
              />
              <StatCard
                title="QR Kodlar"
                value={stats.qrCodes}
                subtitle="Aktif QR kodlar"
                icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm4 4H7V7h2v2zm4-6h8v8h-8V3zm2 2v4h4V5h-4zm4 4h-2V7h2v2zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm4 4H7v-2h2v2zm6-6h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2-2h2v2h-2v-2z"/></svg>}
                color="purple"
                loading={loading}
                emptyHint="QR kod oluştur →"
              />
              <StatCard
                title="Görüntülenme"
                value={stats.views}
                subtitle="Haftalık erişim"
                icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>}
                color="orange"
                loading={loading}
              />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
                Hızlı İşlemler
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ActionCard
                  href="/restaurant/menu"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                  title="Yeni Ürün Ekle"
                  description="Menünüze yeni ürün ekleyin"
                />
                <ActionCard
                  href="/restaurant/categories"
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
                  title="Kategori Yönet"
                  description="Kategorileri düzenleyin"
                />
                <ActionCard
                  href="/restaurant/qr-codes"
                  icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm4 4H7V7h2v2zm4-6h8v8h-8V3zm2 2v4h4V5h-4zm4 4h-2V7h2v2zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm4 4H7v-2h2v2zm6-6h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2-2h2v2h-2v-2z"/></svg>}
                  title="QR Kod Oluştur"
                  description="Yeni QR kod oluşturun"
                />
              </div>
            </div>

            {/* Recent Products */}
            {recentProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Son Eklenen Ürünler</h2>
                  <a href="/restaurant/menu" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 group">
                    Tümünü Gör
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                <div className="divide-y divide-gray-50">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                          🍽️
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.category.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-900">{product.price.toFixed(2)} ₺</span>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            product.isAvailable
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {product.isAvailable ? 'Mevcut' : 'Tükendi'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
