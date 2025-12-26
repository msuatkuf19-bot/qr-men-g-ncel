'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAutoLogout } from '@/hooks/useAutoLogout';

// Auto-logout işleyicisi - hook'u bir kez çağırmak için wrapper
function AutoLogoutHandler() {
  useAutoLogout();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Veri 60 saniye boyunca "taze" kabul edilir - gereksiz refetch önler
            staleTime: 60 * 1000,
            // Garbage collection: kullanılmayan veri 5 dakika sonra temizlenir
            gcTime: 5 * 60 * 1000,
            // Pencere odağında otomatik refetch kapalı (gereksiz API çağrısı önler)
            refetchOnWindowFocus: false,
            // Ağ yeniden bağlandığında refetch kapalı
            refetchOnReconnect: false,
            // Mount'ta refetch kapalı (staleTime içindeyse)
            refetchOnMount: false,
            // Hata durumunda 1 kez yeniden dene
            retry: 1,
            // Retry gecikmesi
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
          },
          mutations: {
            // Mutation hata durumunda yeniden deneme kapalı
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AutoLogoutHandler />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {children}
    </QueryClientProvider>
  );
}
