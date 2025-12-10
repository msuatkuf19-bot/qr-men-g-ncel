'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#05070B] via-[#0C111C] to-[#141824]">
      {/* Header/Navbar */}
      <nav className="fixed w-full top-0 z-50 glass-effect border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <img src="/benmedya.png" alt="Menü Ben" className="h-20 w-auto brightness-0 invert" />
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Menü Ben
                </h1>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-400">Dijital QR Menü SaaS</p>
                </div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#ozellikler" className="text-gray-300 hover:text-orange-400 font-medium transition-colors">
                Özellikler
              </a>
              <a href="#nasil-calisir" className="text-gray-300 hover:text-orange-400 font-medium transition-colors">
                Nasıl Çalışır?
              </a>
              <a href="#fiyatlandirma" className="text-gray-300 hover:text-orange-400 font-medium transition-colors">
                Fiyatlandırma
              </a>
              <a href="#iletisim" className="text-gray-300 hover:text-orange-400 font-medium transition-colors">
                İletişim
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link 
                href="/login" 
                className="px-5 py-2 border border-orange-400/50 text-orange-400 rounded-lg font-medium hover:bg-orange-400/10 transition-all duration-300"
              >
                Giriş Yap
              </Link>
              <Link 
                href="/demo"
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
              >
                Demo Talep Et
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-3 animate-slideDown">
              <a href="#ozellikler" className="block text-gray-300 hover:text-orange-400 py-2">Özellikler</a>
              <a href="#nasil-calisir" className="block text-gray-300 hover:text-orange-400 py-2">Nasıl Çalışır?</a>
              <a href="#fiyatlandirma" className="block text-gray-300 hover:text-orange-400 py-2">Fiyatlandırma</a>
              <a href="#iletisim" className="block text-gray-300 hover:text-orange-400 py-2">İletişim</a>
              <div className="pt-3 space-y-2">
                <Link href="/login" className="block w-full px-5 py-2 border border-orange-400/50 text-orange-400 rounded-lg font-medium text-center">
                  Giriş Yap
                </Link>
                <Link href="/demo" className="block w-full px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold text-center">
                  Demo Talep Et
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6">
        {/* Background Effects */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-pink-500/20 rounded-full blur-[120px] animate-pulse delay-75"></div>
        
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slideUp">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">Sadece Restoranlar İçin</span>
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
                  <span className="text-gray-400">Kâğıt Menü</span>
                  <br />
                  <span className="text-gray-400">Dönemi</span>{' '}
                  <span className="gradient-text">Bitti</span>
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Restoranın İçin{' '}
                  <span className="gradient-text">Akıllı QR</span>
                  <br />
                  Menü Sistemi
                </h2>
              </div>

              {/* Description */}
              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                Restoranınız için profesyonel QR menü çözümü. Tek panelden tüm şubelerinizi yönetin, 
                menülerinizi anında güncelleyin, müşterilerinize hızlı ve hijyenik hizmet sunun.
              </p>

              {/* Stats */}
              <div className="flex items-center gap-8 text-sm">
                <div>
                  <div className="text-2xl font-bold gradient-text">1500+</div>
                  <div className="text-gray-500">Aktif Restoran</div>
                </div>
                <div className="w-px h-12 bg-gray-700"></div>
                <div>
                  <div className="text-2xl font-bold gradient-text">500K+</div>
                  <div className="text-gray-500">Menü Görüntüleme</div>
                </div>
                <div className="w-px h-12 bg-gray-700"></div>
                <div>
                  <div className="text-2xl font-bold gradient-text">%99</div>
                  <div className="text-gray-500">Müşteri Memnuniyeti</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/demo"
                  className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Ücretsiz Demo Talep Et
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <button className="px-8 py-4 glass-effect text-gray-300 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                  Örnek Menülere Göz At
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Şu an 1500+ restoran tarafından kullanılmakta</span>
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Animated Background Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                  <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
                </div>

                {/* Phone Mockup */}
                <div className="relative animate-float z-10 hover:scale-105 transition-transform duration-500">
                  {/* Multi-layer Glow Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-pink-500/30 to-purple-500/30 blur-[100px] animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/20 via-transparent to-pink-500/20 blur-[80px] animate-pulse" style={{animationDelay: '1s'}}></div>
                  
                  {/* Phone Frame */}
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3.5rem] p-4 shadow-2xl border border-white/10">
                    {/* Screen */}
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] rounded-[3rem] overflow-hidden w-[280px] h-[580px]">
                      {/* Status Bar */}
                      <div className="h-8 flex items-center justify-center">
                        <div className="w-28 h-6 bg-black rounded-full"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="px-6 py-8 space-y-6">
                        {/* Logo & Title */}
                        <div className="text-center space-y-3 animate-slideDown">
                          <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden shadow-lg animate-pulse">
                            <img src="/benmedya.png" alt="Menü Ben" className="w-full h-full object-contain brightness-0 invert" />
                          </div>
                          <h3 className="text-white font-bold text-xl">Menü Ben</h3>
                          <p className="text-gray-400 text-sm">Masa #12</p>
                        </div>

                        {/* Category Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: 'Ana Yemekler', icon: '🍽️', color: 'from-orange-500 to-red-500' },
                            { name: 'İçecekler', icon: '🥤', color: 'from-blue-500 to-cyan-500' },
                            { name: 'Tatlılar', icon: '🍰', color: 'from-pink-500 to-purple-500' },
                            { name: 'Atıştırmalık', icon: '🍟', color: 'from-yellow-500 to-orange-500' },
                            { name: 'Kahvaltı', icon: '☕', color: 'from-green-500 to-emerald-500' }
                          ].map((cat, i) => (
                            <div 
                              key={i} 
                              className={`relative h-24 rounded-2xl overflow-hidden animate-slideUp`}
                              style={{animationDelay: `${i * 0.15}s`}}
                            >
                              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`}></div>
                              <div className="relative h-full flex flex-col items-center justify-center p-2 text-center">
                                <span className="text-3xl mb-1">{cat.icon}</span>
                                <p className="text-white text-[10px] font-bold leading-tight">{cat.name}</p>
                              </div>
                            </div>
                          ))}
                          
                          {/* QR Scan Button */}
                          <div className="relative h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-white/20 animate-slideUp" style={{animationDelay: '0.75s'}}>
                            <div className="h-full flex flex-col items-center justify-center">
                              <svg className="w-12 h-12 text-white mb-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm4 4H7V7h2v2zm4-6h8v8h-8V3zm2 2v4h4V5h-4zm4 4h-2V7h2v2zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm4 4H7v-2h2v2zm6-6h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2-2h2v2h-2v-2z"/>
                              </svg>
                              <p className="text-white text-[9px] font-bold">Masanızı Tarayın</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Floating Elements */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center animate-float shadow-lg shadow-orange-500/50 hover:rotate-12 transition-transform duration-300" style={{animationDelay: '0.5s'}}>
                    <span className="text-2xl animate-pulse">🎉</span>
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-float shadow-lg shadow-green-500/50 hover:rotate-12 transition-transform duration-300" style={{animationDelay: '1s'}}>
                    <span className="text-2xl animate-pulse" style={{animationDelay: '0.5s'}}>✨</span>
                  </div>
                  
                  {/* Additional Floating Icons */}
                  <div className="absolute top-1/4 -right-12 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center animate-float shadow-lg shadow-blue-500/50" style={{animationDelay: '1.5s', animationDuration: '3.5s'}}>
                    <span className="text-xl">🍔</span>
                  </div>
                  <div className="absolute bottom-1/4 -left-12 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-float shadow-lg shadow-purple-500/50" style={{animationDelay: '2s', animationDuration: '4s'}}>
                    <span className="text-xl">🍕</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler Section */}
      <section id="ozellikler" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slideUp">
            <div className="inline-block px-4 py-2 glass-effect rounded-full border border-orange-500/20 mb-4">
              <span className="text-sm text-orange-400 font-medium">Özellikler</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Neden <span className="gradient-text">Menü Ben</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Modern restoran yönetimi için ihtiyacınız olan her şey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                ),
                title: 'Kolay Menü Yönetimi',
                description: 'Sürükle-bırak ile kategori ve ürün yönetimi. Anında güncelleme.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                ),
                title: 'Sınırsız İçerik',
                description: 'İstediğiniz kadar kategori, ürün ve şube ekleyin.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'Çoklu Şube Desteği',
                description: 'Tüm şubelerinizi tek panelden yönetin.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Gerçek Zamanlı',
                description: 'Fiyat ve ürün değişiklikleri anında yansır.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                ),
                title: 'QR Kod Yönetimi',
                description: 'Her masa için özel QR kod oluşturun ve takip edin.',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Detaylı İstatistikler',
                description: 'Görüntüleme, tıklama ve popüler ürün analizleri.',
                color: 'from-pink-500 to-red-500'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Sipariş Sepeti',
                description: 'Müşteriler sepet oluşturup not ekleyebilir.',
                color: 'from-cyan-500 to-blue-500'
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: '7/24 Destek',
                description: 'Telefon ve WhatsApp üzerinden kesintisiz destek.',
                color: 'from-green-500 to-teal-500'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-white/10 animate-slideUp"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır Section */}
      <section id="nasil-calisir" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slideUp">
            <div className="inline-block px-4 py-2 glass-effect rounded-full border border-green-500/20 mb-4">
              <span className="text-sm text-green-400 font-medium">Süreç</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Nasıl <span className="gradient-text">Çalışır?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              3 basit adımda QR menü sisteminizi kurun ve kullanmaya başlayın
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left - Timeline */}
            <div className="space-y-8">
              {[
                {
                  step: '01',
                  title: 'Kayıt Ol ve Restoranını Tanımla',
                  description: 'Hızlı kayıt formuyla hesap oluşturun. Restoran bilgilerinizi, şubelerinizi ve masa sayınızı girin.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  step: '02',
                  title: 'Menü Kategorilerini ve Ürünlerini Ekle',
                  description: 'Kategorilerinizi oluşturun, ürünlerinizi ekleyin. Fotoğraf, fiyat ve açıklama bilgilerini girin.',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  ),
                  color: 'from-orange-500 to-pink-500'
                },
                {
                  step: '03',
                  title: 'QR Kodları Masalara Yerleştir',
                  description: 'Her masa için özel QR kod oluşturun, yazdırın ve masalarınıza yerleştirin. Müşterileriniz hemen kullanmaya başlayabilir!',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  ),
                  color: 'from-green-500 to-emerald-500'
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group animate-slideUp" style={{animationDelay: `${i * 0.15}s`}}>
                  {/* Number Badge */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0C111C] rounded-lg border-2 border-orange-500 flex items-center justify-center">
                      <span className="text-xs font-bold gradient-text">{item.step}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right - Benefits Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  emoji: '🎨',
                  title: 'Olağanüstü Tasarım',
                  description: 'Müşterilerinizin gözlerini kamaştıracak modern arayüz',
                  gradient: 'from-purple-500/10 to-pink-500/10',
                  border: 'border-purple-500/20'
                },
                {
                  emoji: '⏱️',
                  title: 'Hızlı Hizmet',
                  description: 'Garson beklemeden anında menüye erişim',
                  gradient: 'from-blue-500/10 to-cyan-500/10',
                  border: 'border-blue-500/20'
                },
                {
                  emoji: '🧼',
                  title: 'Hijyenik',
                  description: 'Temassız, kağıtsız, güvenli menü deneyimi',
                  gradient: 'from-green-500/10 to-emerald-500/10',
                  border: 'border-green-500/20'
                },
                {
                  emoji: '✅',
                  title: 'Güvenli',
                  description: 'Garson onaylı sipariş sistemi',
                  gradient: 'from-orange-500/10 to-red-500/10',
                  border: 'border-orange-500/20'
                }
              ].map((benefit, i) => (
                <div 
                  key={i}
                  className={`glass-effect rounded-2xl p-6 border ${benefit.border} hover:scale-105 transition-transform animate-slideUp`}
                  style={{animationDelay: `${i * 0.1}s`}}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 text-3xl`}>
                    {benefit.emoji}
                  </div>
                  <h4 className="font-bold text-white mb-2">{benefit.title}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* İstatistik / Güven Section */}
      <section className="py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="glass-effect rounded-3xl p-12 border border-white/10">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              {[
                { 
                  number: '1.500+', 
                  label: 'Aktif Restoran',
                  description: 'Ülke genelinde hizmet veriyor',
                  icon: '🏪'
                },
                { 
                  number: '500.000+', 
                  label: 'Menü Görüntüleme',
                  description: 'Aylık müşteri etkileşimi',
                  icon: '👥'
                },
                { 
                  number: '%35', 
                  label: 'Daha Hızlı',
                  description: 'Sipariş alma süresi',
                  icon: '⚡'
                }
              ].map((stat, i) => (
                <div key={i} className="space-y-3 animate-slideUp" style={{animationDelay: `${i * 0.1}s`}}>
                  <div className="text-5xl mb-3">{stat.icon}</div>
                  <div className="text-5xl md:text-6xl font-bold gradient-text">
                    {stat.number}
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {stat.label}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {stat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fiyatlandırma */}
      <section id="fiyatlandirma" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-slideUp">
            <div className="inline-block px-4 py-2 glass-effect rounded-full border border-orange-500/20 mb-4">
              <span className="text-sm text-orange-400 font-medium">Fiyatlandırma</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Basit ve <span className="gradient-text">Şeffaf</span> Fiyat
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Gizli maliyet yok, tüm özellikler dahil
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="relative group animate-slideUp">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              
              {/* Card */}
              <div className="relative glass-effect rounded-3xl overflow-hidden border border-white/10">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur rounded-full mb-4">
                      <span className="text-white text-sm font-medium">Fiyatlandırma</span>
                    </div>
                    <h3 className="text-white text-3xl font-bold mb-4">Basit ve Şeffaf Fiyat</h3>
                    <p className="text-white/90 text-lg mb-2">Gizli maliyet yok, tüm özellikler dahil</p>
                    <p className="text-white text-sm">İşletmenize Özel Fiyat Alın</p>
                  </div>
                </div>

                {/* Features */}
                <div className="p-8 space-y-4">
                  {[
                    'Sınırsız Menü & Ürün',
                    'Sınırsız Masa & QR Kod',
                    'Çoklu Şube Yönetimi',
                    'Gerçek Zamanlı Güncelleme',
                    'Detaylı İstatistikler',
                    'Çoklu Kullanıcı Girişi',
                    'Telefon & WhatsApp Destek',
                    'Ücretsiz Kurulum'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 animate-slideUp" style={{animationDelay: `${i * 0.05}s`}}>
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-300 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="p-8 pt-0">
                  <Link 
                    href="/demo"
                    className="block w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold text-lg text-center hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 group-hover:scale-105"
                  >
                    İşletmenize Özel Fiyat Alın
                  </Link>
                  <p className="text-center text-sm text-gray-500 mt-4">
                    💳 Güvenli ödeme • 7 gün para iade garantisi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSS Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-slideUp">
            <div className="inline-block px-4 py-2 glass-effect rounded-full border border-purple-500/20 mb-4">
              <span className="text-sm text-purple-400 font-medium">SSS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Sıkça Sorulan <span className="gradient-text">Sorular</span>
            </h2>
            <p className="text-gray-400">
              Merak ettiklerinizin cevaplarını burada bulabilirsiniz
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'QR menü sistemi için ekstra ekipmana ihtiyacım var mı?',
                answer: 'Hayır, ekstra ekipmana ihtiyacınız yok. Müşterileriniz kendi akıllı telefonları ile QR kodu okutarak menüye erişebilirler. Sadece QR kodlarını yazdırıp masalarınıza yerleştirmeniz yeterli.'
              },
              {
                question: 'Menüde sınırsız ürün ekleyebilir miyim?',
                answer: 'Evet, sistemimizde herhangi bir ürün veya kategori limiti bulunmamaktadır. İstediğiniz kadar kategori oluşturabilir, ürün ekleyebilirsiniz.'
              },
              {
                question: 'Birden fazla şubem var, hepsini tek panelden yönetebilir miyim?',
                answer: 'Elbette! Çoklu şube yönetimi özelliğimiz sayesinde tüm şubelerinizi tek bir panelden yönetebilir, her şube için ayrı menüler oluşturabilirsiniz.'
              },
              {
                question: 'Fiyat değişikliklerini anında güncelleyebilir miyim?',
                answer: 'Evet, yönetim panelinden yaptığınız tüm değişiklikler (fiyat, ürün açıklaması, fotoğraf vb.) anında QR menüde görünür. Müşterileriniz her zaman güncel bilgileri görür.'
              },
              {
                question: 'Destek ve kurulum süreciniz nasıl işliyor?',
                answer: 'Kayıt olduktan sonra size özel kurulum desteği sunuyoruz. Telefon ve WhatsApp üzerinden 7/24 destek ekibimiz her zaman yanınızda. İlk kurulum tamamen ücretsizdir.'
              },
              {
                question: 'Müşteriler QR koddan nasıl sipariş verir?',
                answer: 'Müşterileriniz masadaki QR kodu tarar, menüyü görüntüler, ürünleri seçip sepete ekler ve isimlerini yazarak siparişi gönderir. Garsonunuz siparişi onayladıktan sonra hazırlık sürecine geçer.'
              }
            ].map((faq, i) => (
              <div 
                key={i}
                className="glass-effect rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all animate-slideUp"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-white font-semibold pr-8">{faq.question}</span>
                  <svg 
                    className={`w-6 h-6 text-orange-400 flex-shrink-0 transition-transform ${openFAQ === i ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFAQ === i && (
                  <div className="px-6 pb-5 animate-slideDown">
                    <p className="text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İletişim */}
      <section id="iletisim" className="py-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left - Contact Info */}
            <div className="space-y-8 animate-slideUp">
              <div>
                <div className="inline-block px-4 py-2 glass-effect rounded-full border border-orange-500/20 mb-4">
                  <span className="text-sm text-orange-400 font-medium">İletişim</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Hadi <span className="gradient-text">Konuşalım</span>
                </h2>
                <p className="text-gray-400 text-lg">
                  Sistemi restoranınıza uyarlamak veya demo talep etmek için bizimle iletişime geçin.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-4">
                <a href="tel:+905050806880" className="flex items-center gap-4 p-4 glass-effect rounded-xl hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Telefon</p>
                    <p className="text-white font-semibold text-lg">0505 080 68 80</p>
                  </div>
                </a>

                <a href="mailto:info@menuben.com" className="flex items-center gap-4 p-4 glass-effect rounded-xl hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">E-posta</p>
                    <p className="text-white font-semibold text-lg">info@menuben.com</p>
                  </div>
                </a>

                <a href="https://wa.me/905050806880" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 glass-effect rounded-xl hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">WhatsApp</p>
                    <p className="text-white font-semibold text-lg">Hemen Mesaj Gönder</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Right - Contact Form */}
            <div className="glass-effect rounded-2xl p-8 border border-white/10 animate-slideUp" style={{animationDelay: '0.2s'}}>
              <h3 className="text-2xl font-bold text-white mb-6">Demo Talep Formu</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Ad Soyad</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Adınız ve soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Restoran Adı</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Restoran veya işletme adı"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telefon</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="0555 555 55 55"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Mesajınız</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    placeholder="Merak ettiklerinizi yazın..."
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-white/5 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/benmedya.png" alt="Menü Ben" className="h-14 w-auto brightness-0 invert" />
                <div>
                  <h1 className="text-lg font-bold gradient-text">Menü Ben</h1>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Menü Ben - Modern restoranlar için dijital QR menü çözümü. Hızlı, güvenli ve kullanıcı dostu.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2">
                {['Özellikler', 'Nasıl Çalışır?', 'Fiyatlandırma', 'SSS', 'İletişim'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(/[^a-z]/g, '')}`} className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-white font-semibold mb-4">Bizi Takip Edin</h4>
              <div className="flex gap-3">
                {[
                  { name: 'Instagram', color: 'from-purple-500 to-pink-500' },
                  { name: 'Facebook', color: 'from-blue-500 to-blue-600' },
                  { name: 'Twitter', color: 'from-cyan-500 to-blue-500' },
                  { name: 'WhatsApp', color: 'from-green-500 to-emerald-500' }
                ].map((social) => (
                  <button 
                    key={social.name}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${social.color} flex items-center justify-center hover:scale-110 transition-transform`}
                    title={social.name}
                  >
                    <span className="text-white text-lg">•</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
            <p>© 2025 Menü Ben. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
