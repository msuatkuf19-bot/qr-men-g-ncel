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
  const [showPassword, setShowPassword] = useState(false);

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

      {/* Left Side - Phone Mockup Animation */}
      <div className="hidden lg:flex items-center justify-center p-12 relative z-10">
        <div className="relative">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          </div>

          {/* Laptop/Tablet Frame Background */}
          <div className="absolute inset-0 flex items-center justify-center animate-float" style={{transform: 'scale(1.8)', animationDelay: '0.5s', animationDuration: '4s'}}>
            {/* Laptop Base */}
            <div className="relative">
              {/* Screen Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl blur-2xl animate-pulse"></div>
              
              {/* Screen */}
              <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-3 shadow-2xl border-2 border-gray-700/50 hover:border-gray-600/50 transition-all duration-500">
                <div className="w-[420px] h-[280px] bg-gradient-to-br from-[#05070B] via-[#0C111C] to-[#141824] rounded-xl overflow-hidden relative border border-gray-700/30">
                  {/* Animated Grid Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(90deg, rgba(249,115,22,0.3) 1px, transparent 1px), linear-gradient(rgba(249,115,22,0.3) 1px, transparent 1px)',
                      backgroundSize: '30px 30px'
                    }}></div>
                  </div>
                  
                  {/* Screen reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
                  
                  {/* Animated scan line */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent animate-[slideDown_3s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Camera notch with LED indicator */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-900 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Keyboard/Base with breathing effect */}
              <div className="relative h-3 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl -mt-1 animate-pulse" style={{animationDuration: '4s'}}></div>
              <div className="w-[480px] h-2 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-2xl mx-auto shadow-xl"></div>
              
              {/* Shadow under laptop */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[400px] h-8 bg-black/40 blur-2xl rounded-full animate-pulse" style={{animationDuration: '3s'}}></div>
            </div>
          </div>

          {/* Phone Mockup (floating on top) */}
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

          {/* Enhanced Floating Elements with rotation */}
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
          <div className="absolute top-1/2 -right-16 w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center animate-float shadow-lg shadow-yellow-500/50" style={{animationDelay: '0.3s', animationDuration: '4.5s'}}>
            <span className="text-lg">☕</span>
          </div>
          <div className="absolute top-1/3 -left-10 w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center animate-float shadow-lg shadow-red-500/50" style={{animationDelay: '1.2s', animationDuration: '3.8s'}}>
            <span className="text-lg">🎂</span>
          </div>
          
          {/* Orbiting Particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
            <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s', animationDuration: '2.5s'}}></div>
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.5s', animationDuration: '3s'}}></div>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
