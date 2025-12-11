'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Particle component for background animation
const Particle = ({ index }: { index: number }) => {
  const [windowHeight, setWindowHeight] = useState(1000);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
  }, []);

  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 5;
  const randomDuration = 15 + Math.random() * 10;
  const randomSize = 2 + Math.random() * 4;

  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-orange-500/30 to-pink-500/30"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${randomX}%`,
        top: '100%',
      }}
      animate={{
        y: [0, -windowHeight - 100],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: 'linear',
      }}
    />
  );
};

// Menu items for auto-scroll
const menuItems = [
  { name: 'Izgara Köfte', price: '185₺', category: 'Ana Yemek' },
  { name: 'Karışık Izgara', price: '320₺', category: 'Ana Yemek' },
  { name: 'Tavuk Şiş', price: '145₺', category: 'Ana Yemek' },
  { name: 'Adana Kebap', price: '195₺', category: 'Ana Yemek' },
  { name: 'Lahmacun', price: '55₺', category: 'Aperatif' },
  { name: 'Mercimek Çorbası', price: '45₺', category: 'Çorba' },
  { name: 'Kola', price: '35₺', category: 'İçecek' },
  { name: 'Ayran', price: '25₺', category: 'İçecek' },
  { name: 'Künefe', price: '95₺', category: 'Tatlı' },
  { name: 'Baklava', price: '85₺', category: 'Tatlı' },
];

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollY((prev) => (prev + 1) % (menuItems.length * 60));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden pt-32 pb-20 px-6">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Background Gradient Orbs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-pink-500/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 glass-effect rounded-full border border-green-500/20 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400 font-medium">Restaurant ve Cafeler İçin</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-white">Gerçek Menü</span>
              <br />
              <span className="gradient-text">Deneyimini Keşfet</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              QR Menü sisteminizin müşteriye nasıl göründüğünü canlı deneyin.
              Modern, hızlı ve etkileyici menü tasarımlarımızı keşfedin.
            </motion.p>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div>
                <div className="text-2xl font-bold gradient-text">50+</div>
                <div className="text-gray-500">Menü Şablonu</div>
              </div>
              <div className="w-px h-12 bg-gray-700 hidden sm:block"></div>
              <div>
                <div className="text-2xl font-bold gradient-text">3</div>
                <div className="text-gray-500">Kategori</div>
              </div>
              <div className="w-px h-12 bg-gray-700 hidden sm:block"></div>
              <div>
                <div className="text-2xl font-bold gradient-text">%100</div>
                <div className="text-gray-500">Özelleştirilebilir</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - 3D Phone Mockup */}
          <motion.div
            className="flex-1 flex justify-center"
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 via-pink-500/40 to-purple-500/40 blur-[80px] animate-pulse"></div>

              {/* Phone Frame */}
              <motion.div
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3.5rem] p-4 shadow-2xl border border-white/10"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Screen */}
                <div className="bg-gradient-to-br from-[#0B0B0D] to-[#1a1a2e] rounded-[3rem] overflow-hidden w-[280px] h-[580px]">
                  {/* Status Bar */}
                  <div className="h-8 flex items-center justify-center">
                    <div className="w-28 h-6 bg-black rounded-full"></div>
                  </div>

                  {/* Content */}
                  <div className="px-4 py-4">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-2">
                        <span className="text-white text-2xl">🍽️</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">Lezzet Durağı</h3>
                      <p className="text-gray-400 text-xs">Masa #5</p>
                    </div>

                    {/* Auto-scrolling Menu */}
                    <div className="h-[380px] overflow-hidden relative">
                      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#0B0B0D] to-transparent z-10"></div>
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0B0B0D] to-transparent z-10"></div>
                      
                      <motion.div
                        className="space-y-3"
                        animate={{ y: -scrollY }}
                        transition={{ duration: 0 }}
                      >
                        {[...menuItems, ...menuItems].map((item, i) => (
                          <div
                            key={i}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="text-white font-medium text-sm">{item.name}</h4>
                                <p className="text-gray-500 text-xs">{item.category}</p>
                              </div>
                              <span className="text-orange-400 font-bold text-sm">{item.price}</span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/50"
                animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <span className="text-2xl">☕</span>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/50"
                animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <span className="text-2xl">🍕</span>
              </motion.div>

              <motion.div
                className="absolute top-1/3 -right-8 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <span className="text-lg">🍔</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
