'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, useParams } from 'next/navigation';
import { 
  LineChart, 
  Users, 
  Eye, 
  QrCode, 
  MousePointerClick, 
  ArrowLeft,
  Store,
  TrendingUp,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface KPI {
  label: string;
  value: number;
  icon: any;
}

export default function RestaurantAnalyticsDetailPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const restaurantId = params?.restaurantId as string;

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
      return;
    }
    if (restaurantId) {
      fetchRestaurantAnalytics();
    }
  }, [user, restaurantId, dateRange]);

  const fetchRestaurantAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        restaurantId: restaurantId,
      });

      // Fetch summary for this restaurant
      const summaryRes = await fetch(`/api/superadmin/analytics/summary?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();

      if (summaryData.success) {
        const data = summaryData.data;
        setKpis([
          { label: 'Toplam Ziyaret', value: data.totalVisits, icon: Eye },
          { label: 'Tekil Ziyaretçi', value: data.uniqueVisitors, icon: Users },
          { label: 'QR Okutma', value: data.qrScans, icon: QrCode },
          { label: 'Menü Görüntüleme', value: data.menuViews, icon: LineChart },
          { label: 'Ürün Görüntüleme', value: data.productViews, icon: Store },
          { label: 'İletişim Tıklaması', value: data.contactClicks, icon: MousePointerClick },
        ]);
      }

      // Fetch restaurant info
      const restaurantRes = await fetch(`/api/restaurants/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const restaurantData = await restaurantRes.json();
      if (restaurantData.success) {
        setRestaurantName(restaurantData.data.name);
      }

    } catch (error) {
      console.error('Error fetching restaurant analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  return (
    <DashboardLayout title={`Restoran Analitik - ${restaurantName}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/analytics"
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{restaurantName}</h1>
            <p className="text-gray-500 mt-1">Detaylı performans analizi</p>
          </div>
          <Link
            href={`/admin/restaurants/${restaurantId}`}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Restoranı Yönet
          </Link>
        </div>

        {/* Date Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7">Son 7 Gün</option>
              <option value="30">Son 30 Gün</option>
              <option value="90">Son 90 Gün</option>
            </select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">{kpi.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(kpi.value)}</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <kpi.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder for more charts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zaman Serisi</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Restoran ziyaret trendi grafiği</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popüler Ürünler</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>En çok görüntülenen ürünler</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
