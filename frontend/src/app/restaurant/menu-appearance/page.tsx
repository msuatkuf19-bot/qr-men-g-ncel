'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import MenuThemePreview from '@/components/MenuThemePreview';
import { buildTheme, ThemeSettings, AVAILABLE_PRESETS } from '@/lib/theme-utils';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';

export default function MenuAppearancePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Restaurant data
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [restaurantLogo, setRestaurantLogo] = useState<string>('');
  
  // Theme form state
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    preset: 'light',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#F9FAFB',
    headerBackgroundType: 'gradient',
    headerImageUrl: '',
    showHeaderOverlay: false,
    cardRadius: 'lg',
    showProductImages: true,
    
    // Welcome Popup defaults
    welcomeTitle: 'Hoşgeldiniz!',
    welcomeMessage: 'Afiyet olsun.',
    welcomeBackgroundColor: '#FFFFFF',
    welcomeTitleColor: '#1F2937',
    welcomeMessageColor: '#6B7280',
    showWelcomePopup: true,
  });

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getMyRestaurant();
        console.log('getMyRestaurant response:', response);
        
        // Backend returns { success: true, data: { restaurant, categories } }
        const restaurant = response.data?.restaurant || response.data || response;
        console.log('Restaurant data:', restaurant);
        
        if (!restaurant || !restaurant.id) {
          throw new Error('Restaurant data not found');
        }
        
        setRestaurantId(restaurant.id);
        setRestaurantName(restaurant.name);
        setRestaurantLogo(restaurant.logo || '');

        // Parse existing theme settings
        if (restaurant.themeSettings) {
          try {
            const parsed = typeof restaurant.themeSettings === 'string' 
              ? JSON.parse(restaurant.themeSettings) 
              : restaurant.themeSettings;
            setThemeSettings(prev => ({ ...prev, ...parsed }));
          } catch (e) {
            console.error('Failed to parse theme settings:', e);
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch restaurant:', error);
        setMessage({ type: 'error', text: 'Restoran bilgileri yüklenemedi: ' + (error.message || 'Bilinmeyen hata') });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  // Handle preset change
  const handlePresetChange = (preset: ThemeSettings['preset']) => {
    const theme = buildTheme({ preset });
    setThemeSettings({
      ...theme,
      headerImageUrl: themeSettings.headerImageUrl, // Keep existing image
    });
  };

  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      console.log('Saving theme settings...', {
        restaurantId,
        themeSettings: JSON.stringify(themeSettings)
      });

      const response = await apiClient.updateRestaurant(restaurantId, {
        themeSettings: JSON.stringify(themeSettings),
      });

      console.log('Theme saved successfully:', response);
      setMessage({ type: 'success', text: '✅ Tema ayarları başarıyla kaydedildi!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to save theme:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Tema kaydedilemedi. Lütfen tekrar deneyin.';
      setMessage({ type: 'error', text: `❌ ${errorMessage}` });
    } finally {
      setSaving(false);
    }
  };

  // Build preview theme
  const previewTheme = buildTheme(themeSettings);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
        <DashboardLayout title="Menü Görünümü">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN']}>
      <DashboardLayout title="Menü Görünümü">
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Menü Görünümü Özelleştirme</h3>
                <p className="text-sm text-blue-700">
                  Müşterilerinizin göreceği dijital menünün görünümünü özelleştirin. 
                  Değişiklikler anında sağdaki önizlemede görünür. Kaydet butonuna tıklayarak ayarlarınızı uygulayın.
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg border-l-4 animate-slideDown ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Main Grid: Form + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Left: Form Controls */}
            <div className="space-y-6">
              {/* Preset Selection */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🎨</span>
                  <h2 className="text-xl font-bold text-gray-900">Tema Seçimi</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetChange(preset.value as ThemeSettings['preset'])}
                      className={`p-4 rounded-lg border-2 text-left transition hover:scale-105 ${
                        themeSettings.preset === preset.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{preset.label}</div>
                      <div className="text-xs text-gray-600">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🎨</span>
                  <h2 className="text-xl font-bold text-gray-900">Renk Özelleştirme</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ana Renk (Primary)
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                        className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İkincil Renk (Secondary)
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={themeSettings.secondaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                        className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeSettings.secondaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#8B5CF6"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arkaplan Rengi
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={themeSettings.backgroundColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, backgroundColor: e.target.value })}
                        className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeSettings.backgroundColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="#F9FAFB"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Header Settings */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🖼️</span>
                  <h2 className="text-xl font-bold text-gray-900">Başlık Ayarları</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlık Tipi
                    </label>
                    <select
                      value={themeSettings.headerBackgroundType}
                      onChange={(e) => setThemeSettings({ 
                        ...themeSettings, 
                        headerBackgroundType: e.target.value as ThemeSettings['headerBackgroundType']
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="gradient">🌈 Gradient (Renk Geçişi)</option>
                      <option value="solid">⬜ Solid (Tek Renk)</option>
                      <option value="image">🖼️ Image (Görsel)</option>
                    </select>
                  </div>

                  {themeSettings.headerBackgroundType === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Görsel URL
                      </label>
                      <input
                        type="url"
                        value={themeSettings.headerImageUrl}
                        onChange={(e) => setThemeSettings({ ...themeSettings, headerImageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/header-image.jpg"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.showHeaderOverlay}
                      onChange={(e) => setThemeSettings({ ...themeSettings, showHeaderOverlay: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Başlığa koyu katman ekle (Yazılar daha okunur olur)
                    </span>
                  </label>
                </div>
              </div>

              {/* Card Settings */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🃏</span>
                  <h2 className="text-xl font-bold text-gray-900">Kart Ayarları</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Köşe Yuvarlaklığı
                    </label>
                    <select
                      value={themeSettings.cardRadius}
                      onChange={(e) => setThemeSettings({ 
                        ...themeSettings, 
                        cardRadius: e.target.value as ThemeSettings['cardRadius']
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="sm">Küçük (Minimal)</option>
                      <option value="md">Orta (Dengeli)</option>
                      <option value="lg">Büyük (Modern)</option>
                      <option value="full">Tam Yuvarlak (Soft)</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.showProductImages}
                      onChange={(e) => setThemeSettings({ ...themeSettings, showProductImages: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Ürün görsellerini göster
                    </span>
                  </label>
                </div>
              </div>

              {/* Welcome Popup Settings */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">👋</span>
                  <h2 className="text-xl font-bold text-gray-900">Hoşgeldiniz Popup'ı</h2>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={themeSettings.showWelcomePopup}
                      onChange={(e) => setThemeSettings({ ...themeSettings, showWelcomePopup: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Hoşgeldiniz popup'ını göster
                    </span>
                  </label>

                  {themeSettings.showWelcomePopup && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Başlık Metni
                        </label>
                        <input
                          type="text"
                          value={themeSettings.welcomeTitle || 'Hoşgeldiniz!'}
                          onChange={(e) => setThemeSettings({ ...themeSettings, welcomeTitle: e.target.value.slice(0, 30) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Hoşgeldiniz!"
                          maxLength={30}
                        />
                        <p className="mt-1 text-xs text-gray-500">{(themeSettings.welcomeTitle || '').length}/30 karakter</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mesaj Metni
                        </label>
                        <input
                          type="text"
                          value={themeSettings.welcomeMessage || 'Afiyet olsun.'}
                          onChange={(e) => setThemeSettings({ ...themeSettings, welcomeMessage: e.target.value.slice(0, 50) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Afiyet olsun."
                          maxLength={50}
                        />
                        <p className="mt-1 text-xs text-gray-500">{(themeSettings.welcomeMessage || '').length}/50 karakter</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arkaplan Rengi
                        </label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            value={themeSettings.welcomeBackgroundColor || '#FFFFFF'}
                            onChange={(e) => setThemeSettings({ ...themeSettings, welcomeBackgroundColor: e.target.value })}
                            className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeSettings.welcomeBackgroundColor || '#FFFFFF'}
                            onChange={(e) => setThemeSettings({ ...themeSettings, welcomeBackgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="#FFFFFF"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Başlık Rengi
                        </label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            value={themeSettings.welcomeTitleColor || '#1F2937'}
                            onChange={(e) => setThemeSettings({ ...themeSettings, welcomeTitleColor: e.target.value })}
                            className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeSettings.welcomeTitleColor || '#1F2937'}
                            onChange={(e) => setThemeSettings({ ...themeSettings, welcomeTitleColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="#1F2937"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mesaj Rengi
                        </label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="color"
                            value={themeSettings.welcomeMessageColor || '#6B7280'}
                            onChange={(e) => setThemeSettings({ ...themeSettings, welcomeMessageColor: e.target.value })}
                            className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={themeSettings.welcomeMessageColor || '#6B7280'}
                            onChange={(e) => setThemeSettings({ ...themeSettings, welcomeMessageColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="#6B7280"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Değişiklikleri Kaydet</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Live Preview */}
            <div className="lg:sticky lg:top-8 h-fit">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border shadow-sm">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">📱 Canlı Önizleme</h3>
                  <p className="text-sm text-gray-600">Müşterilerinizin göreceği görünüm</p>
                </div>
                
                <MenuThemePreview 
                  theme={previewTheme}
                  restaurantName={restaurantName}
                  restaurantLogo={restaurantLogo}
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
