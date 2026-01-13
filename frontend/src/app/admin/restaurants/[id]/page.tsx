'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { restaurantApi, restaurantKeys } from '@/lib/api/restaurant';
import { Download, Copy, ExternalLink, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => restaurantApi.getById(id),
  });

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Yükleniyor...</div>;
  }

  if (error || !restaurant) {
    return <div className="container mx-auto px-4 py-8">Restoran bulunamadı</div>;
  }

  const qrCode = restaurant.qrCodes?.[0];
  const menuUrl = `${window.location.origin}/menu/${restaurant.slug}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopyalandı!`);
  };

  const downloadQR = () => {
    if (!qrCode?.imageData) return;
    
    const link = document.createElement('a');
    link.href = qrCode.imageData;
    link.download = `qr-${restaurant.slug}.png`;
    link.click();
    toast.success('QR kod indiriliyor...');
  };

  const membershipStatus = restaurant.membershipStatus;
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    SUSPENDED: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-blue-600 hover:underline mb-4">
          ← Geri
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600 mt-2">Üye No: {restaurant.memberNo}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[membershipStatus]}`}>
            {membershipStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">QR Kod</h2>
            {qrCode?.imageData && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <img src={qrCode.imageData} alt="QR Code" className="w-full" />
                </div>
                <div className="space-y-2">
                  <button
                    onClick={downloadQR}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Download size={16} />
                    QR Kodu İndir
                  </button>
                  <button
                    onClick={() => copyToClipboard(menuUrl, 'Menü linki')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Copy size={16} />
                    Menü Linkini Kopyala
                  </button>
                  <a
                    href={menuUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ExternalLink size={16} />
                    Menüyü Görüntüle
                  </a>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Tarama Sayısı: {qrCode.scanCount}</p>
                  {qrCode.lastScannedAt && (
                    <p>Son Tarama: {new Date(qrCode.lastScannedAt).toLocaleString('tr-TR')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Restaurant Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">İşletme Bilgileri</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">İşletme Tipi</dt>
                <dd className="mt-1 text-sm text-gray-900">{restaurant.businessType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">/menu/{restaurant.slug}</dd>
              </div>
              {restaurant.phone && (
                <div className="flex items-start gap-2">
                  <Phone size={16} className="mt-1 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.phone}</dd>
                  </div>
                </div>
              )}
              {restaurant.email && (
                <div className="flex items-start gap-2">
                  <Mail size={16} className="mt-1 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.email}</dd>
                  </div>
                </div>
              )}
              {restaurant.fullAddress && (
                <div className="md:col-span-2 flex items-start gap-2">
                  <MapPin size={16} className="mt-1 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Adres</dt>
                    <dd className="mt-1 text-sm text-gray-900">{restaurant.fullAddress}</dd>
                  </div>
                </div>
              )}
            </dl>
          </div>

          {/* Membership Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Üyelik Bilgileri</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar size={16} className="mt-1 text-gray-400" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Başlangıç Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {restaurant.membershipStartDate ? new Date(restaurant.membershipStartDate).toLocaleDateString('tr-TR') : '-'}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={16} className="mt-1 text-gray-400" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bitiş Tarihi</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {restaurant.membershipEndDate ? new Date(restaurant.membershipEndDate).toLocaleDateString('tr-TR') : '-'}
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* Owner Info */}
          {restaurant.owner && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Sahip Bilgileri</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
                  <dd className="mt-1 text-sm text-gray-900">{restaurant.owner.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{restaurant.owner.email}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Internal Note */}
          {restaurant.internalNote && (
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">Dahili Not</h3>
              <p className="text-sm text-yellow-800">{restaurant.internalNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
