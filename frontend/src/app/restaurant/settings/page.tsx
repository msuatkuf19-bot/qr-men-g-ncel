'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import RestaurantLogo from '@/components/RestaurantLogo';

export default function RestaurantSettingsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    headerImage: '',
    instagramUrl: '',
    facebookUrl: '',
    workingHours: '',
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [headerPreview, setHeaderPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyRestaurant();
      const restaurant = response.data?.restaurant || response.data || response;

      if (!restaurant || !restaurant.id) {
        throw new Error('Restaurant data not found');
      }

      setRestaurantId(restaurant.id);
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        logo: restaurant.logo || '',
        headerImage: restaurant.headerImage || '',
        instagramUrl: restaurant.instagramUrl || '',
        facebookUrl: restaurant.facebookUrl || '',
        workingHours: restaurant.workingHours || '',
      });

      // Backend URL'i ekle
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      setLogoPreview(
        restaurant.logo 
          ? (restaurant.logo.startsWith('http') ? restaurant.logo : `${backendUrl}${restaurant.logo}`)
          : ''
      );
      setHeaderPreview(
        restaurant.headerImage 
          ? (restaurant.headerImage.startsWith('http') ? restaurant.headerImage : `${backendUrl}${restaurant.headerImage}`)
          : ''
      );
    } catch (error: any) {
      console.error('Failed to fetch restaurant:', error);
      setMessage({ type: 'error', text: 'Restoran bilgileri yüklenemedi' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const response = await apiClient.uploadFile(file, 'logo');
      console.log('Logo upload response:', response);
      const imageUrl = response.data.url;
      console.log('Image URL from response:', imageUrl);
      
      setFormData({ ...formData, logo: imageUrl });
      // Cloudinary tam URL dönüyor, local path ise backend URL ekle
      const previewUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imageUrl}`;
      console.log('Preview URL:', previewUrl);
      setLogoPreview(previewUrl);
      setMessage({ type: 'success', text: '✅ Logo yüklendi!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Logo yüklenemedi' });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleHeaderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingHeader(true);
      const response = await apiClient.uploadFile(file, 'logo');
      const imageUrl = response.data.url;
      
      setFormData({ ...formData, headerImage: imageUrl });
      // Cloudinary tam URL dönüyor, local path ise backend URL ekle
      setHeaderPreview(imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imageUrl}`);
      setMessage({ type: 'success', text: '✅ Header görseli yüklendi!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Header görseli yüklenemedi' });
    } finally {
      setUploadingHeader(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      console.log('💾 Saving restaurant data:', {
        restaurantId,
        hasWorkingHours: !!formData.workingHours,
        workingHoursLength: formData.workingHours?.length,
        workingHoursPreview: formData.workingHours?.substring(0, 50)
      });

      await apiClient.updateRestaurant(restaurantId, formData);

      toast.success('✅ Restoran bilgileri kaydedildi!');
      setMessage({ type: 'success', text: '✅ Restoran bilgileri kaydedildi!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Kaydetme başarısız';
      toast.error(`❌ ${errorMessage}`);
      setMessage({ type: 'error', text: `❌ ${errorMessage}` });
      console.error('❌ Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
        <DashboardLayout title="⚙️ Restoran Ayarları">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
      <DashboardLayout title="⚙️ Restoran Ayarları">
        {/* Page Description */}
        <div className="mb-6">
          <p className="text-gray-500 text-sm">QR menünüzde görünecek temel bilgileri buradan düzenleyin.</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span className="text-lg">{message.type === 'success' ? '✓' : '✕'}</span>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* Logo Upload */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 p-6 hover:shadow-soft-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Restoran Logosu</h2>
            </div>

            <div className="space-y-4">
              <div className="w-full h-44 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <RestaurantLogo 
                    name={formData.name || 'Restoran'}
                    logoUrl={undefined}
                    size="lg"
                  />
                )}
              </div>

              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer group">
                  <div className="px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:shadow-lg text-center font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {uploadingLogo ? 'Yükleniyor...' : 'Logo Yükle'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>

                {logoPreview && (
                  <button
                    onClick={() => {
                      setFormData({ ...formData, logo: '' });
                      setLogoPreview('');
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Önerilen: 500×500px, maksimum 2MB
              </p>
            </div>
          </div>

          {/* Header Image Upload */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 p-6 hover:shadow-soft-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Header Görseli</h2>
            </div>

            <div className="space-y-4">
              {headerPreview ? (
                <div className="w-full h-44 bg-gray-50 rounded-xl overflow-hidden border-2 border-dashed border-gray-200">
                  <img src={headerPreview} alt="Header" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-44 bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 text-gray-400">
                  <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <span className="text-sm">Header yüklenmedi</span>
                </div>
              )}

              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer group">
                  <div className="px-4 py-3 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-200 text-center font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 border border-primary-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {uploadingHeader ? 'Yükleniyor...' : 'Header Yükle'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderUpload}
                    disabled={uploadingHeader}
                    className="hidden"
                  />
                </label>

                {headerPreview && (
                  <button
                    onClick={() => {
                      setFormData({ ...formData, headerImage: '' });
                      setHeaderPreview('');
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Önerilen: 1200×400px, maksimum 5MB
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 p-6 hover:shadow-soft-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restoran Adı</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Telefon
                  </span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900"
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Google Maps Linki
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Google Maps'ten konumunuzun linkini kopyalayıp buraya yapıştırın
                </p>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 p-6 hover:shadow-soft-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Çalışma Saatleri</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Çalışma Saatleri Metni
                </label>
                <input
                  type="text"
                  value={formData.workingHours}
                  onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                  placeholder="Örn: 10:30 - 20:00 veya Hafta İçi: 08:00 - 22:00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Müşterilere gösterilecek çalışma saatleri metni (Menüde görünür)
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-2xl shadow-soft border border-gray-100/80 p-6 hover:shadow-soft-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Sosyal Medya</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram URL
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900"
                  placeholder="https://instagram.com/restoraniniz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook URL
                  </span>
                </label>
                <input
                  type="url"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-gray-900"
                  placeholder="https://facebook.com/restoraniniz"
                />
              </div>

              {/* Info Box */}
              <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-primary-700">
                    <strong>İpucu:</strong> Sosyal medya butonları QR menüdeki alt barda görünecek ve müşterileriniz tek tıkla hesaplarınıza ulaşabilecek.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
