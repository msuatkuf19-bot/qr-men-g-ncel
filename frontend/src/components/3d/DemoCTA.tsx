'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface FormData {
  name: string;
  restaurant: string;
  phone: string;
}

export default function DemoCTA() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    restaurant: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', restaurant: '', phone: '' });
    }, 3000);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Glass Background */}
      <div className="relative backdrop-blur-xl bg-gradient-to-r from-white/10 via-white/5 to-white/10 border-t border-white/20">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-xl md:text-2xl font-bold text-white mb-1"
              >
                Sana özel{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  QR Menü demo paneli
                </span>{' '}
                oluşturalım
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-gray-400 text-sm"
              >
                1 dakikada formu doldur, demo panelin otomatik oluşsun.
              </motion.p>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto"
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ad Soyad"
                required
                className="w-full md:w-40 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all duration-300 text-sm"
              />
              <input
                type="text"
                name="restaurant"
                value={formData.restaurant}
                onChange={handleChange}
                placeholder="Restoran Adı"
                required
                className="w-full md:w-44 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all duration-300 text-sm"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Telefon / WhatsApp"
                required
                className="w-full md:w-44 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:bg-white/15 transition-all duration-300 text-sm"
              />
              
              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative w-full md:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm
                  transition-all duration-300 overflow-hidden group
                  ${isSubmitted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-black hover:shadow-2xl hover:shadow-amber-500/50'
                  }
                `}
                style={{
                  boxShadow: isSubmitted ? 'none' : '0 10px 40px -10px rgba(251, 191, 36, 0.5)',
                }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Oluşturuluyor...
                    </>
                  ) : isSubmitted ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Talebiniz Alındı!
                    </>
                  ) : (
                    <>
                      Demo Panelimi Oluştur
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.form>
          </div>
        </div>

        {/* Decorative particles */}
        <div className="absolute top-4 left-10 w-2 h-2 bg-amber-400/50 rounded-full animate-pulse" />
        <div className="absolute top-8 right-20 w-1.5 h-1.5 bg-orange-400/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-4 left-1/4 w-1 h-1 bg-purple-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </motion.div>
  );
}
