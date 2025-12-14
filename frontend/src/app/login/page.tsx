'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Auth store'u güncelle
        setAuth(user, accessToken, refreshToken);
        
        // Role'e göre yönlendir
        if (user.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard');
        } else if (user.role === 'RESTAURANT_ADMIN') {
          router.push('/restaurant/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError('Giriş başarısız');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Giriş başarısız';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070B] via-[#0C111C] to-[#141824] grid lg:grid-cols-2 relative">
      {/* Back Button */}
      <Link 
        href="/"
        className="fixed top-6 left-6 z-50 glass-effect border border-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/10 flex items-center gap-2 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Ana Sayfa
      </Link>

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Left Side - Phone Mockup (same as landing hero) */}
      <div className="hidden lg:flex items-center justify-center p-12 relative z-10">
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
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3.5rem] p-4 shadow-2xl border border-white/10" style={{overflow: 'visible'}}>
              {/* Screen */}
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] rounded-[3rem] w-[280px] h-[580px]" style={{overflow: 'visible'}}>
                {/* Status Bar */}
                <div className="h-8 flex items-center justify-center">
                  <div className="w-28 h-6 bg-black rounded-full"></div>
                </div>
                
                {/* Content */}
                <div className="px-6 py-8 space-y-6">
                  {/* Logo & Title */}
                  <div className="text-center space-y-3 animate-slideDown">
                    <div className="w-28 h-28 mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/30 ring-2 ring-orange-500/30">
                      <img src="/benmedya.png" alt="Menü Ben" className="w-full h-full object-contain brightness-0 invert" />
                    </div>
                    <h3 className="text-white font-bold text-xl">Menü Ben</h3>
                    <p className="text-gray-400 text-sm">Masa #12</p>
                  </div>

                  {/* Category Cards */}
                  <div className="grid grid-cols-2 gap-3 relative">
                    {[
                      { name: 'Ana Yemekler', icon: '🍽️', color: 'from-orange-500 to-red-500' },
                      { name: 'İçecekler', icon: '🥤', color: 'from-blue-500 to-cyan-500' },
                      { name: 'Tatlılar', icon: '🍰', color: 'from-pink-500 to-purple-500' },
                      { name: 'Atıştırmalık', icon: '🍟', color: 'from-yellow-500 to-orange-500' },
                      { name: 'Kahvaltı', icon: '☕', color: 'from-green-500 to-emerald-500' }
                    ].map((cat, i) => (
                      <div 
                        key={i} 
                        className={`relative h-24 rounded-2xl overflow-hidden animate-slideUp ${
                          cat.name === 'Kahvaltı'
                            ? 'col-start-1 col-end-2 row-start-3 z-[1] left-0 right-0 bottom-0'
                            : ''
                        }`}
                        style={{animationDelay: `${i * 0.15}s`}}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`}></div>
                        <div className="relative h-full flex flex-col items-center justify-center p-2 text-center">
                          <span className="text-3xl mb-1">{cat.icon}</span>
                          <p className="text-white text-[10px] font-bold leading-tight">{cat.name}</p>
                        </div>
                      </div>
                    ))}
                    
                    {/* QR Scan Button - Dark Premium Style */}
                    <div className="relative h-24 rounded-2xl col-start-2 row-start-3" style={{overflow: 'visible'}}>
                      <div 
                        className="relative z-[3] w-[120%] h-[120%] right-[-18px] bottom-[-18px] group cursor-pointer"
                        style={{overflow: 'visible'}}
                      >
                        {/* QR Card Container */}
                        <div 
                          className="relative w-full h-full rounded-2xl overflow-hidden bg-[linear-gradient(180deg,rgba(12,14,24,0.98)_0%,rgba(8,10,18,0.96)_100%)] border border-[rgba(239,116,44,0.55)] shadow-[0_20px_60px_rgba(0,0,0,0.45)] animate-slideUp group-hover:-translate-y-2 group-hover:scale-[1.04] transition-all duration-500 ease-out"
                          style={{ animationDelay: '0.75s' }}
                        >
                          {/* QR Content */}
                          <div className="relative h-full flex flex-col items-center justify-center p-[18px]">
                            {/* QR Icon */}
                            <div className="relative">
                              <svg
                                className="w-14 h-14 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm4 4H7V7h2v2zm4-6h8v8h-8V3zm2 2v4h4V5h-4zm4 4h-2V7h2v2zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm4 4H7v-2h2v2zm6-6h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm-2-2h2v2h-2v-2z"/>
                              </svg>
                            </div>
                            
                            {/* Label */}
                            <p className="mt-2 text-[15px] font-semibold text-white tracking-[0.02em] drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]">
                              Masanızı Tarayın
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-6 relative z-10">
        <div className="glass-effect rounded-3xl p-8 w-full max-w-md border border-white/10 animate-slideUp">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-orange-400 to-pink-500 p-3 rounded-xl">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/>
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h1>
            <p className="text-gray-400">Hesabınıza giriş yapın</p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl backdrop-blur">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              E-Posta veya Kullanıcı Adı
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 text-orange-500 bg-white/5 border-white/10 rounded focus:ring-orange-500 focus:ring-offset-0" />
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Beni Hatırla</span>
            </label>
            <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">Şifremi Unuttum</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Giriş yapılıyor...
              </>
            ) : (
              <>
                Giriş Yap
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0C111C] text-gray-500">veya</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-6">
          <Link href="/register">
            <button className="w-full glass-effect border border-white/10 text-white py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Yeni İşletme Kaydı Oluştur
            </button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500">
            İşletme hesabı oluşturun ve işletmenizi dijital dünyaya taşıyın! 🚀
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
