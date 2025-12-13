'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import QrBox from '@/components/QrBox';

interface QRCode {
  id: string;
  code?: string;
  type: 'RESTAURANT' | 'TABLE';
  tableNumber?: number;
  url: string;
  imageUrl: string; // QR image endpoint URL
  isActive: boolean;
  createdAt: string;
}

export default function RestaurantQRCodes() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'RESTAURANT' as 'RESTAURANT' | 'TABLE',
    tableNumber: 1,
  });
  const [restaurantSlug, setRestaurantSlug] = useState('');

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const restaurantRes = await apiClient.getMyRestaurant();
      const restaurant = restaurantRes.data;
      setRestaurantSlug(restaurant.slug);
      
      const qrRes = await apiClient.getQRCodes(restaurant.id);
      console.log('📊 QR Codes loaded:', qrRes.data?.length || 0);
      setQrCodes(qrRes.data || []);
    } catch (error) {
      console.error('QR kodlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const restaurantRes = await apiClient.getMyRestaurant();
      const restaurantId = restaurantRes.data.id;

      await apiClient.createQRCode({
        restaurantId,
        type: formData.type,
        tableNumber: formData.type === 'TABLE' ? formData.tableNumber : undefined,
      });
      
      setShowModal(false);
      resetForm();
      loadQRCodes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu QR kodu silmek istediğinizden emin misiniz?')) return;
    try {
      await apiClient.deleteQRCode(id);
      loadQRCodes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Silinemedi');
    }
  };

  const toggleActive = async (qr: QRCode) => {
    try {
      await apiClient.updateQRCode(qr.id, {
        isActive: !qr.isActive,
      });
      loadQRCodes();
    } catch (error: any) {
      alert('Durum güncellenemedi');
    }
  };

  const downloadQR = async (qr: QRCode) => {
    try {
      const text = getQRDisplayUrl(qr);
      if (!text) {
        alert('QR linki oluşturulamadı');
        return;
      }

      const response = await fetch(`/api/qr?text=${encodeURIComponent(text)}`, {
        cache: 'no-store',
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${qr.type === 'TABLE' ? `Masa-${qr.tableNumber}` : 'Genel'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('QR indirme hatası:', error);
      alert('QR kodu indirilemedi');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'RESTAURANT',
      tableNumber: 1,
    });
  };

  const getQRDisplayUrl = (qr: QRCode) => {
    if (!restaurantSlug) return '';

    const base = (process.env.NEXT_PUBLIC_BASE_URL?.trim() || window.location.origin).replace(/\/$/, '');
    const path = `/m/${restaurantSlug}`;

    if (qr.type === 'TABLE') {
      const table = Number((qr as any).tableNumber);
      if (Number.isFinite(table) && table > 0) {
        return `${base}${path}?table=${table}`;
      }
    }

    return `${base}${path}`;
  };

  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
      <DashboardLayout title="🎯 QR Kod Yönetimi">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <p className="text-gray-600 text-sm sm:text-base">QR kodlarınızı oluşturun ve yönetin</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>Yeni QR Kod</span>
          </button>
        </div>

        {/* QR Codes Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-8 sm:py-12 px-4">
            <p className="text-gray-500 text-base sm:text-lg">Henüz QR kod oluşturulmamış</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">Başlamak için "Yeni QR Kod" butonuna tıklayın</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {qrCodes.map((qr) => (
              <div
                key={qr.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {qr.type === 'TABLE' ? `Masa ${qr.tableNumber}` : 'Genel Menü'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(qr.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      qr.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {qr.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {/* QR Code Preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex justify-center">
                  <QrBox url={getQRDisplayUrl(qr)} size={180} />
                </div>

                {/* URL */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-600 font-mono break-all">
                    {getQRDisplayUrl(qr)}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadQR(qr)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                    >
                      İndir
                    </button>
                    <button
                      onClick={() => toggleActive(qr)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
                    >
                      {qr.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(qr.id)}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni QR Kod Oluştur</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">QR Tipi *</label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as 'RESTAURANT' | 'TABLE' })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="RESTAURANT">Genel Menü</option>
                      <option value="TABLE">Masa QR</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.type === 'RESTAURANT'
                        ? 'Tüm menü için genel QR kod'
                        : 'Belirli bir masa için QR kod'}
                    </p>
                  </div>

                  {formData.type === 'TABLE' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Masa Numarası *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.tableNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, tableNumber: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Bilgi:</strong> QR kod oluşturulduktan sonra indirip yazdırabilirsiniz.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Oluştur
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
