'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { ClipboardList, MessageCircle, X, Trash2 } from 'lucide-react';
import { normalizeTRPhoneToWaDigits, buildDemoWhatsAppMessage } from '@/utils/phone';
import toast from 'react-hot-toast';

type DemoRequestStatus = 'PENDING' | 'CONTACTED' | 'DEMO_CREATED' | 'CANCELLED';
type DemoRequestPotential = 'HIGH_PROBABILITY' | 'NEGATIVE' | 'LONG_TERM';

interface DemoRequest {
  id: string;
  fullName: string;
  restaurantName: string;
  phone: string;
  email?: string | null;
  restaurantType: string;
  tableCount: number;
  status: DemoRequestStatus;
  potential?: DemoRequestPotential | null;
  followUpMonth?: string | null;
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

const potentialLabel: Record<DemoRequestPotential, string> = {
  HIGH_PROBABILITY: 'Yüksek İhtimal',
  NEGATIVE: 'Olumsuz',
  LONG_TERM: 'Uzun Vade',
};

const potentialBadge: Record<DemoRequestPotential, string> = {
  HIGH_PROBABILITY: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200/80',
  NEGATIVE: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/80', 
  LONG_TERM: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200/80',
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selected, setSelected] = useState<DemoRequest | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [tempPotential, setTempPotential] = useState<DemoRequestPotential | ''>('');
  const [tempFollowUpMonth, setTempFollowUpMonth] = useState('');

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

  const onChangeStatus = async (id: string, status: DemoRequestStatus, potential?: DemoRequestPotential, followUpMonth?: string) => {
    try {
      setUpdatingId(id);
      const updateData: any = { status };
      if (potential !== undefined) updateData.potential = potential;
      if (followUpMonth !== undefined) updateData.followUpMonth = followUpMonth;

      await apiClient.updateDemoRequestStatus(id, updateData);
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...updateData } : x)));
      setSelected((prev) => (prev?.id === id ? { ...prev, ...updateData } : prev));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Güncelleme başarısız');
    } finally {
      setUpdatingId(null);
    }
  };

  // Backward compatible wrapper for status-only changes
  const onChangeStatusOnly = (id: string, status: DemoRequestStatus) => {
    return onChangeStatus(id, status);
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await apiClient.deleteDemoRequest(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
      setDeleteConfirm(null);
      toast.success('Demo talebi silindi');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Silme başarısız');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (item: DemoRequest) => {
    setTempPotential(item.potential || '');
    setTempFollowUpMonth(item.followUpMonth || '');
    setEditMode(true);
  };

  const openModal = (item: DemoRequest) => {
    setSelected(item);
    setTempPotential(item.potential || '');
    setTempFollowUpMonth(item.followUpMonth || '');
    setEditMode(true);
  };

  const saveEdit = async () => {
    if (!selected) return;
    
    const potentialValue = tempPotential || undefined;
    const monthValue = tempFollowUpMonth || undefined;

    await onChangeStatus(selected.id, selected.status, potentialValue as DemoRequestPotential, monthValue);
    setEditMode(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setTempPotential('');
    setTempFollowUpMonth('');
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
                        {r.potential && (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${potentialBadge[r.potential]}`}>
                            {potentialLabel[r.potential]}
                          </span>
                        )}
                        {r.followUpMonth && (
                          <span className="text-[12px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            📅 {r.followUpMonth}
                          </span>
                        )}
                        <span className="text-[12px] text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => openModal(r)}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors text-sm font-semibold"
                        >
                          Detay
                        </button>
                        <select
                          value={r.status}
                          disabled={updatingId === r.id}
                          onChange={(e) => onChangeStatusOnly(r.id, e.target.value as DemoRequestStatus)}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
                        >
                          <option value="PENDING">Beklemede</option>
                          <option value="CONTACTED">İletişime Geçildi</option>
                          <option value="DEMO_CREATED">Demo Oluşturuldu</option>
                          <option value="CANCELLED">İptal</option>
                        </select>
                        <button
                          onClick={() => setDeleteConfirm(r.id)}
                          disabled={deletingId === r.id}
                          className="h-10 w-10 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200/70">
                    <tr>
                      <th className="text-left py-2 px-2 text-[10px] font-semibold text-slate-600 w-[120px]">Kişi</th>
                      <th className="text-left py-2 px-2 text-[10px] font-semibold text-slate-600 w-[100px]">Restoran</th>
                      <th className="text-left py-2 px-2 text-[10px] font-semibold text-slate-600 w-[80px]">Tel</th>
                      <th className="text-left py-2 px-2 text-[10px] font-semibold text-slate-600 w-[70px]">Tip/Masa</th>
                      <th className="text-center py-2 px-1 text-[10px] font-semibold text-slate-600 w-[80px]">Potansiyel</th>
                      <th className="text-center py-2 px-1 text-[10px] font-semibold text-slate-600 w-[60px]">Takip</th>
                      <th className="text-center py-2 px-1 text-[10px] font-semibold text-slate-600 w-[70px]">Tarih</th>
                      <th className="text-center py-2 px-1 text-[10px] font-semibold text-slate-600 w-[70px]">Durum</th>
                      <th className="text-right py-2 px-2 text-[10px] font-semibold text-slate-600 w-[120px]">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((r) => {
                      return (
                        <tr key={r.id} className="border-b border-slate-200/60 hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-2">
                            <div className="text-[11px] font-semibold text-slate-900 truncate">{r.fullName}</div>
                            <div className="text-[9px] text-slate-500 truncate">{r.email || '—'}</div>
                          </td>
                          <td className="py-2 px-2 text-[10px] text-slate-700 truncate">{r.restaurantName}</td>
                          <td className="py-2 px-2">
                            <button
                              type="button"
                              onClick={() => openWhatsApp(r.phone, r.fullName, r.restaurantName)}
                              className="text-[9px] font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                              title={r.phone}
                            >
                              {r.phone.slice(-7)}
                            </button>
                          </td>
                          <td className="py-2 px-2 text-[9px] text-slate-700">
                            <div className="truncate">{r.restaurantType || '—'}</div>
                            <div className="text-[8px] text-slate-500">{r.tableCount || 0} masa</div>
                          </td>
                          <td className="py-2 px-1 text-center">
                            {r.potential ? (
                              <span className={`inline-block rounded px-1 py-0.5 text-[8px] font-bold ${r.potential === 'HIGH_PROBABILITY' ? 'bg-green-100 text-green-800' : r.potential === 'NEGATIVE' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'}`}>
                                {r.potential === 'HIGH_PROBABILITY' ? 'YÜKSEK' : r.potential === 'NEGATIVE' ? 'OLMSZ' : 'UZUN'}
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2 px-1 text-center text-[9px] text-slate-700">
                            {r.followUpMonth ? r.followUpMonth.split('-')[1] + '/' + r.followUpMonth.split('-')[0].slice(-2) : '—'}
                          </td>
                          <td className="py-2 px-1 text-center text-[9px] text-slate-500">
                            {new Date(r.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                          </td>
                          <td className="py-2 px-1 text-center">
                            <span className={`inline-block rounded px-1 py-0.5 text-[8px] font-bold ${
                              r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                              r.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                              r.status === 'DEMO_CREATED' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {r.status === 'PENDING' ? 'BEKLEME' : 
                               r.status === 'CONTACTED' ? 'İLETİŞİM' :
                               r.status === 'DEMO_CREATED' ? 'DEMO' : 'İPTAL'}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex justify-end items-center gap-1">
                              <button
                                onClick={() => openModal(r)}
                                className="h-6 px-2 rounded text-blue-600 hover:bg-blue-50 text-[9px] font-semibold border border-blue-200"
                                title="Düzenle"
                              >
                                Düzen
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(r.id)}
                                disabled={deletingId === r.id}
                                className="h-6 w-6 rounded text-red-600 hover:bg-red-50 disabled:opacity-50 border border-red-200"
                                title="Sil"
                              >
                                <Trash2 className="h-3 w-3" strokeWidth={2} />
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
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => { setSelected(null); setEditMode(false); }} />
            <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-soft-lg border border-slate-200/70 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70">
                <div className="min-w-0">
                  <div className="text-[14px] font-semibold text-slate-900 truncate">{selected.fullName}</div>
                  <div className="mt-0.5 text-[12px] text-slate-500 truncate">{selected.restaurantName}</div>
                </div>
                <button
                  onClick={() => { setSelected(null); setEditMode(false); }}
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
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-[12px] font-semibold text-slate-500">Potansiyel</div>
                  <div className="mt-1">
                    {selected.potential ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${potentialBadge[selected.potential]}`}>
                        {potentialLabel[selected.potential]}
                      </span>
                    ) : (
                      <span className="text-[14px] text-slate-400">Belirsiz</span>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="text-[12px] font-semibold text-slate-500">Takip Ayı</div>
                  <div className="mt-1 text-[14px] font-semibold text-slate-900">{selected.followUpMonth || '—'}</div>
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

              <div className="px-5 py-4 border-t border-slate-200/70">
                <div className="flex flex-col gap-4">
                  {/* WhatsApp Button */}
                  <button
                    type="button"
                    onClick={() => openWhatsApp(selected.phone, selected.fullName, selected.restaurantName)}
                    className="h-11 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                    WhatsApp'tan yaz
                  </button>

                  {/* Edit Controls */}
                  {!editMode ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selected.status}
                        disabled={updatingId === selected.id}
                        onChange={(e) => onChangeStatusOnly(selected.id, e.target.value as DemoRequestStatus)}
                        className="h-11 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold flex-1"
                      >
                        <option value="PENDING">Beklemede</option>
                        <option value="CONTACTED">İletişime Geçildi</option>
                        <option value="DEMO_CREATED">Demo Oluşturuldu</option>
                        <option value="CANCELLED">İptal</option>
                      </select>
                      <button
                        onClick={() => startEdit(selected)}
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(selected.id)}
                        disabled={deletingId === selected.id}
                        className="h-11 px-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-sm font-semibold disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[12px] font-semibold text-slate-500 mb-1">Potansiyel</label>
                          <select
                            value={tempPotential}
                            onChange={(e) => setTempPotential(e.target.value as DemoRequestPotential | '')}
                            className="h-11 w-full px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
                          >
                            <option value="">Seçiniz</option>
                            <option value="HIGH_PROBABILITY">Yüksek İhtimal</option>
                            <option value="NEGATIVE">Olumsuz</option>
                            <option value="LONG_TERM">Uzun Vade</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-semibold text-slate-500 mb-1">Takip Ayı</label>
                          <input
                            type="month"
                            value={tempFollowUpMonth}
                            onChange={(e) => setTempFollowUpMonth(e.target.value)}
                            className="h-11 w-full px-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={updatingId === selected.id}
                          className="h-11 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold disabled:opacity-50 flex-1 sm:flex-none"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex-1 sm:flex-none"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={() => setDeleteConfirm(null)} />
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-soft-lg border border-slate-200/70 p-6">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-6 w-6 text-red-600" strokeWidth={2} />
                </div>
                <div className="mt-3">
                  <h3 className="text-lg font-semibold text-slate-900">Demo Talebini Sil</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Bu demo talebi kalıcı olarak silinecek. Bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold"
                >
                  İptal
                </button>
                <button
                  onClick={() => onDelete(deleteConfirm)}
                  disabled={deletingId === deleteConfirm}
                  className="flex-1 h-11 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-semibold disabled:opacity-50"
                >
                  {deletingId === deleteConfirm ? 'Siliniyor...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
