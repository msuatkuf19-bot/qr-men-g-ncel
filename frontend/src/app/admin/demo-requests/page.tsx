'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { MessageCircle, ChevronDown, ChevronUp, Trash2, Calendar, User, Phone, Mail, Store, Table2, Eye } from 'lucide-react';
import { normalizeTRPhoneToWaDigits, buildDemoWhatsAppMessage } from '@/utils/phone';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Potansiyel Durum için tek kaynak ENUM
type PotentialStatus = 
  | 'NONE'
  | 'PENDING'
  | 'DEMO_CREATED'
  | 'HIGH_PROBABILITY'
  | 'EVALUATING'
  | 'FOLLOW_UP'
  | 'LONG_TERM'
  | 'NEGATIVE';

interface DemoRequest {
  id: string;
  fullName: string;
  restaurantName: string;
  phone: string;
  email?: string | null;
  restaurantType: string;
  tableCount: number;
  potentialStatus: PotentialStatus;
  followUpMonth?: string | null;
  createdAt: string;
}

// Potansiyel durum konfigürasyonu - tek kaynak
const potentialStatusConfig: Record<PotentialStatus, { label: string; color: string; icon: string }> = {
  NONE: { label: 'Seçiniz', color: 'bg-slate-50 text-slate-500 border-slate-200', icon: '⚪' },
  PENDING: { label: 'Beklemede', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⏳' },
  DEMO_CREATED: { label: 'Demo Oluşturuldu', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🎉' },
  HIGH_PROBABILITY: { label: 'Yüksek İhtimal', color: 'bg-green-50 text-green-700 border-green-200', icon: '🎯' },
  EVALUATING: { label: 'Değerlendiriyor', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: '🤔' },
  FOLLOW_UP: { label: 'Takip', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: '📞' },
  LONG_TERM: { label: 'Uzun Vade', color: 'bg-slate-50 text-slate-600 border-slate-300', icon: '📅' },
  NEGATIVE: { label: 'Olumsuz', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '❌' },
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
  const [localPotentialStatus, setLocalPotentialStatus] = useState<PotentialStatus>(request.potentialStatus || 'NONE');
  const [localFollowUpMonth, setLocalFollowUpMonth] = useState(request.followUpMonth || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await apiClient.updateDemoRequestStatus(request.id, {
        potentialStatus: localPotentialStatus,
        followUpMonth: localFollowUpMonth || null,
      });
      
      onUpdate(request.id, {
        potentialStatus: localPotentialStatus,
        followUpMonth: localFollowUpMonth || null,
      });
      
      toast.success('Durum güncellendi', { duration: 2000 });
      setIsExpanded(false);
    } catch (error) {
      toast.error('Kaydetme başarısız', { duration: 2000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePotentialStatusChange = async (newStatus: PotentialStatus) => {
    setLocalPotentialStatus(newStatus);
    
    try {
      await apiClient.updateDemoRequestStatus(request.id, {
        potentialStatus: newStatus,
        followUpMonth: localFollowUpMonth || null,
      });
      onUpdate(request.id, { potentialStatus: newStatus });
      toast.success('Durum güncellendi', { duration: 2000 });
    } catch (error) {
      toast.error('Durum güncellenemedi', { duration: 2000 });
      setLocalPotentialStatus(request.potentialStatus);
    }
  };

  const handleFollowUpMonthChange = async (newMonth: string) => {
    setLocalFollowUpMonth(newMonth);
    
    try {
      await apiClient.updateDemoRequestStatus(request.id, {
        potentialStatus: localPotentialStatus,
        followUpMonth: newMonth || null,
      });
      onUpdate(request.id, { followUpMonth: newMonth });
      toast.success('Takip ayı güncellendi', { duration: 2000 });
    } catch (error) {
      toast.error('Takip ayı güncellenemedi', { duration: 2000 });
      setLocalFollowUpMonth(request.followUpMonth || '');
    }
  };

  const statusCfg = potentialStatusConfig[localPotentialStatus];

  return (
    <>
      {/* Mobil Kart Görünümü */}
      <div className="lg:hidden border-b border-slate-200 bg-white hover:bg-slate-50/50 transition-colors">
        <div className="p-4 space-y-3">
          {/* Üst Kısım - Restoran ve Durum */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base truncate">{request.restaurantName}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{request.fullName}</span>
              </p>
            </div>
            <select
              value={localPotentialStatus}
              onChange={(e) => handlePotentialStatusChange(e.target.value as PotentialStatus)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 flex-shrink-0 ${statusCfg.color}`}
            >
              {Object.entries(potentialStatusConfig).map(([key, config]) => (
                <option key={key} value={key} className="bg-white text-slate-900">
                  {config.icon} {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bilgiler Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700 truncate">{request.restaurantType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Table2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-700">{request.tableCount} masa</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 text-xs">{formatDate(request.createdAt)}</span>
            </div>
          </div>

          {/* Alt Kısım - Butonlar */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => openWhatsApp(request.phone, request.fullName, request.restaurantName)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 border border-green-200 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Detay
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobil Detay Paneli */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-slate-50/50"
            >
              <div className="p-4 space-y-4 border-t border-slate-200">
                {/* Müşteri Bilgileri */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" />
                    Müşteri Bilgileri
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-500 block">Telefon</span>
                        <button
                          onClick={() => openWhatsApp(request.phone, request.fullName, request.restaurantName)}
                          className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline break-all"
                        >
                          {request.phone}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-slate-500 block">E-posta</span>
                        <span className="text-sm text-slate-700 break-all">{request.email || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Satış Takibi */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Satış Takibi
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-500 block mb-2">Potansiyel Durum</span>
                      <select
                        value={localPotentialStatus}
                        onChange={(e) => handlePotentialStatusChange(e.target.value as PotentialStatus)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer"
                      >
                        {Object.entries(potentialStatusConfig).map(([key, config]) => (
                          <option key={key} value={key} className="text-slate-900">
                            {config.icon} {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <span className="text-xs text-slate-500 block mb-2">Takip Tarihi</span>
                      <input
                        type="date"
                        value={localFollowUpMonth}
                        onChange={(e) => handleFollowUpMonthChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Butonlar */}
                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border border-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Kaydet
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Bu demo talebini silmek istediğinizden emin misiniz?')) {
                        onDelete(request.id);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Talebi Sil
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Tablo Görünümü */}
      <tr className="hidden lg:table-row hover:bg-slate-50/50 transition-colors border-b border-slate-200">
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
            value={localPotentialStatus}
            onChange={(e) => handlePotentialStatusChange(e.target.value as PotentialStatus)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${statusCfg.color}`}
          >
            {Object.entries(potentialStatusConfig).map(([key, config]) => (
              <option key={key} value={key} className="bg-white text-slate-900">
                {config.icon} {config.label}
              </option>
            ))}
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

      {/* Detay Satırı (Expand) - Desktop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            className="hidden lg:table-row"
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

                  {/* Sağ Kolon - Satış Takibi */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Satış Takibi
                    </h4>
                    
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      {/* Potansiyel Durum */}
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 text-slate-400 mt-0.5">{statusCfg.icon}</div>
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block mb-2">Potansiyel Durum</span>
                          <select
                            value={localPotentialStatus}
                            onChange={(e) => handlePotentialStatusChange(e.target.value as PotentialStatus)}
                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none cursor-pointer"
                          >
                            {Object.entries(potentialStatusConfig).map(([key, config]) => (
                              <option key={key} value={key} className="text-slate-900">
                                {config.icon} {config.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Takip Tarihi */}
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-xs text-slate-500 block mb-2">Takip Tarihi</span>
                          <input
                            type="date"
                            value={localFollowUpMonth}
                            onChange={(e) => handleFollowUpMonthChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kaydet Butonu */}
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4" />
                          Kaydet
                        </>
                      )}
                    </button>

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
  const [potentialFilter, setPotentialFilter] = useState<PotentialStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDemoRequests();
      // Backend {success, message, data} formatında dönüyor
      const data = response?.data || response;
      // Emin ol ki data bir array
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        console.error('API response is not an array:', response);
        setRequests([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Demo talepleri yüklenemedi', { duration: 3000 });
      setRequests([]); // Hata durumunda boş array
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: string, data: Partial<DemoRequest>) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, ...data } : req));
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.deleteDemoRequest(id);
      setRequests(prev => prev.filter(req => req.id !== id));
      toast.success('Demo talebi silindi', { duration: 2000 });
    } catch (error) {
      toast.error('Silme işlemi başarısız', { duration: 2000 });
    }
  };

  // Filtreleme - requests array olduğundan emin ol
  const filteredRequests = Array.isArray(requests) ? requests.filter(req => {
    const matchesSearch = 
      req.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.phone.includes(searchTerm);
    
    const matchesPotential = potentialFilter === 'ALL' || req.potentialStatus === potentialFilter;

    return matchesSearch && matchesPotential;
  }) : [];

  const pendingCount = Array.isArray(requests) ? requests.filter(r => r.potentialStatus === 'PENDING').length : 0;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-3 sm:p-4 lg:p-6 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">Demo Talepleri</h1>
            <p className="text-sm sm:text-base text-slate-600">Gelen demo taleplerini görüntüleyin ve yönetin</p>
          </div>

          {/* Bekleyen Uyarısı */}
          {pendingCount > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0">⏳</span>
              <div>
                <p className="font-semibold text-amber-900 text-sm sm:text-base">
                  {pendingCount} bekleyen talep var
                </p>
                <p className="text-xs sm:text-sm text-amber-700">Lütfen en kısa sürede değerlendirin</p>
              </div>
            </div>
          )}

          {/* Filtreler */}
          <div className="mb-4 sm:mb-6 flex flex-col gap-3">
            <input
              type="text"
              placeholder="Restoran, kişi adı veya telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
            />
            
            <select
              value={potentialFilter}
              onChange={(e) => setPotentialFilter(e.target.value as PotentialStatus | 'ALL')}
              className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="ALL">Tüm Durumlar</option>
              {Object.entries(potentialStatusConfig)
                .filter(([key]) => key !== 'NONE')
                .map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.label}
                  </option>
                ))}
            </select>
          </div>

          {/* İçerik */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
              <p className="mt-4 text-slate-600 text-sm sm:text-base">Yükleniyor...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-600 text-sm sm:text-base">Henüz demo talebi yok</p>
            </div>
          ) : (
            <>
              {/* Mobil Liste Görünümü */}
              <div className="lg:hidden space-y-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {filteredRequests.map(request => (
                  <DemoRequestRow
                    key={request.id}
                    request={request}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Desktop Tablo Görünümü */}
              <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default DemoRequestsTable;
