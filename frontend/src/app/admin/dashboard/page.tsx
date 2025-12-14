'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Crown, QrCode, Store, TrendingUp, Users } from 'lucide-react';

interface DashboardStats {
  restaurants: number;
  users: number;
  qrScans: number;
  activeRestaurants: number;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  owner: { name: string; email: string };
  _count: { categories: number; qrCodes: number };
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    restaurants: 0,
    users: 0,
    qrScans: 0,
    activeRestaurants: 0,
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Tüm restoranları getir
      const restaurantsRes = await apiClient.getRestaurants();
      const restaurantsData = restaurantsRes.data || [];
      setRestaurants(restaurantsData);

      // Kullanıcı istatistikleri - custom endpoint
      let usersData = { totalUsers: 0 };
      try {
        const result = await apiClient.getUserStats();
        usersData = result.data || usersData;
      } catch (err) {
        console.log('Kullanıcı stats alınamadı:', err);
      }

      // QR scan istatistikleri (analytics'ten)
      let totalScans = 0;
      try {
        const analyticsRes = await apiClient.getAnalytics();
        const analyticsData = analyticsRes.data || [];
        totalScans = analyticsData.length;
      } catch (err) {
        console.log('Analytics verisi alınamadı:', err);
      }

      setStats({
        restaurants: restaurantsData.length,
        users: usersData.totalUsers || 0,
        qrScans: totalScans,
        activeRestaurants: restaurantsData.filter((r: Restaurant) => r._count.categories > 0).length,
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col gap-4 sm:gap-5">
                <nav aria-label="Breadcrumb" className="text-[12px] text-slate-500">
                  <ol className="flex flex-wrap items-center gap-1">
                    <li>Admin</li>
                    <li className="text-slate-300">/</li>
                    <li>Süper Admin</li>
                    <li className="text-slate-300">/</li>
                    <li className="text-slate-600">Dashboard</li>
                  </ol>
                </nav>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10">
                        <Crown className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                          Süper Admin Dashboard
                        </h1>
                        <p className="mt-1 text-[13px] sm:text-[14px] text-slate-500">
                          Sistem genel metrikleri ve son eklenen restoranlar.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      type="button"
                      className="h-11 px-4 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200 font-semibold text-sm"
                    >
                      Rapor İndir
                    </button>
                    <button
                      type="button"
                      className="h-11 px-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors duration-200 font-semibold text-sm shadow-sm"
                    >
                      Yeni Restoran
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[12px] font-medium ring-1 ring-slate-200/60">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                    Sistem: Normal
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[12px] font-medium ring-1 ring-slate-200/60">
                    Son güncelleme: {new Date().toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.02em] text-slate-500">
                      Toplam Restoran
                    </div>
                    <div className="mt-2 text-[28px] sm:text-[32px] leading-none font-bold tabular-nums text-blue-600">
                      {stats.restaurants}
                    </div>
                    <div className="mt-2 text-[12px] sm:text-[13px] text-slate-500">
                      {stats.activeRestaurants} aktif
                    </div>
                  </div>

                  <div className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-blue-50 ring-1 ring-blue-100/80 flex items-center justify-center">
                    <Store className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-blue-600" strokeWidth={1.9} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.02em] text-slate-500">
                      Toplam Kullanıcı
                    </div>
                    <div className="mt-2 text-[28px] sm:text-[32px] leading-none font-bold tabular-nums text-indigo-600">
                      {stats.users}
                    </div>
                    <div className="mt-2 text-[12px] sm:text-[13px] text-slate-500">Tüm roller</div>
                  </div>

                  <div className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-indigo-50 ring-1 ring-indigo-100/80 flex items-center justify-center">
                    <Users className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-indigo-600" strokeWidth={1.9} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.02em] text-slate-500">
                      QR Tarama
                    </div>
                    <div className="mt-2 text-[28px] sm:text-[32px] leading-none font-bold tabular-nums text-purple-600">
                      {stats.qrScans}
                    </div>
                    <div className="mt-2 text-[12px] sm:text-[13px] text-slate-500">Toplam görüntülenme</div>
                  </div>

                  <div className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-purple-50 ring-1 ring-purple-100/80 flex items-center justify-center">
                    <QrCode className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-purple-600" strokeWidth={1.9} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-default">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] sm:text-[13px] font-semibold uppercase tracking-[0.02em] text-slate-500">
                      Aktif Oran
                    </div>
                    <div className="mt-2 text-[28px] sm:text-[32px] leading-none font-bold tabular-nums text-orange-600">
                      {stats.restaurants > 0 ? Math.round((stats.activeRestaurants / stats.restaurants) * 100) : 0}%
                    </div>
                    <div className="mt-2 text-[12px] sm:text-[13px] text-slate-500">Menüsü olan</div>
                  </div>

                  <div className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-orange-50 ring-1 ring-orange-100/80 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 sm:h-[22px] sm:w-[22px] text-orange-600" strokeWidth={1.9} aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Restaurants */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Son Eklenen Restoranlar</h2>
                <a href="/admin/restaurants" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  Tümünü Gör →
                </a>
              </div>

              {restaurants.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Henüz restoran eklenmemiş</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Restoran</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Sahip</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">Kategori</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">QR Kod</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Oluşturulma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.slice(0, 5).map((restaurant) => (
                        <tr key={restaurant.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{restaurant.name}</div>
                              <div className="text-sm text-gray-500">/{restaurant.slug}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <div className="text-sm text-gray-900">{restaurant.owner.name}</div>
                              <div className="text-xs text-gray-500">{restaurant.owner.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {restaurant._count.categories}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                              {restaurant._count.qrCodes}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(restaurant.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
