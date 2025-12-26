'use client';

import { useEffect, useRef, useCallback } from 'react';

// Development modda performans ölçümü - prod'da devre dışı
const IS_DEV = process.env.NODE_ENV === 'development';
const ENABLE_PERF_LOGGING = IS_DEV && typeof window !== 'undefined';

// Ölçüm sonuçlarını saklamak için
interface PerfMetric {
  name: string;
  duration: number;
  timestamp: number;
}

// Global metrics store (dev only)
const metricsStore: PerfMetric[] = [];
const renderCounts: Map<string, number> = new Map();
const apiCallCounts: Map<string, number> = new Map();

/**
 * Sayfa render süresini ölçer
 */
export function usePageLoadMetric(pageName: string) {
  const startTime = useRef<number>(Date.now());
  const measured = useRef(false);

  useEffect(() => {
    if (!ENABLE_PERF_LOGGING || measured.current) return;
    
    // İlk render tamamlandıktan sonra ölç
    const duration = Date.now() - startTime.current;
    measured.current = true;

    console.log(
      `%c⏱️ [PERF] ${pageName} - İlk render: ${duration}ms`,
      'color: #10B981; font-weight: bold;'
    );

    metricsStore.push({
      name: `page_load_${pageName}`,
      duration,
      timestamp: Date.now(),
    });
  }, [pageName]);
}

/**
 * Component render sayısını takip eder
 */
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);

  useEffect(() => {
    if (!ENABLE_PERF_LOGGING) return;
    
    renderCount.current += 1;
    renderCounts.set(componentName, renderCount.current);

    // Çok fazla render varsa uyar
    if (renderCount.current > 5) {
      console.warn(
        `%c⚠️ [PERF] ${componentName} - Yüksek render sayısı: ${renderCount.current}`,
        'color: #F59E0B; font-weight: bold;'
      );
    }
  });

  return renderCount.current;
}

/**
 * API çağrı süresini ölçer ve tekrar eden çağrıları tespit eder
 */
export function useApiCallTracker() {
  const trackApiCall = useCallback((endpoint: string, duration: number) => {
    if (!ENABLE_PERF_LOGGING) return;

    const count = (apiCallCounts.get(endpoint) || 0) + 1;
    apiCallCounts.set(endpoint, count);

    const color = duration > 1000 ? '#EF4444' : duration > 500 ? '#F59E0B' : '#10B981';
    console.log(
      `%c🌐 [API] ${endpoint} - ${duration}ms (çağrı #${count})`,
      `color: ${color}; font-weight: bold;`
    );

    // Aynı endpoint 3+ kez çağrıldıysa uyar
    if (count >= 3) {
      console.warn(
        `%c⚠️ [PERF] ${endpoint} - Tekrarlanan API çağrısı tespit edildi (${count}x)`,
        'color: #F59E0B; font-weight: bold;'
      );
    }

    metricsStore.push({
      name: `api_${endpoint}`,
      duration,
      timestamp: Date.now(),
    });
  }, []);

  return { trackApiCall };
}

/**
 * Performans raporunu konsola yazdırır
 */
export function logPerformanceReport() {
  if (!ENABLE_PERF_LOGGING) return;

  console.group('%c📊 Performans Raporu', 'color: #6366F1; font-size: 14px; font-weight: bold;');
  
  console.log('%c📄 Sayfa Yükleme Süreleri:', 'color: #10B981; font-weight: bold;');
  const pageMetrics = metricsStore.filter(m => m.name.startsWith('page_load_'));
  pageMetrics.forEach(m => {
    console.log(`  • ${m.name.replace('page_load_', '')}: ${m.duration}ms`);
  });

  console.log('%c🔄 Render Sayıları:', 'color: #F59E0B; font-weight: bold;');
  renderCounts.forEach((count, name) => {
    const status = count > 5 ? '⚠️' : '✅';
    console.log(`  ${status} ${name}: ${count} render`);
  });

  console.log('%c🌐 API Çağrı Sayıları:', 'color: #3B82F6; font-weight: bold;');
  apiCallCounts.forEach((count, endpoint) => {
    const status = count >= 3 ? '⚠️' : '✅';
    console.log(`  ${status} ${endpoint}: ${count} çağrı`);
  });

  console.groupEnd();
}

// Global window'a ekle (dev'de konsoldan erişim için)
if (ENABLE_PERF_LOGGING && typeof window !== 'undefined') {
  (window as any).__PERF_REPORT__ = logPerformanceReport;
  (window as any).__PERF_METRICS__ = metricsStore;
  (window as any).__RENDER_COUNTS__ = renderCounts;
  (window as any).__API_CALLS__ = apiCallCounts;
  
  console.log(
    '%c🔧 Performans araçları yüklendi. Rapor için: __PERF_REPORT__()',
    'color: #6366F1; font-style: italic;'
  );
}
