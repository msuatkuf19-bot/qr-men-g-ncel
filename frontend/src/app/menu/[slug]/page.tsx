'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
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

  // Memoized theme - restaurant değişmedikçe yeniden hesaplanmaz
  const theme = useMemo(() => 
    restaurant ? buildTheme(restaurant.themeSettings) : null
  , [restaurant?.themeSettings]);

  // Memoized card radius class
  const cardRadiusClass = useMemo(() => 
    theme ? getCardRadiusClass(theme.cardRadius) : ''
  , [theme?.cardRadius]);

  // Memoized filtered categories - selectedCategory veya categories değişmedikçe yeniden hesaplanmaz
  const filteredCategories = useMemo(() => 
    selectedCategory === 'all' 
      ? categories 
      : categories.filter(cat => cat.id === selectedCategory)
  , [selectedCategory, categories]);

  // Memoized logo URL
  const logoUrl = useMemo(() => {
    if (!restaurant?.logo) return null;
    return restaurant.logo.startsWith('http') 
      ? restaurant.logo 
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${restaurant.logo}`;
  }, [restaurant?.logo]);

  // Category select handler - useCallback ile stabilize
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  // Product click handler - analytics tracking
  const handleProductClick = useCallback((productId: string, restaurantId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(apiUrl + '/api/analytics/product-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, restaurantId }),
    }).catch(() => {});
  }, []);

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
      const response = await apiClient.getPublicMenu(slug, tableNumber || undefined);
      const restaurantData = response.data.restaurant;
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
      } catch {
        // Analytics hatası sessizce geçilir
      }
    } catch (error: any) {
      // Production'da error boundary ile yönetilir
      if (process.env.NODE_ENV === 'development') {
        console.error('Menü yüklenemedi:', error);
      }
    } finally {
      setLoading(false);
    }
  };

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

  if (!restaurant || !theme) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Restoran Bulunamadı</h1>
          <p className="text-gray-600">Bu QR kod geçersiz veya restoran mevcut değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: theme.backgroundColor }}>
      {/* Welcome Popup */}
      {showWelcome && theme.showWelcomePopup !== false && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div 
            className="rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-scaleIn"
            style={{ backgroundColor: theme.welcomeBackgroundColor || '#FFFFFF' }}
          >

            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <RestaurantLogo 
                  name={restaurant.name}
                  logoUrl={logoUrl}
                  size="lg"
                  className="shadow-lg"
                />
                <h3 className="text-xl font-bold" style={{ color: theme.welcomeTitleColor || '#1F2937' }}>
                  {restaurant.name}
                </h3>
              </div>
              <h2 
                className="text-xl font-bold mb-2"
                style={{ color: theme.welcomeTitleColor || '#1F2937' }}
              >
                {(theme.welcomeTitle || 'Hoşgeldiniz!').slice(0, 30)}
              </h2>
              <p 
                className="text-base"
                style={{ color: theme.welcomeMessageColor || '#6B7280' }}
              >
                {(theme.welcomeMessage || 'Afiyet olsun.').slice(0, 50)}
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
            : getHeaderBackgroundStyle(theme)
        }
      >
        {(theme.showHeaderOverlay || restaurant.headerImage) && (
          <div className="absolute inset-0 bg-black/40"></div>
        )}
        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RestaurantLogo 
                name={restaurant.name}
                logoUrl={logoUrl}
                size="lg"
                className="shadow-md border-2 border-white/20"
              />
              <div>
                <h1 
                  className="text-2xl font-bold drop-shadow-lg"
                  style={{
                    color: theme.headerBackgroundType === 'gradient' || theme.showHeaderOverlay
                      ? '#ffffff'
                      : theme.primaryColor
                  }}
                >
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p 
                    className="text-sm drop-shadow"
                    style={{
                      color: theme.headerBackgroundType === 'gradient' || theme.showHeaderOverlay
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
                  backgroundColor: theme.primaryColor,
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
              color: theme.headerBackgroundType === 'gradient' || theme.showHeaderOverlay
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
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2">
          <button
            onClick={() => handleCategorySelect('all')}
            className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition shadow-sm"
            style={{
              backgroundColor: selectedCategory === 'all' ? theme.primaryColor : 'transparent',
              color: selectedCategory === 'all' ? '#ffffff' : theme.primaryColor,
              border: `2px solid ${theme.primaryColor}`
            }}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="px-4 py-2 rounded-full font-medium whitespace-nowrap transition shadow-sm"
              style={{
                backgroundColor: selectedCategory === category.id ? theme.primaryColor : 'transparent',
                color: selectedCategory === category.id ? '#ffffff' : theme.primaryColor,
                border: `2px solid ${theme.primaryColor}`
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
                    onClick={() => handleProductClick(product.id, restaurant.id)}
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
                            loading="lazy"
                            onError={(e) => {
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

      {/* Social Media & Contact Bar - Fixed Bottom - Premium Action Strip */}
      <div 
        className="fixed bottom-0 left-0 right-0 shadow-lg z-50"
        style={{ 
          backgroundColor: theme.preset === 'dark' ? '#1F2937' : 'white',
          borderTop: `1px solid ${theme.preset === 'dark' ? '#374151' : '#E5E7EB'}`
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8 sm:gap-10">
            {/* WhatsApp */}
            <a 
              href={`https://wa.me/${restaurant.phone?.replace(/[^0-9]/g, '') || '905376043333'}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp ile iletişime geç"
              title="WhatsApp"
              className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-200 hover:scale-[1.06] active:scale-95"
              style={{ 
                backgroundColor: theme.preset === 'dark' ? '#ffffff' : '#ffffff',
                border: `1px solid ${theme.preset === 'dark' ? '#374151' : '#E5E7EB'}`
              }}
            >
              <svg 
                className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:scale-105" 
                fill="#22c55e" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>

            {/* Telefon */}
            <a 
              href={`tel:${restaurant.phone || '05376043333'}`}
              aria-label="Telefon ile ara"
              title="Ara"
              className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-200 hover:scale-[1.06] active:scale-95"
              style={{ 
                backgroundColor: theme.preset === 'dark' ? '#ffffff' : '#ffffff',
                border: `1px solid ${theme.preset === 'dark' ? '#374151' : '#E5E7EB'}`
              }}
            >
              <svg 
                className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:scale-105" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </a>

            {/* Konum */}
            <a 
              href={restaurant.address || "https://maps.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Konumu görüntüle"
              title="Konum"
              className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-200 hover:scale-[1.06] active:scale-95"
              style={{ 
                backgroundColor: theme.preset === 'dark' ? '#ffffff' : '#ffffff',
                border: `1px solid ${theme.preset === 'dark' ? '#374151' : '#E5E7EB'}`
              }}
            >
              <svg 
                className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:scale-105" 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </a>

            {/* Instagram - Only show if URL exists */}
            {restaurant.instagramUrl && (
              <a 
                href={restaurant.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram'da takip et"
                title="Instagram"
                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-200 hover:scale-[1.06] active:scale-95"
                style={{ 
                  backgroundColor: theme.preset === 'dark' ? '#ffffff' : '#ffffff',
                  border: `1px solid ${theme.preset === 'dark' ? '#374151' : '#E5E7EB'}`
                }}
              >
                <svg 
                  className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:scale-105" 
                  fill="none" 
                  stroke="#e1306c" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}

            {/* Facebook - Only show if URL exists */}
            {restaurant.facebookUrl && (
              <a 
                href={restaurant.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook'ta takip et"
                title="Facebook"
                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl transition-all duration-200 hover:scale-[1.06] active:scale-95"
                style={{ 
                  backgroundColor: theme.preset === 'dark' ? '#ffffff' : '#ffffff',
                  border: `1px solid ${theme.preset === 'dark' ? '#374151' : '#E5E7EB'}`
                }}
              >
                <svg 
                  className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200 group-hover:scale-105" 
                  fill="#1877F2" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed bottom bar - reduced height */}
      <div className="h-16"></div>
    </div>
  );
}
