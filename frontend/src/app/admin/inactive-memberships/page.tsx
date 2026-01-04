'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Download,
  TrendingDown,
  RotateCcw,
  Clock,
  ExternalLink,
  AlertCircle,
  XCircle
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
  passiveDate: string | null;
  passiveReason: string | null;
}

interface Stats {
  totalPassive: number;
  last30Days: number;
  reactivatable: number;
  fromDemo: number;
}

export default function InactiveMembershipsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPassive: 0, last30Days: 0, reactivatable: 0, fromDemo: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ reason: '', search: '', dateFrom: '', dateTo: '' });
  const [showActivateConfirm, setShowActivateConfirm] = useState<string | null>(null);

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
        fetch(`/api/admin/memberships/passive?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`/api/admin/memberships/stats/passive`, {
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

  const handleActivate = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/memberships/${id}/activate`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: 'BASIC' })
      });

      if (res.ok) {
        alert('Üyelik aktif hale getirildi');
        fetchData();
      }
    } catch (error) {
      console.error('Error activating membership:', error);
      alert('Hata oluştu');
    } finally {
      setShowActivateConfirm(null);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        status: 'PASSIVE',
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
      a.download = `passive-memberships-${Date.now()}.csv`;
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
    setFilters({ reason: '', search: '', dateFrom: '', dateTo: '' });
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

  const getReasonLabel = (reason: string | null) => {
    const labels: any = {
      EXPIRED: 'Süresi Doldu',
      PAYMENT_FAILED: 'Ödeme Hatası',
      CANCELED: 'İptal Edildi',
      DEMO_ENDED: 'Demo Bitti',
      MANUAL: 'Manuel'
    };
    return labels[reason || ''] || reason || '-';
  };

  return (
    <DashboardLayout title="Pasif Üyelikler">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pasif Üyelikler</h1>
            <p className="text-gray-500 mt-1">Sistemdeki pasif üyelik yönetimi</p>
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
              value={filters.reason}
              onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tüm Sebepler</option>
              <option value="EXPIRED">Süresi Doldu</option>
              <option value="PAYMENT_FAILED">Ödeme Hatası</option>
              <option value="CANCELED">İptal Edildi</option>
              <option value="DEMO_ENDED">Demo Bitti</option>
              <option value="MANUAL">Manuel</option>
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
                <p className="text-sm text-gray-500 font-medium">Toplam Pasif</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.totalPassive)}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Son 30 Gün</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.last30Days)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Yeniden Aktiflenebilir</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.reactivatable)}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Demo'dan Gelenler</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.fromDemo)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pasif Üyelikler Listesi</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Restoran</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Yetkili</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Son Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Pasif Tarihi</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Sebep</th>
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
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(membership.passiveDate)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{getReasonLabel(membership.passiveReason)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3" />
                        Pasif
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/restaurants/${membership.restaurantId}`}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          Detay
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
                          onClick={() => setShowActivateConfirm(membership.id)}
                          className="text-green-600 hover:text-green-700 font-medium text-sm"
                        >
                          Aktif Yap
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

        {/* Activate Confirm Modal */}
        {showActivateConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Üyeliği Aktif Yap</h3>
              <p className="text-gray-600 mb-6">Bu üyeliği aktif hale getirmek istediğinizden emin misiniz? Basic planla başlayacaktır.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowActivateConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleActivate(showActivateConfirm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Aktif Yap
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
