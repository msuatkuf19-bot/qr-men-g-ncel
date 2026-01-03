# SuperAdmin Analytics Module - Setup Guide

## ✅ ÖZELLİKLER

### Backend
- ✅ `AnalyticsEvent` Prisma modeli (detaylı event tracking)
- ✅ SuperAdmin analytics service (KPI, time series, restaurant performance)
- ✅ 7 analytics endpoint (summary, timeseries, restaurants, top-products, device-breakdown, hourly, export)
- ✅ CSV export desteği
- ✅ SUPER_ADMIN role kontrolü (tüm endpointlerde)
- ✅ Multi-tenant aggregation
- ✅ Previous period comparison

### Frontend
- ✅ `/admin/analytics` - Global analytics dashboard
- ✅ `/admin/analytics/restaurant/[id]` - Restaurant drill-down page
- ✅ KPI kartları (6 metrik + trend göstergeleri)
- ✅ Restoran performans tablosu (sayfalama, sıralama)
- ✅ Tarih aralığı filtreleri (7/30/90 gün)
- ✅ Cihaz ve kaynak filtreleri
- ✅ CSV export butonu
- ✅ Sidebar'da "Analitik" menüsü aktif

## 📊 VERİ MODELİ

```prisma
model AnalyticsEvent {
  id           String              @id @default(uuid())
  createdAt    DateTime            @default(now())
  restaurantId String
  sessionId    String?             // Session tracking
  visitorId    String?             // Unique visitor tracking
  eventType    AnalyticsEventType  // QR_SCAN, MENU_VIEW, PRODUCT_VIEW, etc.
  pagePath     String?
  categoryId   String?
  productId    String?
  tableNo      String?
  source       AnalyticsSource?    // QR, DIRECT, SOCIAL, OTHER
  deviceType   DeviceType          // MOBILE, DESKTOP, TABLET
  referrer     String?
  userAgent    String?
  ip           String?
  restaurant   Restaurant
}
```

## 🚀 DEPLOYMENT ADIMLARI

### 1. Veritabanı Migration (Production)

```bash
# Backend dizininde
cd backend
npx prisma migrate deploy
```

### 2. Prisma Client Regenerate

```bash
npx prisma generate
```

### 3. Build & Deploy

Backend ve frontend build edilir ve deploy edilir (Render otomatik yapacak).

## 📡 API ENDPOINTS

Tüm endpointler `/api/superadmin/analytics/` altında ve `SUPER_ADMIN` role gerektirir.

### GET /summary
Global KPI özeti döner
- Query: `from`, `to`, `restaurantId?`, `device?`, `source?`
- Response: `totalVisits`, `uniqueVisitors`, `qrScans`, `menuViews`, `productViews`, `contactClicks`, `avgSessionDuration`, `bounceRate`, `change`

### GET /timeseries
Zaman serisi verisi
- Query: `from`, `to`, `granularity` (day|hour), `restaurantId?`
- Response: `[{ date, totalVisits, qrScans, menuViews, productViews }]`

### GET /restaurants
Restoran performans tablosu
- Query: `from`, `to`, `page`, `limit`, `sort`, `order`, `device?`, `source?`
- Response: `{ restaurants: [...], total: number }`

### GET /top-products
En popüler ürünler
- Query: `from`, `to`, `limit`, `restaurantId?`
- Response: `[{ productId, productName, categoryName, restaurantName, viewCount }]`

### GET /device-breakdown
Cihaz dağılımı
- Query: `from`, `to`, `restaurantId?`
- Response: `{ mobile, desktop, tablet }`

### GET /hourly
Saatlik aktivite
- Query: `from`, `to`, `restaurantId?`
- Response: `[{ hour, count }]`

### GET /export
CSV export
- Query: `from`, `to`, `restaurantId?`, `device?`, `source?`
- Response: CSV dosyası

## 🎨 FRONTEND ROUTES

### /admin/analytics
- Global dashboard
- KPI kartları
- Restoran performans tablosu
- Zaman serisi grafiği (placeholder)
- Cihaz dağılımı
- CSV export

### /admin/analytics/restaurant/[restaurantId]
- Restoran detay analizi
- Restoran özelinde KPI'lar
- "Restoranı Yönet" butonu
- Geri dönüş linki

## 🔐 GÜVENLİK

- Tüm analytics endpointleri `authenticate` + `authorize('SUPER_ADMIN')` ile korunur
- Frontend'de `useAuthStore` ile role kontrolü
- Unauthorized kullanıcılar `/unauthorized`'a yönlendirilir

## 📝 NOTLAR

- Migration dosyası: `backend/prisma/migrations/20260103_add_analytics_events/migration.sql`
- Mevcut `Analytics`, `MenuView`, `ProductView` modelleri korundu (backward compatible)
- `AnalyticsEvent` modeli yeni event tracking için kullanılır
- Sidebar'da "Analitik" linki zaten mevcuttu, aktif hale getirildi
- CSV export browser'dan indirir

## 🧪 TEST

```bash
# Backend typecheck
cd backend
npm run typecheck

# Backend build
npm run build

# Frontend build (local)
cd frontend
npm run build
```

## ⚠️ ÖNEMLİ

1. **Migration çalıştırılmadan önce veritabanı yedeği alın!**
2. Production'da migration çalıştırmak için: `npx prisma migrate deploy`
3. Event tracking henüz public menu'den gönderilmiyor (bu özellik ayrıca eklenecek)
4. Grafik kütüphanesi (Recharts) henüz eklenmedi, placeholder gösterilir

## 📊 SONRAKİ ADIMLAR

1. ✅ Backend ve model hazır
2. ✅ Frontend dashboard hazır
3. ⏳ Public menüden event tracking entegrasyonu (MENU_VIEW, PRODUCT_VIEW, QR_SCAN, CONTACT_CLICK)
4. ⏳ Grafik kütüphanesi entegrasyonu (Recharts)
5. ⏳ Gerçek zamanlı analytics (WebSocket - opsiyonel)

---

**Oluşturulma:** 3 Ocak 2026
**Durum:** ✅ Production-ready (Migration gerekli)
