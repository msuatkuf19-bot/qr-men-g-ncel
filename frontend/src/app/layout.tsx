import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import CustomCursor from '@/components/CustomCursor';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Menü Ben - Dijital QR Menü Sistemi',
  description: 'Menü Ben - Restoran menü yönetimi ve QR kod erişim sistemi',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/benmedya.png', sizes: 'any' },
    ],
    shortcut: '/favicon.ico',
    apple: '/benmedya.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" data-theme="dark">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17852172573"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17852172573');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){
  try {
    var stored = localStorage.getItem('theme');
    var mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    var systemTheme = (mql && mql.matches) ? 'dark' : 'light';
    var theme = (stored === 'dark' || stored === 'light') ? stored : systemTheme;

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    if (!stored && mql) {
      var onChange = function(e){
        var next = e && e.matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = next;
        document.documentElement.style.colorScheme = next;
      };
      if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onChange);
      else if (typeof mql.addListener === 'function') mql.addListener(onChange);
    }
  } catch (e) {}
})();`}
        </Script>
        <CustomCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
