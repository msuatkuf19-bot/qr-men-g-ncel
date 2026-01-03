'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { MessageCircle, ChevronDown, ChevronUp, Trash2, Calendar, User, Phone, Mail, Store, Table2, Eye } from 'lucide-react';
import { normalizeTRPhoneToWaDigits, buildDemoWhatsAppMessage } from '@/utils/phone';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type DemoRequestStatus = 'PENDING' | 'DEMO_CREATED' | 'FOLLOW_UP' | 'NEGATIVE';
type DemoRequestPotential = 'HIGH_PROBABILITY' | 'LONG_TERM';

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
  PENDING: { label: 'Beklemede', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏳' },
  DEMO_CREATED: { label: 'Demo Oluşturuldu', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '🎉' },
  FOLLOW_UP: { label: 'Takip', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '✅' },
  NEGATIVE: { label: 'Olumsuz', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '❌' },
};

const potentialConfig = {
  HIGH_PROBABILITY: { label: 'Yüksek İhtimal', color: 'bg-green-50 text-green-700 border-green-200', icon: '🎯' },
  LONG_TERM: { label: 'Uzun Vade', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '📅' },
};

// WhatsApp ile iletişime geç - AYNEN KORUNDU
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

// Tarih formatlama
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
};

// DemoRequestRow Component - Satır ve Detay
function DemoRequestRow({ request, onUpdate, onDelete }: {
  request: DemoRequest;
  onUpdate: (id: string, data: Partial<DemoRequest>) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localStatus, setLocalStatus] = useState(request.status);
  const [localPotential, setLocalPotential] = useState<DemoRequestPotential | null>(request.potential || null);
  const [followUpDate, setFollowUpDate] = useState(request.followUpMonth || '');

  const handleStatusChange = async (newStatus: DemoRequestStatus) => {
    setLocalStatus(newStatus);
    
    // Durum değiştir
    try {
      await apiClient.patch(`/demo-requests/${request.id}/status`, {
        status: newStatus,
        potential: localPotential,
        followUpMonth: followUpDate || null
      });
      onUpdate(request.id, { status: newStatus });
      toast.success('Durum güncellendi', { duration: 2000 });
    } catch (error) {
      toast.error('Durum güncellenemedi', { duration: 2000 });
      setLocalStatus(request.status); // Geri al
    }
  };

  const handlePotentialChange = async (newPotential: DemoRequestPotential | '') => {
    const potentialValue = newPotential === '' ? null : newPotential;
    setLocalPotential(potentialValue);
    
    try {
      await apiClient.patch(`/demo-requests/${request.id}/status`, {
        status: localStatus,
        potential: potentialValue,
        followUpMonth: followUpDate || null
      });
      onUpdate(request.id, { potential: potentialValue });
      toast.success('Potansiyel güncellendi', { duration: 2000 });
    } catch (error) {
      toast.error('Potansiyel güncellenemedi', { duration: 2000 });
      setLocalPotential(request.potential || null);
    }
  };

  const handleFollowUpDateChange = async (newDate: string) => {
    setFollowUpDate(newDate);
    
    try {
      await apiClient.patch(`/demo-requests/${request.id}/status`, {
        status: localStatus,
        potential: localPotential,
        followUpMonth: newDate || null
      });
      onUpdate(request.id, { followUpMonth: newDate });
      toast.success('Takip tarihi güncellendi', { duration: 2000 });
    } catch (error) {
      toast.error('Tarih güncellenemedi', { duration: 2000 });
      setFollowUpDate(request.followUpMonth || '');
    }
  };

  const statusCfg = statusConfig[localStatus];
  const isLongTerm = localPotential === 'LONG_TERM';

  return (
    <>
      {/* Ana Satır */}
      <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-200">
        {/* Restoran Adı */}
        <td className="px-4 py-4">
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{request.restaurantName}</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <User className="w-3 h-3" />
              {request.fullName}
            </span>
          </div>
        </td>

        {/* Restoran Tipi */}
        <td className="px-4 py-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Store className="w-3 h-3" />
            {request.restaurantType}
          </span>
        </td>

        {/* Masa Sayısı */}
        <td className="px-4 py-4">
          <span className="inline-flex items-center gap-1 text-sm text-slate-700">
            <Table2 className="w-4 h-4 text-slate-400" />
            {request.tableCount} masa
          </span>
        </td>

        {/* Telefon / WhatsApp */}
        <td className="px-4 py-4">
          <button
            onClick={() => openWhatsApp(request.phone, request.fullName, request.restaurantName)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </td>

        {/* Durum Dropdown */}
        <td className="px-4 py-4">
          <select
            value={localStatus}
            onChange={(e) => handleStatusChange(e.target.value as DemoRequestStatus)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${statusCfg.color}`}
          >
            <option value="PENDING">{statusConfig.PENDING.icon} {statusConfig.PENDING.label}</option>
            <option value="DEMO_CREATED">{statusConfig.DEMO_CREATED.icon} {statusConfig.DEMO_CREATED.label}</option>
            <option value="FOLLOW_UP">{statusConfig.FOLLOW_UP.icon} {statusConfig.FOLLOW_UP.label}</option>
            <option value="NEGATIVE">{statusConfig.NEGATIVE.icon} {statusConfig.NEGATIVE.label}</option>
          </select>
        </td>

        {/* Oluşturulma Tarihi */}
        <td className="px-4 py-4 text-sm text-slate-500">
          {formatDate(request.createdAt)}
        </td>

        {/* Detay Butonu */}
        <td className="px-4 py-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Detay
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </td>
      </tr>

      {/* Detay Satırı (Expand) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={7} className="px-0 py-0 bg-slate-50/50">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200">
                  {/* Sol Kolon - Müşteri & Restoran Bilgileri */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-orange-500" />
                      Müşteri & Restoran Bilgileri
                    </h4>
                    
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-3">
                        <Store className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Restoran Adı</span>
                          <span className="text-sm font-semibold text-slate-900">{request.restaurantName}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Yetkili Ad Soyad</span>
                          <span className="text-sm font-semibold text-slate-900">{request.fullName}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Telefon</span>
                          <button
                            onClick={() => openWhatsApp(request.phone, request.fullName, request.restaurantName)}
                            className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline"
                          >
                            {request.phone}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">E-posta</span>
                          <span className="text-sm text-slate-700">{request.email || '—'}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Store className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Restoran Tipi</span>
                          <span className="text-sm text-slate-700">{request.restaurantType}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Table2 className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Masa Sayısı</span>
                          <span className="text-sm text-slate-700">{request.tableCount} masa</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Kolon - Üyelik & Süreç Bilgileri */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Üyelik & Süreç Bilgileri
                    </h4>
                    
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Üyelik Başlangıç Tarihi</span>
                          <span className="text-sm text-slate-700">—</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Üyelik Bitiş Tarihi</span>
                          <span className="text-sm text-slate-700">—</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 text-slate-400 mt-0.5">{statusCfg.icon}</div>
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block">Demo Durumu</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border mt-1 ${statusCfg.color}`}>
                            {statusCfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Potansiyel Seçimi */}
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 text-slate-400 mt-0.5">🎯</div>
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block mb-2">Potansiyel</span>
                          <select
                            value={localPotential || ''}
                            onChange={(e) => handlePotentialChange(e.target.value as DemoRequestPotential | '')}
                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            <option value="">Seçiniz</option>
                            <option value="HIGH_PROBABILITY">🎯 Yüksek İhtimal</option>
                            <option value="LONG_TERM">📅 Uzun Vade</option>
                          </select>
                        </div>
                      </div>

                      {/* Uzun Vade Tarih Seçici */}
                      <AnimatePresence>
                        {isLongTerm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-start gap-3"
                          >
                            <Calendar className="w-4 h-4 text-purple-500 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-xs text-slate-500 block mb-2">Hedef Tarih (Ay/Yıl)</span>
                              <input
                                type="month"
                                value={followUpDate}
                                onChange={(e) => handleFollowUpDateChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-sm border border-purple-200 bg-purple-50/30 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Sil Butonu */}
                    <button
                      onClick={() => {
                        if (confirm('Bu demo talebini silmek istediğinizden emin misiniz?')) {
                          onDelete(request.id);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Talebi Sil
                    </button>
                  </div>
                </div>
              </motion.div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// Ana Component - DemoRequestsTable
function DemoRequestsTable() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DemoRequestStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<DemoRequest[]>('/demo-requests');
      setRequests(data);
    } catch (error) {
      toast.error('Demo talepleri yüklenemedi', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: string, data: Partial<DemoRequest>) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, ...data } : req));
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/demo-requests/${id}`);
      setRequests(prev => prev.filter(req => req.id !== id));
      toast.success('Demo talebi silindi', { duration: 2000 });
    } catch (error) {
      toast.error('Silme işlemi başarısız', { duration: 2000 });
    }
  };

  // Filtreleme
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Demo Talepleri</h1>
            <p className="text-slate-600">Gelen demo taleplerini görüntüleyin ve yönetin</p>
          </div>

          {/* Bekleyen Uyarısı */}
          {pendingCount > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-semibold text-amber-900">
                  {pendingCount} bekleyen talep var
                </p>
                <p className="text-sm text-amber-700">Lütfen en kısa sürede değerlendirin</p>
              </div>
            </div>
          )}

          {/* Filtreler */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Restoran, kişi adı veya telefon ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DemoRequestStatus | 'ALL')}
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PENDING">⏳ Beklemede</option>
              <option value="DEMO_CREATED">🎉 Demo Oluşturuldu</option>
              <option value="FOLLOW_UP">✅ Takip</option>
              <option value="NEGATIVE">❌ Olumsuz</option>
            </select>
          </div>

          {/* Tablo */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="mt-4 text-slate-600">Yükleniyor...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-600">Henüz demo talebi yok</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Restoran Adı
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Restoran Tipi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Masa Sayısı
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        İletişim
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        İşlem
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(request => (
                      <DemoRequestRow
                        key={request.id}
                        request={request}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default DemoRequestsTable;
