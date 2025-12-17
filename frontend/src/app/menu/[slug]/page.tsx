'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { buildTheme, getCardRadiusClass, getHeaderBackgroundStyle } from '@/lib/theme-utils';
import { getTodayWorkingHours, isRestaurantOpen } from '@/lib/working-hours-utils';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants';
import RestaurantLogo from '@/components/RestaurantLogo';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  imageUrl?: string;
  isAvailable: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  ingredients?: string;
  allergens?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  products: Product[];
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  headerImage?: string;
  phone?: string;
  address?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  themeColor?: string;
  themeSettings?: string;
  workingHours?: string;
}

export default function PublicMenu() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const tableNumber = searchParams.get('table');

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    loadMenu();
  }, [slug, tableNumber]);

  // Auto close welcome popup after 3 seconds
  useEffect(() => {
    if (showWelcome && restaurant && buildTheme(restaurant.themeSettings).showWelcomePopup !== false) {
      const autoCloseTimer = setTimeout(() => {
        setShowWelcome(false);
      }, 3000);
      return () => clearTimeout(autoCloseTimer);
    }
  }, [showWelcome, restaurant]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      console.log('Loading menu for slug:', slug);
      const response = await apiClient.getPublicMenu(slug, tableNumber || undefined);
      console.log('API Response:', response);
      console.log('🖼️ Categories with products:', response.data.categories);
      response.data.categories?.forEach((cat: any) => {
        console.log(`📂 Category "${cat.name}" products:`, cat.products);
        cat.products?.forEach((p: any) => {
          console.log(`  - ${p.name}: image=${p.image}, imageUrl=${p.imageUrl}`);
        });
      });
      const restaurantData = response.data.restaurant;
      console.log('Restaurant Data:', restaurantData);
      setRestaurant(restaurantData);
      setCategories(response.data.categories || []);
      
      // Track menu view analytics
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/analytics/menu-view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: restaurantData.id,
            tableId: tableNumber || null,
            currentPath: window.location.pathname,
            referrer: document.referrer || null,
          }),
        });
      } catch (err) {
        console.log('Analytics tracking failed:', err);
      }
    } catch (error: any) {
      console.error('Menü yüklenemedi:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = selectedCategory === 'all' 
    ? categories 
    : categories.filter(cat => cat.id === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Menü yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Restoran Bulunamadı</h1>
          <p className="text-gray-600">Bu QR kod geçersiz veya restoran mevcut değil.</p>
        </div>
      </div>
    );
  }

  const theme = buildTheme(restaurant?.themeSettings);
  const cardRadiusClass = getCardRadiusClass(theme.cardRadius);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: theme.backgroundColor }}>
      {/* Welcome Popup */}
      {showWelcome && buildTheme(restaurant.themeSettings).showWelcomePopup !== false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-scaleIn"
            style={{ backgroundColor: buildTheme(restaurant.themeSettings).welcomeBackgroundColor || '#FFFFFF' }}
          >

            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <RestaurantLogo 
                  name={restaurant.name}
                  logoUrl={restaurant.logo ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${restaurant.logo}` : null}
                  size="lg"
                  className="shadow-lg"
                />
                <h3 className="text-xl font-bold" style={{ color: buildTheme(restaurant.themeSettings).welcomeTitleColor || '#1F2937' }}>
                  {restaurant.name}
                </h3>
              </div>
              <h2 
                className="text-xl font-bold mb-2"
                style={{ color: buildTheme(restaurant.themeSettings).welcomeTitleColor || '#1F2937' }}
              >
                {(buildTheme(restaurant.themeSettings).welcomeTitle || 'Hoşgeldiniz!').slice(0, 30)}
              </h2>
              <p 
                className="text-base"
                style={{ color: buildTheme(restaurant.themeSettings).welcomeMessageColor || '#6B7280' }}
              >
                {(buildTheme(restaurant.themeSettings).welcomeMessage || 'Afiyet olsun.').slice(0, 50)}
              </p>
              {tableNumber && (
                <div className="mt-4 inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Masa {tableNumber}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header with Restaurant Info - Dynamic Theme */}
      <div 
        className="shadow-md relative overflow-hidden"
        style={
          restaurant.headerImage
            ? {
                backgroundImage: `url(${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${restaurant.headerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '240px',
              }
            : getHeaderBackgroundStyle(buildTheme(restaurant.themeSettings))
        }
      >
        {(buildTheme(restaurant.themeSettings).showHeaderOverlay || restaurant.headerImage) && (
          <div className="absolute inset-0 bg-black/40"></div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RestaurantLogo 
                name={restaurant.name}
                logoUrl={restaurant.logo ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${restaurant.logo}` : null}
                size="lg"
                className="shadow-md border-2 border-white/20"
              />
              <div>
                <h1 
                  className="text-2xl font-bold drop-shadow-lg"
                  style={{
                    color: buildTheme(restaurant.themeSettings).headerBackgroundType === 'gradient' || buildTheme(restaurant.themeSettings).showHeaderOverlay
                      ? '#ffffff'
                      : buildTheme(restaurant.themeSettings).primaryColor
                  }}
                >
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p 
                    className="text-sm drop-shadow"
                    style={{
                      color: buildTheme(restaurant.themeSettings).headerBackgroundType === 'gradient' || buildTheme(restaurant.themeSettings).showHeaderOverlay
                        ? '#ffffff'
                        : '#6B7280'
                    }}
                  >
                    {restaurant.description}
                  </p>
                )}
              </div>
            </div>
            {tableNumber && (
              <div 
                className="hidden sm:block px-4 py-2 rounded-full font-medium shadow"
                style={{
                  backgroundColor: buildTheme(restaurant.themeSettings).primaryColor,
                  color: '#ffffff'
                }}
              >
                Masa {tableNumber}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div 
            className="mt-4 flex items-center gap-2 text-sm drop-shadow"
            style={{
              color: buildTheme(restaurant.themeSettings).headerBackgroundType === 'gradient' || buildTheme(restaurant.themeSettings).showHeaderOverlay
                ? '#ffffff'
                : '#6B7280'
            }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
            </svg>
            <span>{restaurant.workingHours || '10:30 - 20:00'}</span>
          </div>
        </div>
      </div>

      {/* Category Filter - Dynamic Theme */}
      <div 
        className="sticky top-0 z-40 shadow-sm border-b overflow-x-auto"
        style={{ backgroundColor: buildTheme(restaurant.themeSettings).backgroundColor }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition shadow-sm"
            style={{
              backgroundColor: selectedCategory === 'all' ? buildTheme(restaurant.themeSettings).primaryColor : 'transparent',
              color: selectedCategory === 'all' ? '#ffffff' : buildTheme(restaurant.themeSettings).primaryColor,
              border: `2px solid ${buildTheme(restaurant.themeSettings).primaryColor}`
            }}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition shadow-sm"
              style={{
                backgroundColor: selectedCategory === category.id ? buildTheme(restaurant.themeSettings).primaryColor : 'transparent',
                color: selectedCategory === category.id ? '#ffffff' : buildTheme(restaurant.themeSettings).primaryColor,
                border: `2px solid ${buildTheme(restaurant.themeSettings).primaryColor}`
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Henüz menü eklenmemiş</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="mb-8">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                {category.description && (
                  <p className="text-gray-600 text-sm">{category.description}</p>
                )}
              </div>

              <div className="space-y-4">
                {category.products?.filter(p => p.isAvailable).map((product) => (
                  <div
                    key={product.id}
                    className={'bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden ' + cardRadiusClass}
                    style={{ borderColor: theme.primaryColor + '20', borderWidth: '1px' }}
                    onClick={() => {
                      // Track product view
                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                      fetch(apiUrl + '/api/analytics/product-view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          productId: product.id,
                          restaurantId: restaurant?.id,
                        }),
                      }).catch(() => {});
                    }}
                  >
                    <div className="flex gap-4 p-4">
                      {theme.showProductImages && (() => {
                        const imageUrl = product.imageUrl || product.image;
                        const imageSrc = imageUrl
                          ? imageUrl.startsWith('http')
                            ? imageUrl
                            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${imageUrl}`
                          : DEFAULT_PRODUCT_IMAGE;
                        
                        return (
                          <img
                            src={imageSrc}
                            alt={product.name}
                            className={'w-24 h-24 object-cover flex-shrink-0 ' + cardRadiusClass}
                            onError={(e) => {
                              console.error('Image load failed for:', product.name);
                              e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                        );
                      })()}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 
                            className="text-lg font-bold"
                            style={{ color: theme.primaryColor }}
                          >
                            {product.name}
                          </h3>
                          <div className="flex gap-1 ml-2">
                            {product.isNew && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">YENİ</span>
                            )}
                            {product.isPopular && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">POPÜLER</span>
                            )}
                          </div>
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        )}
                        
                        {/* Diyet Rozetleri */}
                        {(product.isVegetarian || product.isVegan || product.isGlutenFree || product.isSpicy) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {product.isVegetarian && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                🥗 Vejetaryen
                              </span>
                            )}
                            {product.isVegan && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                🌱 Vegan
                              </span>
                            )}
                            {product.isGlutenFree && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                🌾 Glütensiz
                              </span>
                            )}
                            {product.isSpicy && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                🌶️ Acı
                              </span>
                            )}
                          </div>
                        )}

                        {/* İçindekiler */}
                        {product.ingredients && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-semibold">İçindekiler:</span> {product.ingredients}
                          </div>
                        )}

                        {/* Alerjenler */}
                        {product.allergens && (
                          <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            <span className="font-semibold">⚠️ Alerjenler:</span> {product.allergens}
                          </div>
                        )}
                        
                        <div className="mt-3 flex items-center justify-between">
                          <span 
                            className="text-xl font-bold"
                            style={{ color: theme.secondaryColor }}
                          >
                            {product.price.toFixed(2)} ₺
                          </span>
                          {!product.isAvailable && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              Tükendi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Social Media & Contact Bar - Fixed Bottom - Dynamic Theme */}
      <div 
        className="fixed bottom-0 left-0 right-0 shadow-lg z-50"
        style={{ 
          backgroundColor: theme.preset === 'dark' ? '#1F2937' : 'white',
          borderTop: `1px solid ${theme.preset === 'dark' ? '#374151' : '#E5E7EB'}`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8">
            {/* WhatsApp */}
            <a 
              href={`https://wa.me/${restaurant.phone?.replace(/[^0-9]/g, '') || '905376043333'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{ color: theme.preset === 'dark' ? '#F3F4F6' : '#374151' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#25D366' }}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold">WhatsApp</span>
            </a>

            {/* Telefon */}
            <a 
              href={`tel:${restaurant.phone || '05376043333'}`}
              className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{ color: theme.preset === 'dark' ? '#F3F4F6' : '#374151' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#3B82F6' }}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold">Ara</span>
            </a>

            {/* Konum */}
            <a 
              href={restaurant.address || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 px-6 py-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
              style={{ color: theme.preset === 'dark' ? '#F3F4F6' : '#374151' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#EF4444' }}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span className="text-sm font-semibold">Konum</span>
            </a>

            {/* Instagram - Only show if URL exists */}
            {restaurant.instagramUrl && (
              <a 
                href={restaurant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition"
                style={{ color: theme.preset === 'dark' ? '#F3F4F6' : '#374151' }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Instagram</span>
              </a>
            )}

            {/* Facebook - Only show if URL exists */}
            {restaurant.facebookUrl && (
              <a 
                href={restaurant.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition"
                style={{ color: theme.preset === 'dark' ? '#F3F4F6' : '#374151' }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#1877F2' + '30' }}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#1877F2' }}>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Facebook</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-24"></div>
    </div>
  );
}
