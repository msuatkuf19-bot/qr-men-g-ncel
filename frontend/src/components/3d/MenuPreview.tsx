'use client';

import { motion } from 'framer-motion';

const menuCategories = [
  { name: 'Ana Yemekler', icon: '🍽️', count: 12, color: 'from-orange-500 to-red-500' },
  { name: 'İçecekler', icon: '🥤', count: 8, color: 'from-blue-500 to-cyan-500' },
  { name: 'Tatlılar', icon: '🍰', count: 6, color: 'from-pink-500 to-purple-500' },
  { name: 'Kahvaltı', icon: '☕', count: 10, color: 'from-yellow-500 to-orange-500' },
];

const menuItems = [
  { name: 'Izgara Köfte', price: '₺180', image: '🍖' },
  { name: 'Caesar Salata', price: '₺95', image: '🥗' },
  { name: 'Karışık Pizza', price: '₺220', image: '🍕' },
];

export default function MenuPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#0a0a0f] to-[#151520] text-white overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <span className="text-sm">🍽️</span>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-white">Demo Restoran</h3>
            <p className="text-[8px] text-gray-400">Masa #5</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="p-2 space-y-1.5">
        <p className="text-[8px] text-gray-400 uppercase tracking-wider mb-1">Kategoriler</p>
        <div className="grid grid-cols-2 gap-1.5">
          {menuCategories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`relative h-12 rounded-lg overflow-hidden cursor-pointer group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className="relative h-full flex items-center justify-center gap-1 p-1">
                <span className="text-lg">{cat.icon}</span>
                <div className="text-center">
                  <p className="text-[7px] font-bold text-white leading-tight">{cat.name}</p>
                  <p className="text-[6px] text-white/70">{cat.count} ürün</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Popular Items */}
      <div className="p-2">
        <p className="text-[8px] text-gray-400 uppercase tracking-wider mb-1.5">Popüler</p>
        <div className="space-y-1.5">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg">
                {item.image}
              </div>
              <div className="flex-1">
                <p className="text-[8px] font-semibold text-white">{item.name}</p>
                <p className="text-[10px] font-bold text-orange-400">{item.price}</p>
              </div>
              <button className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-[10px] text-white">+</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/50 backdrop-blur-sm border-t border-white/10 flex items-center justify-around px-2">
        {['🏠', '📋', '🛒', '👤'].map((icon, i) => (
          <button key={i} className={`w-6 h-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-orange-500' : 'bg-white/10'}`}>
            <span className="text-xs">{icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
