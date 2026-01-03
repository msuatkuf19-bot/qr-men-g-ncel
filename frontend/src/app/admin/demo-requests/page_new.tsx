'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { MessageCircle, X, Trash2, Edit3, Calendar, User, Phone, Mail, Store, Table2, TrendingUp } from 'lucide-react';
import { normalizeTRPhoneToWaDigits, buildDemoWhatsAppMessage } from '@/utils/phone';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const statusConfig = {
  PENDING: { label: 'Bekleniyor', color: 'amber', icon: '⏳' },
  CONTACTED: { label: 'Olumlu', color: 'blue', icon: '✅' },
  DEMO_CREATED: { label: 'Demo Oluşturuldu', color: 'emerald', icon: '🎉' },
  CANCELLED: { label: 'Olumsuz', color: 'rose', icon: '❌' },
};

const potentialConfig = {
  HIGH_PROBABILITY: { label: 'Yüksek İhtimal', color: 'green', icon: '🎯' },
  NEGATIVE: { label: 'Olumsuz', color: 'red', icon: '🚫' },
  LONG_TERM: { label: 'Uzun Vade', color: 'purple', icon: '📅' },
};

// WhatsApp ile iletişime geç - MEVCUT FONKSİYON AYNEN KORUNDU
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

// Demo Request Card Component
function DemoRequestCard({ request, onEdit, onDelete, onWhatsApp }: {
  request: DemoRequest;
  onEdit: () => void;
  onDelete: () => void;
  onWhatsApp: () => void;
}) {
  const statusCfg = statusConfig[request.status];
  const potentialCfg = request.potential ? potentialConfig[request.potential] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white rounded-2xl border border-slate-200/70 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Status Badge - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-${statusCfg.color}-50 text-${statusCfg.color}-700 ring-1 ring-inset ring-${statusCfg.color}-200/80`}>
          <span>{statusCfg.icon}</span>
          {statusCfg.label}
        </span>
      </div>

      {/* Edit Button - Top Right (on hover) */}
      <button
        onClick={onEdit}
        className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur"
        title="Düzenle"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar/Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
            {request.restaurantName.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 truncate">{request.restaurantName}</h3>
            <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5" />
              {request.fullName}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Store className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 font-medium truncate">{request.restaurantType || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Table2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-700 font-medium">{request.tableCount || 0} masa</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          <button
            onClick={onWhatsApp}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors text-sm font-medium group/wa"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="flex-1 text-left truncate">{request.phone}</span>
            <svg className="w-4 h-4 opacity-0 group-hover/wa:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {request.email && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{request.email}</span>
            </div>
          )}
        </div>

        {/* Potential & Follow-up */}
        {(potentialCfg || request.followUpMonth) && (
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-slate-200">
            {potentialCfg && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-${potentialCfg.color}-50 text-${potentialCfg.color}-700 ring-1 ring-inset ring-${potentialCfg.color}-200/80`}>
                <span>{potentialCfg.icon}</span>
                {potentialCfg.label}
              </span>
            )}
            {request.followUpMonth && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                <Calendar className="w-3 h-3" />
                {new Date(request.followUpMonth + '-01').toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(request.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Edit Panel Component
function EditPanel({ request, onClose, onSave, saving }: {
  request: DemoRequest;
  onClose: () => void;
  onSave: (status: DemoRequestStatus, potential?: DemoRequestPotential | '', followUpMonth?: string) => Promise<void>;
  saving: boolean;
}) {
  const [status, setStatus] = useState<DemoRequestStatus>(request.status);
  const [potential, setPotential] = useState<DemoRequestPotential | ''>(request.potential || '');
  const [followUpMonth, setFollowUpMonth] = useState(request.followUpMonth || '');

  const handleSave = async () => {
    await onSave(status, potential, followUpMonth);
  };

  const isLongTerm = potential === 'LONG_TERM';
  const canSave = !isLongTerm || (isLongTerm && followUpMonth);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{request.restaurantName}</h2>
            <p className="text-sm text-slate-600 mt-0.5">{request.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Telefon</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-900">
                <Phone className="w-4 h-4 text-slate-400" />
                {request.phone}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">E-posta</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-900 truncate">
                <Mail className="w-4 h-4 text-slate-400" />
                {request.email || '—'}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Restoran Tipi</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-900">
                <Store className="w-4 h-4 text-slate-400" />
                {request.restaurantType}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Masa Sayısı</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 text-sm font-medium text-slate-900">
                <Table2 className="w-4 h-4 text-slate-400" />
                {request.tableCount} masa
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Durum Güncelleme</h3>
            
            {/* Status Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">Durum</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as DemoRequestStatus)}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                >
                  <option value="PENDING">⏳ Bekleniyor</option>
                  <option value="CONTACTED">✅ Olumlu</option>
                  <option value="DEMO_CREATED">🎉 Demo Oluşturuldu</option>
                  <option value="CANCELLED">❌ Olumsuz</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">Potansiyel</label>
                <select
                  value={potential}
                  onChange={(e) => setPotential(e.target.value as DemoRequestPotential | '')}
                  disabled={saving}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                >
                  <option value="">Seçiniz</option>
                  <option value="HIGH_PROBABILITY">🎯 Yüksek İhtimal (Kısa Vade)</option>
                  <option value="NEGATIVE">🚫 Olumsuz</option>
                  <option value="LONG_TERM">📅 Uzun Vade</option>
                </select>
              </div>

              {/* Conditional Date Picker */}
              <AnimatePresence>
                {isLongTerm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="block text-xs font-semibold text-slate-600">Takip Tarihi *</label>
                    <input
                      type="month"
                      value={followUpMonth}
                      onChange={(e) => setFollowUpMonth(e.target.value)}
                      disabled={saving}
                      required={isLongTerm}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                    />
                    {isLongTerm && !followUpMonth && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <span>⚠️</span>
                        Uzun vade seçildiğinde takip tarihi zorunludur
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </motion.div>
                Kaydediliyor...
              </span>
            ) : 'Kaydet'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminDemoRequests() {
  const [items, setItems] = useState<DemoRequest[]>([]);
  const [filteredItems, setFilteredItems] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DemoRequestStatus | ''>('');
  const [potentialFilter, setPotentialFilter] = useState<DemoRequestPotential | ''>('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getDemoRequests();
      setItems((res.data || []) as DemoRequest[]);
    } catch (e) {
      console.error('Demo talepleri yüklenemedi:', e);
      toast.error('Demo talepleri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = [...items];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.fullName.toLowerCase().includes(query) ||
          item.restaurantName.toLowerCase().includes(query) ||
          item.phone.includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Potential filter
    if (potentialFilter) {
      filtered = filtered.filter((item) => item.potential === potentialFilter);
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, statusFilter, potentialFilter]);

  const handleSave = async (status: DemoRequestStatus, potential?: DemoRequestPotential | '', followUpMonth?: string) => {
    if (!selectedRequest) return;

    try {
      setSaving(true);
      const updateData: any = { status };
      if (potential !== undefined && potential !== '') updateData.potential = potential;
      if (followUpMonth) updateData.followUpMonth = followUpMonth;

      await apiClient.updateDemoRequestStatus(selectedRequest.id, updateData);
      setItems((prev) => prev.map((x) => (x.id === selectedRequest.id ? { ...x, ...updateData } : x)));
      setSelectedRequest(null);
      toast.success('✅ Durum güncellendi');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await apiClient.deleteDemoRequest(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setDeleteConfirm(null);
      toast.success('✅ Demo talebi silindi');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Silme başarısız');
    } finally {
      setDeleting(false);
    }
  };

  const pendingCount = items.filter((r) => r.status === 'PENDING').length;

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
      <DashboardLayout>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Demo Talepleri</h1>
              <p className="text-slate-600">Landing/Demo formundan gelen ücretsiz demo talepleri.</p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : 'Yenile'}
            </button>
          </div>

          {/* Pending Alert */}
          {pendingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⏳</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900">
                  {pendingCount} adet bekleyen demo talebi var
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  Müşterilerle WhatsApp üzerinden iletişime geçebilirsiniz
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Restoran adı, kişi adı, telefon..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DemoRequestStatus | '')}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">⏳ Bekleniyor</option>
            <option value="CONTACTED">✅ Olumlu</option>
            <option value="DEMO_CREATED">🎉 Demo Oluşturuldu</option>
            <option value="CANCELLED">❌ Olumsuz</option>
          </select>

          <select
            value={potentialFilter}
            onChange={(e) => setPotentialFilter(e.target.value as DemoRequestPotential | '')}
            className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="">Tüm Potansiyeller</option>
            <option value="HIGH_PROBABILITY">🎯 Kısa Vade</option>
            <option value="NEGATIVE">🚫 Olumsuz</option>
            <option value="LONG_TERM">📅 Uzun Vade</option>
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
              <p className="text-slate-600 font-medium">Yükleniyor...</p>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-3xl">📭</span>
            </div>
            <p className="text-lg font-semibold text-slate-900 mb-1">
              {searchQuery || statusFilter || potentialFilter ? 'Sonuç bulunamadı' : 'Henüz demo talebi yok'}
            </p>
            <p className="text-slate-600">
              {searchQuery || statusFilter || potentialFilter ? 'Filtrelerinizi değiştirip tekrar deneyin' : 'Yeni demo talepleri buradan görüntülenecek'}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filteredItems.map((request) => (
                <DemoRequestCard
                  key={request.id}
                  request={request}
                  onEdit={() => setSelectedRequest(request)}
                  onDelete={() => setDeleteConfirm(request.id)}
                  onWhatsApp={() => openWhatsApp(request.phone, request.fullName, request.restaurantName)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Edit Panel Modal */}
        <AnimatePresence>
          {selectedRequest && (
            <EditPanel
              request={selectedRequest}
              onClose={() => setSelectedRequest(null)}
              onSave={handleSave}
              saving={saving}
            />
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Demo Talebini Sil?</h3>
                  <p className="text-slate-600 mb-6">
                    Bu işlem geri alınamaz. Demo talebi kalıcı olarak silinecek.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      disabled={deleting}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all disabled:opacity-50"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      disabled={deleting}
                      className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all disabled:opacity-50"
                    >
                      {deleting ? 'Siliniyor...' : 'Sil'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
