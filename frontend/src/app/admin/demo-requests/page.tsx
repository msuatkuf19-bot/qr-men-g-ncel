'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { ClipboardList, MessageCircle, X } from 'lucide-react';
import { normalizeTRPhoneToWaDigits, buildDemoWhatsAppMessage } from '@/utils/phone';
import toast from 'react-hot-toast';

type DemoRequestStatus = 'PENDING' | 'CONTACTED' | 'DEMO_CREATED' | 'CANCELLED';

interface DemoRequest {
  id: string;
  fullName: string;
  restaurantName: string;
  phone: string;
  email?: string | null;
  restaurantType: string;
  tableCount: number;
  status: DemoRequestStatus;
  createdAt: string;
}

const statusLabel: Record<DemoRequestStatus, string> = {
  PENDING: 'Beklemede',
  CONTACTED: 'İletişime Geçildi',
  DEMO_CREATED: 'Demo Oluşturuldu',
  CANCELLED: 'İptal',
};

const statusBadge: Record<DemoRequestStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/80',
  CONTACTED: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200/80',
  DEMO_CREATED: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/80',
  CANCELLED: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/80',
};

// WhatsApp ile iletişime geç - hazır mesaj ile
const openWhatsApp = (phone: string, fullName: string, restaurantName: string) => {
  const digits = normalizeTRPhoneToWaDigits(phone);
  if (!digits) {
    toast.error('Geçersiz telefon numarası', { duration: 2000 });
    return;
  }
  const message = buildDemoWhatsAppMessage(fullName, restaurantName);
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

export default function AdminDemoRequests() {
  const [items, setItems] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<DemoRequest | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getDemoRequests();
      setItems((res.data || []) as DemoRequest[]);
    } catch (e) {
      console.error('Demo talepleri yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChangeStatus = async (id: string, status: DemoRequestStatus) => {
    try {
      setUpdatingId(id);
      await apiClient.updateDemoRequestStatus(id, status);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
      setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Durum güncellenemedi');
    } finally {
      setUpdatingId(null);
    }
  };

  const emptyState = useMemo(() => !loading && items.length === 0, [loading, items.length]);

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200/70">
                  <ClipboardList className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    Demo Talepleri
                  </h1>
                  <p className="mt-1 text-[13px] sm:text-[14px] text-slate-500">
                    Landing/Demo formundan gelen ücretsiz demo talepleri.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={load}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition-colors text-sm font-semibold"
            >
              Yenile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : emptyState ? (
            <div className="text-center py-12">
              <p className="text-slate-600 text-base sm:text-lg">Henüz demo talebi yok</p>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="block lg:hidden divide-y divide-slate-200/70">
                {items.map((r) => {
                  return (
                    <div key={r.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-slate-900 truncate">{r.fullName}</div>
                          <div className="mt-0.5 text-[12px] text-slate-500 truncate">{r.restaurantName}</div>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusBadge[r.status]}`}>
                          {statusLabel[r.status]}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openWhatsApp(r.phone, r.fullName, r.restaurantName)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <MessageCircle className="h-4 w-4 text-emerald-600" strokeWidth={2} aria-hidden="true" />
                          {r.phone}
                        </button>
                        <span className="text-[12px] text-slate-500">
                          {r.restaurantType || '—'} • {r.tableCount || 0} masa
                        </span>
                        <span className="text-[12px] text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => setSelected(r)}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors text-sm font-semibold"
                        >
                          Detay
                        </button>
                        <select
                          value={r.status}
                          disabled={updatingId === r.id}
                          onChange={(e) => onChangeStatus(r.id, e.target.value as DemoRequestStatus)}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
                        >
                          <option value="PENDING">Beklemede</option>
                          <option value="CONTACTED">İletişime Geçildi</option>
                          <option value="DEMO_CREATED">Demo Oluşturuldu</option>
                          <option value="CANCELLED">İptal</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200/70">
                    <tr>
                      <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Ad Soyad</th>
                      <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Restoran</th>
                      <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Telefon</th>
                      <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Tip</th>
                      <th className="text-center py-3.5 px-6 text-[12px] font-semibold text-slate-600">Masa</th>
                      <th className="text-left py-3.5 px-6 text-[12px] font-semibold text-slate-600">Tarih</th>
                      <th className="text-center py-3.5 px-6 text-[12px] font-semibold text-slate-600">Durum</th>
                      <th className="text-right py-3.5 px-6 text-[12px] font-semibold text-slate-600">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => {
                      return (
                        <tr key={r.id} className="border-b border-slate-200/60 hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6">
                            <div className="text-[14px] font-semibold text-slate-900">{r.fullName}</div>
                            <div className="mt-0.5 text-[12px] text-slate-500">{r.email || '—'}</div>
                          </td>
                          <td className="py-4 px-6 text-[13px] text-slate-700">{r.restaurantName}</td>
                          <td className="py-4 px-6">
                            <button
                              type="button"
                              onClick={() => openWhatsApp(r.phone, r.fullName, r.restaurantName)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <MessageCircle className="h-4 w-4 text-emerald-600" strokeWidth={2} aria-hidden="true" />
                              {r.phone}
                            </button>
                          </td>
                          <td className="py-4 px-6 text-[13px] text-slate-700">{r.restaurantType || '—'}</td>
                          <td className="py-4 px-6 text-center text-[13px] text-slate-700">{r.tableCount || 0}</td>
                          <td className="py-4 px-6 text-[13px] text-slate-500">{new Date(r.createdAt).toLocaleString('tr-TR')}</td>
                          <td className="py-4 px-6 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusBadge[r.status]}`}>
                              {statusLabel[r.status]}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end items-center gap-2">
                              <select
                                value={r.status}
                                disabled={updatingId === r.id}
                                onChange={(e) => onChangeStatus(r.id, e.target.value as DemoRequestStatus)}
                                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
                              >
                                <option value="PENDING">Beklemede</option>
                                <option value="CONTACTED">İletişime Geçildi</option>
                                <option value="DEMO_CREATED">Demo Oluşturuldu</option>
                                <option value="CANCELLED">İptal</option>
                              </select>
                              <button
                                onClick={() => setSelected(r)}
                                className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold"
                              >
                                Detay
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Detail modal (recommended) */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setSelected(null)} />
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-soft-lg border border-slate-200/70 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-slate-900 truncate">{selected.fullName}</div>
                  <div className="mt-0.5 text-[12px] text-slate-500 truncate">{selected.restaurantName}</div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                  aria-label="Kapat"
                >
                  <X className="h-4 w-4 text-slate-700" strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-[12px] font-semibold text-slate-500">Telefon</div>
                  <div className="mt-1 text-[14px] font-semibold text-slate-900">{selected.phone}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-[12px] font-semibold text-slate-500">E-posta</div>
                  <div className="mt-1 text-[14px] font-semibold text-slate-900">{selected.email || '—'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-[12px] font-semibold text-slate-500">Restoran Tipi</div>
                  <div className="mt-1 text-[14px] font-semibold text-slate-900">{selected.restaurantType || '—'}</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-[12px] font-semibold text-slate-500">Masa Sayısı</div>
                  <div className="mt-1 text-[14px] font-semibold text-slate-900">{selected.tableCount || 0}</div>
                </div>
                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div>
                      <div className="text-[12px] font-semibold text-slate-500">Talep Tarihi</div>
                      <div className="mt-1 text-[14px] font-semibold text-slate-900">{new Date(selected.createdAt).toLocaleString('tr-TR')}</div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusBadge[selected.status]}`}>
                      {statusLabel[selected.status]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-slate-200/70 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => openWhatsApp(selected.phone, selected.fullName, selected.restaurantName)}
                  className="h-11 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                  WhatsApp'tan yaz
                </button>

                <div className="flex gap-2">
                  <select
                    value={selected.status}
                    disabled={updatingId === selected.id}
                    onChange={(e) => onChangeStatus(selected.id, e.target.value as DemoRequestStatus)}
                    className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
                  >
                    <option value="PENDING">Beklemede</option>
                    <option value="CONTACTED">İletişime Geçildi</option>
                    <option value="DEMO_CREATED">Demo Oluşturuldu</option>
                    <option value="CANCELLED">İptal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
