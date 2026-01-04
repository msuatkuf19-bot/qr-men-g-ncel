'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Filter, 
  Download,
  TrendingUp,
  Award,
  Clock,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

interface Membership {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string;
  ownerName: string;
  ownerEmail: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string | null;
  lastActivity: string | null;
}

interface Stats {
  totalActive: number;
  startedToday: number;
  expiringIn7Days: number;
  mostUsedPlan: string;
}

export default function ActiveMembershipsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [stats, setStats] = useState<Stats>({ totalActive: 0, startedToday: 0, expiringIn7Days: 0, mostUsedPlan: 'N/A' });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ plan: '', search: '', dateFrom: '', dateTo: '' });
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized');
      return;
    }
    fetchData();
  }, [user, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as any)
      });

      const [membershipsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/memberships/active?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/admin/memberships/stats/active`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const membershipsData = await membershipsRes.json();
      const statsData = await statsRes.json();

      if (membershipsData.success) {
        setMemberships(membershipsData.data.memberships);
        setTotal(membershipsData.data.total);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/memberships/${id}/deactivate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: 'MANUAL' })
      });

      if (res.ok) {
        alert('Üyelik pasife alındı');
        fetchData();
      }
    } catch (error) {
      console.error('Error deactivating membership:', error);
      alert('Hata oluştu');
    } finally {
      setShowConfirm(null);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: 'ACTIVE',
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as any)
      });

      const response = await fetch(`/api/admin/memberships/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `active-memberships-${Date.now()}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleFilterApply = () => {
    setPage(1);
    fetchData();
  };

  const handleFilterReset = () => {
    setFilters({ plan: '', search: '', dateFrom: '', dateTo: '' });
    setPage(1);
    setTimeout(fetchData, 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const getPlanBadgeColor = (plan: string) => {
    const colors: any = {
      DEMO: 'bg-gray-100 text-gray-800',
      BASIC: 'bg-blue-100 text-blue-800',
      PRO: 'bg-purple-100 text-purple-800',
      ENTERPRISE: 'bg-orange-100 text-orange-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout title="Aktif Üyelikler">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Aktif Üyelikler</h1>
            <p className="text-gray-500 mt-1">Sistemdeki aktif üyelik yönetimi</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Restoran ara..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tüm Planlar</option>
              <option value="DEMO">Demo</option>
              <option value="BASIC">Basic</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
            <button
              onClick={handleFilterApply}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Filtrele
            </button>
            <button
              onClick={handleFilterReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Sıfırla
            </button>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              CSV Export
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Toplam Aktif</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.totalActive)}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Bugün Başlayan</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.startedToday)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Yaklaşan Yenilemeler</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.expiringIn7Days)}</p>
                <p className="text-xs text-gray-400 mt-1">7 gün içinde</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">En Çok Kullanılan</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.mostUsedPlan}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Aktif Üyelikler Listesi</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Restoran</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Yetkili</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Başlangıç</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bitiş</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Son Aktivite</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Durum</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {memberships.map((membership) => (
                  <tr key={membership.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{membership.restaurantName}</p>
                        <p className="text-sm text-gray-500">/{membership.restaurantSlug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{membership.ownerName}</p>
                        <p className="text-sm text-gray-500">{membership.ownerEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeColor(membership.plan)}`}>
                        {membership.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(membership.startDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(membership.endDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(membership.lastActivity)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        Aktif
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/restaurants/${membership.restaurantId}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Yönet
                        </Link>
                        <a
                          href={`/m/${membership.restaurantSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setShowConfirm(membership.id)}
                          className="text-red-600 hover:text-red-700 font-medium text-sm"
                        >
                          Pasife Al
                        </button>
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
                Toplam {formatNumber(total)} üyelik
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

        {/* Confirm Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Üyeliği Pasife Al</h3>
              <p className="text-gray-600 mb-6">Bu üyeliği pasife almak istediğinizden emin misiniz?</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeactivate(showConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Pasife Al
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
