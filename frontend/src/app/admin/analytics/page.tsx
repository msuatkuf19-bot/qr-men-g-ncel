'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { 
  LineChart, 
  Users, 
  Eye, 
  QrCode, 
  MousePointerClick, 
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Store,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface KPI {
  label: string;
  value: number;
  change: number;
  icon: any;
}

interface RestaurantRow {
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  totalVisits: number;
  qrScans: number;
  uniqueVisitors: number;
  productViews: number;
  contactClicks: number;
  lastActivity: string | null;
  isActive: boolean;
}

interface TimeSeriesPoint {
  date: string;
  totalVisits: number;
  qrScans: number;
}

interface DeviceData {
  mobile: number;
  desktop: number;
  tablet: number;
}

export default function SuperAdminAnalyticsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [deviceFilter, setDeviceFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceData>({ mobile: 0, desktop: 0, tablet: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
      return;
    }
    fetchAnalytics();
  }, [user, dateRange, deviceFilter, sourceFilter, page]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        device: deviceFilter,
        source: sourceFilter,
        page: page.toString(),
        limit: '10'
      });

      // Fetch summary
      const summaryRes = await fetch(`/api/superadmin/analytics/summary?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const summaryData = await summaryRes.json();

      if (summaryData.success) {
        const data = summaryData.data;
        setKpis([
          { label: 'Toplam Ziyaret', value: data.totalVisits, change: data.change.totalVisits, icon: Eye },
          { label: 'Tekil Ziyaretçi', value: data.uniqueVisitors, change: data.change.uniqueVisitors, icon: Users },
          { label: 'QR Okutma', value: data.qrScans, change: data.change.qrScans, icon: QrCode },
          { label: 'Menü Görüntüleme', value: data.menuViews, change: 0, icon: LineChart },
          { label: 'Ürün Görüntüleme', value: data.productViews, change: 0, icon: Store },
          { label: 'İletişim Tıklaması', value: data.contactClicks, change: 0, icon: MousePointerClick },
        ]);
      }

      // Fetch restaurants
      const restaurantsRes = await fetch(`/api/superadmin/analytics/restaurants?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const restaurantsData = await restaurantsRes.json();
      if (restaurantsData.success) {
        setRestaurants(restaurantsData.data.restaurants);
        setTotal(restaurantsData.data.total);
      }

      // Fetch timeseries
      const timeseriesRes = await fetch(`/api/superadmin/analytics/timeseries?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const timeseriesData = await timeseriesRes.json();
      if (timeseriesData.success) {
        setTimeSeries(timeseriesData.data);
      }

      // Fetch device breakdown
      const deviceRes = await fetch(`/api/superadmin/analytics/device-breakdown?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const deviceData = await deviceRes.json();
      if (deviceData.success) {
        setDeviceBreakdown(deviceData.data);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - parseInt(dateRange));

      const params = new URLSearchParams({
        from: from.toISOString(),
        to: to.toISOString(),
        device: deviceFilter,
        source: sourceFilter,
      });

      const response = await fetch(`/api/superadmin/analytics/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${Date.now()}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout title="Analitik">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analitik</h1>
            <p className="text-gray-500 mt-1">Global performans ve restoran analizi</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3 items-center">
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

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">Tüm Cihazlar</option>
                <option value="MOBILE">Mobil</option>
                <option value="DESKTOP">Masaüstü</option>
                <option value="TABLET">Tablet</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">Tüm Kaynaklar</option>
                <option value="QR">QR</option>
                <option value="DIRECT">Direkt</option>
                <option value="SOCIAL">Sosyal Medya</option>
              </select>
            </div>

            <div className="ml-auto">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                CSV Export
              </button>
            </div>
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
                  {kpi.change !== 0 && (
                    <div className={`flex items-center gap-1 mt-2 ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="text-sm font-semibold">{Math.abs(kpi.change).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <kpi.icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time Series Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziyaret Trendi</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Grafik: {timeSeries.length} veri noktası</p>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cihaz Dağılımı</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Mobil</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(deviceBreakdown.mobile)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Masaüstü</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(deviceBreakdown.desktop)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Tablet</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(deviceBreakdown.tablet)}</p>
            </div>
          </div>
        </div>

        {/* Restaurants Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Restoran Performansı</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Restoran</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ziyaret</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">QR Scan</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tekil</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ürün Gör.</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Son Aktivite</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant.restaurantId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{restaurant.restaurantName}</p>
                        <p className="text-sm text-gray-500">/{restaurant.restaurantSlug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatNumber(restaurant.totalVisits)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatNumber(restaurant.qrScans)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatNumber(restaurant.uniqueVisitors)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatNumber(restaurant.productViews)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatNumber(restaurant.contactClicks)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(restaurant.lastActivity)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {restaurant.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/analytics/restaurant/${restaurant.restaurantId}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Detay
                        </Link>
                        <a
                          href={`/m/${restaurant.restaurantSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Toplam {total} restoran
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
