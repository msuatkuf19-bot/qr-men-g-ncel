'use client';

import { useRef, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

// Dynamic imports - ağır bileşenler lazy yüklenir
const CategoryCardsSection = dynamic(() => import('./components/CategoryCardsSection'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>,
  ssr: true,
});

const PhonePreviewSection = dynamic(() => import('./components/PhonePreviewSection'), {
  loading: () => <div className="min-h-[600px]" />,
  ssr: true,
});

const MenuTemplatesSection = dynamic(() => import('./components/MenuTemplatesSection'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>,
  ssr: true,
});

const CTASection = dynamic(() => import('./components/CTASection'), {
  loading: () => <div className="min-h-[300px]" />,
  ssr: true,
});

const Footer = dynamic(() => import('./components/Footer'), {
  ssr: true,
});

export default function OrnekMenulerPage() {
  const templatesRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Scroll to templates section
    if (templatesRef.current) {
      templatesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0B0D] overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Category Cards Section */}
      <CategoryCardsSection onCategoryClick={handleCategoryClick} />

      {/* Phone Preview Section */}
      <PhonePreviewSection />

      {/* Menu Templates Section */}
      <MenuTemplatesSection
        activeCategory={activeCategory}
        sectionRef={templatesRef}
      />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
