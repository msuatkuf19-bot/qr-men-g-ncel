'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Particles Component for star effect
function StarParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; opacity: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="demo-star-particle absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            opacity: [p.opacity, p.opacity * 2, p.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Floating Glow Cards
function FloatingCards() {
  const cards = [
    { icon: '⚡', text: '1 dakikada hazır', position: 'top-32 left-[5%]', delay: 0 },
    { icon: '🔐', text: 'Güvenli altyapı', position: 'top-48 right-[5%]', delay: 0.5 },
    { icon: '📊', text: 'Detaylı analiz', position: 'bottom-[35%] left-[8%]', delay: 1 },
    { icon: '📲', text: 'WhatsApp ile giriş bilgisi', position: 'bottom-[40%] right-[8%]', delay: 1.5 },
  ];

  return (
    <>
      {cards.map((card, i) => (
        <motion.div
          key={i}
          className={`demo-pill absolute ${card.position} hidden lg:flex items-center gap-3 px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + card.delay, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: card.delay, ease: 'easeInOut' }}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">{card.icon}</span>
            <span className="text-white text-sm font-medium">{card.text}</span>
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}

// Phone Mockup with Progress Steps
function PhoneMockup() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { text: 'Restoranını oluşturuyoruz', done: currentStep >= 1 },
    { text: 'QR Menü şablonunu ekliyoruz', done: currentStep >= 2 },
    { text: 'QR kodunu hazırlıyoruz', done: false, loading: currentStep >= 2 },
  ];

  const dashboardCards = [
    { name: 'Menüler', icon: '📋', gradient: 'from-orange-500 to-red-500' },
    { name: 'Masalar', icon: '🪑', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'QR Kodlar', icon: '📱', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Analizler', icon: '📊', gradient: 'from-green-500 to-emerald-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative z-10"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-blue-500/30 blur-[100px] animate-pulse" />

      {/* Phone Frame */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="demo-phone-frame relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-[2.5rem] md:rounded-[3rem] p-2 md:p-3 shadow-2xl border border-white/20"
      >
        {/* Screen */}
        <div className="demo-phone-screen bg-[#050814] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden w-[240px] md:w-[280px] lg:w-[320px] h-[420px] md:h-[500px] lg:h-[580px]">
          {/* Notch */}
          <div className="h-6 md:h-8 flex items-center justify-center">
            <div className="w-20 h-6 bg-black rounded-full relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800 border border-gray-700" />
            </div>
          </div>

          {/* Content */}
          <div className="demo-phone-card px-4 md:px-5 lg:px-6 py-3 md:py-4 lg:py-6 space-y-3 md:space-y-4 lg:space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <h3 className="text-white font-bold text-sm md:text-lg lg:text-xl">Demo Panelin Hazırlanıyor</h3>
            </motion.div>

            {/* Progress Steps */}
            <div className="space-y-2 md:space-y-3 lg:space-y-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.2 }}
                  className="flex items-center gap-2 md:gap-3"
                >
                  <div
                    className={`w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.done
                        ? 'bg-green-500'
                        : step.loading
                        ? 'bg-orange-500/20 border border-orange-500'
                        : 'bg-gray-700'
                    }`}
                  >
                    {step.done ? (
                      <svg className="w-3 h-3 md:w-4 md:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </motion.div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                    )}
                  </div>
                  <span className={`text-xs md:text-sm ${step.done ? 'text-green-400' : step.loading ? 'text-orange-400' : 'text-gray-500'}`}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Admin Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="space-y-2 md:space-y-3"
            >
              <p className="text-gray-400 text-[10px] md:text-xs text-center">Admin Panel Önizleme</p>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {dashboardCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5 + i * 0.1 }}
                    className={`bg-gradient-to-br ${card.gradient} p-3 md:p-4 rounded-xl md:rounded-2xl`}
                  >
                    <span className="text-2xl md:text-3xl">{card.icon}</span>
                    <p className="mt-1 md:mt-2 text-white text-[10px] md:text-xs font-semibold">{card.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Sticky Form Band
function StickyFormBand() {
  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    phone: '',
    email: '',
    type: '',
    tables: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const { apiClient } = await import('@/lib/api-client');
      await apiClient.createDemoRequest({
        fullName: formData.name,
        restaurantName: formData.restaurant,
        phone: formData.phone,
        email: formData.email || null,
        restaurantType: formData.type,
        tableCount: formData.tables ? Number(formData.tables) : 0,
      });

      setIsSubmitted(true);

      // Optional reset
      setFormData({
        name: '',
        restaurant: '',
        phone: '',
        email: '',
        type: '',
        tables: '',
      });
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Demo talebi gönderilemedi';
      setSubmitError(message);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setIsSubmitting(false);
    }
  };

  const restaurantTypes = ['Kafe', 'Restoran', 'Fast Food', 'Otel', 'Diğer'];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      className="relative lg:fixed lg:bottom-0 lg:left-0 lg:right-0 z-50"
    >
      <div className="demo-form-band relative backdrop-blur-2xl bg-slate-900/95 border-t border-white/10 shadow-2xl">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center"
                >
                  <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">✅ Demo talebiniz alındı!</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Panelin hazırlanıyor. En kısa sürede WhatsApp üzerinden iletişime geçeceğiz.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="text-center lg:text-left mb-6 lg:mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    Sana özel <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">QR Menü demo paneli</span> oluşturalım
                  </h2>
                  <p className="text-gray-400 text-sm lg:text-base">
                    1 dakikada formu doldur, demo panelin otomatik oluşsun. Tamamen ücretsiz.
                  </p>
                  {isSubmitting && (
                    <div className="mt-4 max-w-md mx-auto lg:mx-0">
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <p className="text-orange-400 text-xs mt-2 font-medium">Hazırlanıyor... {progress}%</p>
                    </div>
                  )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
                  {submitError && (
                    <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur">
                      ❌ {submitError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400 px-1">Ad Soyad *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Örn: Ahmet Yılmaz"
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400 px-1">Restoran Adı *</label>
                      <input
                        type="text"
                        value={formData.restaurant}
                        onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                        placeholder="Örn: Lezzet Durağı"
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400 px-1">Telefon / WhatsApp *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="05XX XXX XX XX"
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400 px-1">E-posta</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ornek@email.com (opsiyonel)"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 backdrop-blur"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400 px-1">Restoran Tipi *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 appearance-none backdrop-blur"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', backgroundSize: '18px' }}
                      >
                        <option value="" className="bg-slate-900">Seçiniz</option>
                        {restaurantTypes.map((type) => (
                          <option key={type} value={type} className="bg-slate-900">{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400 px-1">Masa Sayısı</label>
                      <input
                        type="number"
                        value={formData.tables}
                        onChange={(e) => setFormData({ ...formData, tables: e.target.value })}
                        placeholder="Örn: 25"
                        min="1"
                        max="500"
                        disabled={isSubmitting}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50 backdrop-blur"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6 flex justify-center lg:justify-end">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      className="relative w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      
                      <span className="relative flex items-center justify-center gap-2.5 text-base">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </motion.div>
                            Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Demo Panelimi Oluştur
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Main Page Component
export default function DemoRequestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="demo relative min-h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0514 0%, #050814 100%)' }}>
      {/* Hide scrollbar */}
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-500/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Star Particles */}
      {mounted && <StarParticles />}

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="demo-header fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4"
        style={{ background: 'rgba(5, 5, 5, 0.8)', backdropFilter: 'blur(20px)' }}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Left - Back Button */}
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white/20 rounded-full text-gray-300 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline text-sm">Ana Sayfa</span>
          </Link>

          {/* Center - Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/benmedya.png" alt="Menü Ben" className="logo--dark h-10 md:h-12 w-auto brightness-0 invert" />
            <img src="/benmedya.png" alt="" aria-hidden="true" className="logo--light hidden h-10 md:h-12 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Menü Ben</h1>
              <p className="text-xs text-gray-500">Demo Deneyimi</p>
            </div>
          </Link>

          {/* Right - WhatsApp Button */}
          <a
            href="https://wa.me/905050806880"
            target="_blank"
            rel="noopener noreferrer"
            className="demo-whatsapp flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 hover:bg-green-500/30 transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="hidden sm:inline text-sm font-medium">WhatsApp</span>
          </a>
        </div>
      </motion.header>

      {/* Floating Cards */}
      <FloatingCards />

      {/* Main Content */}
      <div className="relative z-10 pt-20 md:pt-24 pb-8 lg:pb-48 flex flex-col items-center justify-center px-4 md:px-6 min-h-[60vh] lg:min-h-screen">
        {/* Phone Mockup */}
        <PhoneMockup />
      </div>

      {/* Form Band - Scrollable on mobile, sticky on desktop */}
      <StickyFormBand />

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/20 to-transparent pointer-events-none" />
    </main>
  );
}
