'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Layers,
  QrCode,
  Settings,
  MonitorSmartphone,
  BarChart3,
  Store,
  Users,
  LineChart,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isRestaurantAdmin = user?.role === 'RESTAURANT_ADMIN';

  const closeSidebar = () => setSidebarOpen(false);

  // Check if current path matches link
  const isActive = (href: string) => pathname === href;

  const iconClass = (active: boolean) =>
    active ? 'text-primary-600' : 'text-muted group-hover:text-primary-600';

  const Icon = ({
    active,
    children,
  }: {
    active: boolean;
    children: ReactNode;
  }) => (
    <span className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${active ? 'bg-primary-100/60' : 'bg-transparent group-hover:bg-primary-50/60'}`}>
      <span className={iconClass(active)}>{children}</span>
    </span>
  );

  // Sidebar link component for consistent styling
  const SidebarLink = ({ href, icon, label }: { href: string; icon: ReactNode; label: string }) => (
    (() => {
      const active = isActive(href);
      return (
    <Link
      href={href}
      onClick={closeSidebar}
      className={`
        group relative flex items-center gap-3 h-11 px-3 rounded-xl text-[14px] leading-none transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white
        ${active
          ? 'bg-primary-50/70 text-gray-900 font-semibold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-7 before:bg-primary-500 before:rounded-r-full'
          : 'text-muted hover:bg-primary-50/40 hover:text-gray-900'
        }
      `}
    >
      <Icon active={active}>
        {icon}
      </Icon>
      <span className="truncate">{label}</span>
    </Link>
      );
    })()
  );

  return (
    <div className="min-h-screen bg-surface-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Top Navigation - Premium Style */}
      <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-200/60 fixed w-full top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              
              <Link href={isSuperAdmin ? '/admin/dashboard' : '/restaurant/dashboard'} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                  <img src="/benmedya.png" alt="Menü Ben" className="h-6 w-auto brightness-0 invert" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-gray-900">Menü Ben</span>
                  <span className="text-sm text-gray-400 ml-2">
                    {isSuperAdmin ? '| Super Admin' : '| Restoran'}
                  </span>
                </div>
              </Link>
            </div>

            {/* User Menu - Premium Style */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-soft">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">{user?.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar - Premium Style */}
      <aside className={`
        fixed top-16 left-0 z-50 h-[calc(100vh-4rem)]
        w-64 bg-white border-r border-gray-200/60
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0 shadow-soft-lg' : '-translate-x-full'}
        lg:translate-x-0 lg:shadow-none
      `}>
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-full">
          {/* Section Label */}
          <div className="px-3 pt-2 pb-3 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.14em]">
            {isSuperAdmin ? 'Yönetim' : 'Menü Yönetimi'}
          </div>

          {isSuperAdmin && (
            <>
              <SidebarLink
                href="/admin/dashboard"
                icon={<LayoutDashboard size={20} strokeWidth={2} />}
                label="Dashboard"
              />
              <SidebarLink
                href="/admin/restaurants"
                icon={<Store size={20} strokeWidth={2} />}
                label="Restoranlar"
              />
              <SidebarLink
                href="/admin/users"
                icon={<Users size={20} strokeWidth={2} />}
                label="Kullanıcılar"
              />
              <SidebarLink
                href="/admin/analytics"
                icon={<LineChart size={20} strokeWidth={2} />}
                label="Analitik"
              />
            </>
          )}

          {isRestaurantAdmin && (
            <>
              <SidebarLink
                href="/restaurant/dashboard"
                icon={<LayoutDashboard size={20} strokeWidth={2} />}
                label="Dashboard"
              />
              <SidebarLink
                href="/restaurant/menu"
                icon={<ClipboardList size={20} strokeWidth={2} />}
                label="Menü Yönetimi"
              />
              <SidebarLink
                href="/restaurant/categories"
                icon={<Layers size={20} strokeWidth={2} />}
                label="Kategoriler"
              />
              <SidebarLink
                href="/restaurant/qr-codes"
                icon={<QrCode size={20} strokeWidth={2} />}
                label="QR Kodlar"
              />
              
              <div className="pt-5 pb-3 px-3">
                <div className="border-t border-gray-100/80"></div>
              </div>
              <div className="px-3 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.14em]">
                Ayarlar
              </div>
              
              <SidebarLink
                href="/restaurant/settings"
                icon={<Settings size={20} strokeWidth={2} />}
                label="Restoran Ayarları"
              />
              <SidebarLink
                href="/restaurant/menu-appearance"
                icon={<MonitorSmartphone size={20} strokeWidth={2} />}
                label="Menü Görünümü"
              />
              <SidebarLink
                href="/restaurant/analytics"
                icon={<BarChart3 size={20} strokeWidth={2} />}
                label="İstatistikler"
              />
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="pt-16 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {title && (
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
