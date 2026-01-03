# 🍽️ Restoran Menü Yönetim & QR Kod Erişim Sistemi

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-blue.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Modern, multi-tenant restoran menü yönetim sistemi**

Restoranların menülerini dijital ortamda kolayca yönetmesini ve müşterilerin QR kod okutarak doğrudan ilgili restorana ait menüye ulaşmasını sağlayan tam kapsamlı web uygulaması.

[Demo](https://qr-menu-demo.railway.app) • [Dokümantasyon](https://docs.qrmenu.com) • [API Referansı](#-api-dokümantasyonu)

</div>

---

## 📋 İçindekiler

- [✨ Özellikler](#-özellikler)
- [🛠️ Teknoloji Stack](#️-teknoloji-stack)
- [📁 Proje Yapısı](#-proje-yapısı)
- [🚀 Hızlı Başlangıç](#-hızlı-başlangıç)
- [📦 Kurulum](#-kurulum)
- [🔧 Konfigürasyon](#-konfigürasyon)
- [📚 API Dokümantasyonu](#-api-dokümantasyonu)
- [🎨 Frontend Özellikleri](#-frontend-özellikleri)
- [🐳 Docker ile Çalıştırma](#-docker-ile-çalıştırma)
- [🚀 Deployment](#-deployment)
- [🧪 Test](#-test)
- [📊 Performans](#-performans)
- [🔒 Güvenlik](#-güvenlik)
- [📱 Mobile & PWA](#-mobile--pwa)
- [🛠️ Geliştirme Araçları](#️-geliştirme-araçları)
- [🔧 Troubleshooting](#-troubleshooting)
- [📈 Roadmap](#-roadmap)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📜 Lisans](#-lisans)

## ✨ Özellikler

### 🎯 Ana Özellikler

- **Multi-Tenant Mimari**: Her restoran kendi bağımsız veri alanına sahip
- **QR Kod Entegrasyonu**: Otomatik QR kod üretimi ve okutma sistemi
- **Gerçek Zamanlı Güncelleme**: Anlık menü değişiklikleri
- **Responsive Design**: Mobil ve masaüstü uyumlu arayüz
- **Rol Bazlı Erişim**: Süper Admin, Restoran Admin, Müşteri rolleri
- **Analitik Dashboard**: Görüntüleme istatistikleri ve raporlar
- **Görsel Yönetimi**: Cloudinary entegrasyonu ile görsel optimizasyonu
- **Çoklu Dil Desteği**: İngilizce ve Türkçe dil seçenekleri

### 👑 Süper Admin Özellikleri
- ✅ Tüm restoranları görüntüleme ve yönetme
- ✅ Restoran ekleme/düzenleme/silme
- ✅ Kullanıcı oluşturma ve yetki verme
- ✅ Platform geneli raporlar ve istatistikler
- ✅ Sistem geneli ayarlar ve konfigürasyon
- ✅ Advanced analytics ve dashboard
- ✅ Bulk işlemler ve veri export/import

### 🏪 Restoran Admin Özellikleri
- ✅ Kendi restoranına özel admin paneli
- ✅ Menü kategorileri ve ürünleri yönetimi (CRUD)
- ✅ Ürün görselleri, fiyatlar ve açıklamalar güncelleme
- ✅ QR kod oluşturma, özelleştirme ve indirme
- ✅ Müşteri görüntüleme raporları ve analytics
- ✅ Restoran bilgileri ve ayarlar yönetimi
- ✅ Kategori sıralaması ve görünürlük kontrolü

### 👥 Müşteri Özellikleri
- ✅ QR kod ile direkt menü erişimi
- ✅ Mobil responsive menü görüntüleme
- ✅ Kategorilere göre ürün filtreleme
- ✅ Ürün detayları (fiyat, açıklama, görsel)
- ✅ Arama ve favori özellikleri
- ✅ Türkçe/İngilizce dil seçenekleri
- ✅ Smooth scroll ve animasyonlar

## 🛠️ Teknoloji Stack

### Backend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Node.js | 20.x | JavaScript runtime |
| Express.js | ^4.18.2 | Web framework |
| TypeScript | ^5.3.3 | Type safety |
| PostgreSQL | 15+ | Ana veritabanı |
| Prisma | ^5.22.0 | ORM ve database toolkit |
| JWT | ^9.0.2 | Authentication |
| bcryptjs | ^2.4.3 | Şifre hashleme |
| Multer | ^1.4.5 | File upload |
| Sharp | ^0.33.1 | Image processing |
| QRCode | ^1.5.3 | QR kod üretimi |
| CORS | ^2.8.5 | Cross-origin resource sharing |
| Rate Limit | ^7.1.0 | API rate limiting |

### Frontend
| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| Next.js | 14.0.4 | React framework |
| React | ^18.2.0 | UI library |
| TypeScript | ^5.3.3 | Type safety |
| Tailwind CSS | ^3.3.6 | CSS framework |
| React Query | ^5.14.2 | Server state management |
| Zustand | ^4.4.7 | Client state management |
| Axios | ^1.6.2 | HTTP client |
| React Hook Form | ^7.49.2 | Form management |
| Zod | ^3.22.4 | Schema validation |
| Framer Motion | ^12.23.25 | Animations |
| Lucide React | ^0.303.0 | Icons |
| React Hot Toast | ^2.6.0 | Notifications |
| React QR Code | ^2.0.12 | QR kod gösterimi |
| Recharts | ^2.10.3 | Charts ve grafikler |

### DevOps & Tools
- **Docker**: Container platformu
- **Docker Compose**: Multi-container orchestration
- **Railway**: Cloud deployment platform
- **Vercel**: Frontend deployment
- **Neon**: Serverless PostgreSQL
- **Cloudinary**: Görsel yönetimi
- **GitHub Actions**: CI/CD pipeline

## 📁 Proje Yapısı

```
qr-menu-system/
├── 📁 backend/
│   ├── 📁 src/
│   │   ├── 📁 config/         # Database ve JWT konfigürasyonu
│   │   ├── 📁 controllers/    # API endpoint controllers
│   │   ├── 📁 middleware/     # Auth, CORS, rate limiting
│   │   ├── 📁 routes/         # Express routes
│   │   ├── 📁 services/       # Business logic
│   │   ├── 📁 utils/          # Yardımcı fonksiyonlar
│   │   └── 📄 server.ts       # Ana server dosyası
│   ├── 📁 prisma/
│   │   ├── 📁 migrations/     # Database migrations
│   │   ├── 📄 schema.prisma   # Database schema
│   │   └── 📄 seed.ts         # Demo data seeder
│   ├── 📁 uploads/            # Yüklenen dosyalar
│   ├── 📄 Dockerfile          # Docker konfigürasyonu
│   └── 📄 package.json
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 app/            # Next.js 14 App Router
│   │   │   ├── 📁 admin/      # Admin paneli sayfaları
│   │   │   ├── 📁 auth/       # Authentication sayfaları
│   │   │   ├── 📁 menu/       # Müşteri menü sayfaları
│   │   │   └── 📁 api/        # API route handlers
│   │   ├── 📁 components/     # Reusable components
│   │   │   ├── 📁 ui/         # Base UI components
│   │   │   ├── 📁 admin/      # Admin özel components
│   │   │   ├── 📁 customer/   # Müşteri özel components
│   │   │   └── 📁 shared/     # Ortak components
│   │   ├── 📁 hooks/          # Custom React hooks
│   │   ├── 📁 lib/            # Utility libraries
│   │   ├── 📁 stores/         # Zustand stores
│   │   ├── 📁 types/          # TypeScript type definitions
│   │   └── 📁 utils/          # Helper functions
│   ├── 📁 public/             # Static assets
│   ├── 📄 Dockerfile          # Docker konfigürasyonu
│   └── 📄 package.json
├── 📄 docker-compose.yml      # Multi-container setup
├── 📄 package.json            # Root package.json
├── 📄 HIZLI_BASLANGIC.md     # Hızlı başlangıç rehberi
├── 📄 PROJE_DURUMU.md        # Proje durumu ve todo
├── 📄 RAILWAY_DEPLOYMENT.md   # Railway deployment rehberi
└── 📄 README.md               # Bu dosya
```

## 🚀 Hızlı Başlangıç

### Ön Koşullar
```bash
# Node.js kontrol et
node --version  # v20.x.x olmalı

# PostgreSQL kontrol et
psql --version  # 15.x olmalı

# Git kontrol et
git --version
```

### 1. Proje Kurulumu
```bash
# Repository'yi klonla
git clone https://github.com/your-username/qr-menu-system.git
cd qr-menu-system

# Tüm dependencies'leri yükle
npm install
```

### 2. Environment Konfigürasyonu

**Backend .env dosyası oluştur:**
```bash
cp backend/.env.example backend/.env
```

```env
# Database
DATABASE_URL="postgresql://qrmenu:qrmenu123@localhost:5432/qr_menu_db"
DIRECT_URL="postgresql://qrmenu:qrmenu123@localhost:5432/qr_menu_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5000000
UPLOAD_DIR=uploads

# Cloudinary (opsiyonel)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

**Frontend .env.local dosyası oluştur:**
```bash
cp frontend/.env.local.example frontend/.env.local
```

```env
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# App Settings
NEXT_PUBLIC_APP_NAME="QR Menü Sistemi"
NEXT_PUBLIC_DEFAULT_LANGUAGE=tr
```

### 3. Veritabanı Kurulumu
```bash
# PostgreSQL database oluştur
createdb qr_menu_db

# Prisma migrations çalıştır
cd backend
npm run prisma:migrate
npm run prisma:generate

# Demo data yükle
npm run prisma:seed
cd ..
```

### 4. Development Server Başlat
```bash
# Hem backend hem frontend'i aynı anda başlat
npm run dev

# Alternatif olarak ayrı ayrı:
# npm run dev:backend  # http://localhost:5000
# npm run dev:frontend # http://localhost:3000
```

### 5. Demo Hesapları

**Süper Admin:**
```
Email: admin@qrmenu.com
Şifre: admin123
URL: http://localhost:3000/admin
```

**Restoran Admin:**
```
Email: restaurant1@example.com  
Şifre: password123
URL: http://localhost:3000/admin
```

**Test Menüsü:**
```
URL: http://localhost:3000/menu/restaurant-1
```

## 📦 Kurulum Seçenekleri

### Otomatik Kurulum (Windows)
```powershell
# PowerShell scripti ile otomatik kurulum
.\setup.ps1
```

### Manuel Kurulum
```bash
# 1. Dependencies
npm install

# 2. Backend setup
cd backend
npm install
npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed

# 3. Frontend setup  
cd ../frontend
npm install
npm run build

# 4. Start servers
cd ..
npm run dev
```

## 🔧 Konfigürasyon

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key-at-least-32-chars"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# File Upload Settings
MAX_FILE_SIZE=5000000
ALLOWED_FILE_TYPES="jpg,jpeg,png,gif,webp"
UPLOAD_DIR="uploads"

# Cloudinary Settings (Opsiyonel)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email Settings (Gelecek için)
SMTP_HOST=""
SMTP_PORT=587
SMTP_USER=""
SMTP_PASS=""
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_API_TIMEOUT=10000

# App Configuration
NEXT_PUBLIC_APP_NAME="QR Menü Sistemi"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_DEFAULT_LANGUAGE="tr"

# Features Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_DEBUG_MODE=false

# External Services
NEXT_PUBLIC_GOOGLE_ANALYTICS=""
NEXT_PUBLIC_SENTRY_DSN=""
```

### Veritabanı Şeması

```sql
-- Ana tablolar
Users           # Kullanıcılar (Admin, Restaurant Admin)
Restaurants     # Restoranlar
Categories      # Menü kategorileri
Products        # Ürünler
QrCodes         # QR kodları
Analytics       # Görüntüleme istatistikleri
Images          # Görsel yönetimi
Settings        # Sistem ayarları
```

## 📚 API Dokümantasyonu

### Authentication Endpoints

#### POST /api/auth/register
Yeni kullanıcı kaydı
```json
{
  "name": "Restaurant Owner",
  "email": "owner@restaurant.com", 
  "password": "password123",
  "role": "RESTAURANT_ADMIN"
}
```

#### POST /api/auth/login  
Kullanıcı girişi
```json
{
  "email": "admin@qrmenu.com",
  "password": "admin123"
}
```

#### GET /api/auth/profile
Kullanıcı profil bilgileri (Auth gerekli)

### Restaurant Management (Süper Admin)

#### GET /api/restaurants
Tüm restoranları listele
```bash
# Headers: Authorization: Bearer <token>
# Response: Restaurant[] with pagination
```

#### POST /api/restaurants
Yeni restoran oluştur
```json
{
  "name": "Delicious Restaurant",
  "description": "Amazing food experience",
  "address": "123 Main St, City",
  "phone": "+90 555 123 4567",
  "email": "info@restaurant.com",
  "website": "https://restaurant.com",
  "logo": "base64_image_or_url"
}
```

### Menu Management (Restaurant Admin)

#### GET /api/menu/categories?restaurantId=uuid
Kategorileri listele

#### POST /api/menu/categories
Yeni kategori oluştur
```json
{
  "name": "Ana Yemekler",
  "description": "Nefis ana yemek seçenekleri",
  "image": "category-image.jpg",
  "order": 1,
  "isActive": true
}
```

#### POST /api/menu/products
Yeni ürün oluştur
```json
{
  "name": "Izgara Köfte",
  "description": "Özel baharatlarla marine edilmiş köfte",
  "price": 45.00,
  "image": "product-image.jpg",
  "categoryId": "category-uuid",
  "isActive": true,
  "ingredients": ["Dana eti", "Soğan", "Baharatlar"],
  "allergens": ["Süt"],
  "nutritionInfo": {
    "calories": 350,
    "protein": 25,
    "carbs": 10,
    "fat": 20
  }
}
```

### QR Code Management

#### GET /api/qr/:restaurantId
Restoran için QR kod oluştur/getir

#### GET /api/qr/scan/:code
QR kod tarama ve menu redirect

#### POST /api/qr/generate
Özel QR kod parametreleri ile oluştur
```json
{
  "restaurantId": "uuid",
  "customization": {
    "size": 300,
    "margin": 4,
    "darkColor": "#000000",
    "lightColor": "#FFFFFF",
    "logo": "restaurant-logo.png"
  }
}
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
Dashboard için genel istatistikler

#### GET /api/analytics/views
Görüntüleme istatistikleri
```bash
# Query params: startDate, endDate, restaurantId, productId
# Response: View counts, trends, popular items
```

## 🎨 Frontend Özellikleri

### Component Yapısı

```typescript
// Reusable UI Components
components/
├── ui/
│   ├── Button.tsx          # Base button component
│   ├── Input.tsx           # Form input component  
│   ├── Modal.tsx           # Modal wrapper
│   ├── Table.tsx           # Data table component
│   ├── Card.tsx            # Card layout component
│   └── LoadingSpinner.tsx  # Loading indicator
├── admin/
│   ├── Dashboard/          # Admin dashboard components
│   ├── RestaurantForm/     # Restaurant CRUD forms
│   ├── MenuManager/        # Menu management interface
│   └── Analytics/          # Analytics charts
├── customer/
│   ├── MenuView/           # Customer menu display
│   ├── ProductCard/        # Product display card
│   ├── CategoryFilter/     # Category filtering
│   └── SearchBar/          # Product search
└── shared/
    ├── Header/             # App header/navigation
    ├── Footer/             # App footer
    ├── Sidebar/            # Admin sidebar
    └── AuthGuard/          # Route protection
```

### State Management (Zustand)

```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  token: string | null;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// stores/menuStore.ts  
interface MenuStore {
  categories: Category[];
  products: Product[];
  selectedCategory: string | null;
  searchQuery: string;
  filters: MenuFilters;
  fetchMenu: (restaurantId: string) => Promise<void>;
  setCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
}

// stores/adminStore.ts
interface AdminStore {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  analytics: AnalyticsData;
  fetchRestaurants: () => Promise<void>;
  createRestaurant: (data: RestaurantData) => Promise<void>;
  updateRestaurant: (id: string, data: RestaurantData) => Promise<void>;
}
```

### React Query Hooks

```typescript
// hooks/useMenu.ts
export const useMenu = (restaurantId: string) => {
  return useQuery({
    queryKey: ['menu', restaurantId],
    queryFn: () => menuApi.getMenu(restaurantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// hooks/useAnalytics.ts
export const useAnalytics = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: () => analyticsApi.getAnalytics(dateRange),
    refetchInterval: 30 * 1000, // 30 seconds
  });
};
```

### Form Validation (Zod)

```typescript
// lib/validations/restaurant.ts
export const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant adı en az 2 karakter olmalı'),
  email: z.string().email('Geçerli email adresi girin'),
  phone: z.string().regex(/^\+90\s\d{3}\s\d{3}\s\d{4}$/, 'Geçerli telefon numarası girin'),
  address: z.string().min(10, 'Adres en az 10 karakter olmalı'),
  description: z.string().optional(),
});

// lib/validations/product.ts
export const productSchema = z.object({
  name: z.string().min(2, 'Ürün adı en az 2 karakter olmalı'),
  price: z.number().min(0, 'Fiyat 0 dan büyük olmalı'),
  categoryId: z.string().uuid('Geçerli kategori seçin'),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
});
```

## 🐳 Docker ile Çalıştırma

### Development Ortamı

```bash
# Tüm servisleri başlat (PostgreSQL, Backend, Frontend)
docker-compose up -d

# Logları izle
docker-compose logs -f

# Servisleri durdur  
docker-compose down

# Verileri temizle
docker-compose down -v
```

### Production Build

```bash
# Production image'larını build et
docker-compose -f docker-compose.prod.yml build

# Production ortamını başlat
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Compose Konfigürasyonu

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: qr_menu_db
      POSTGRES_USER: qrmenu  
      POSTGRES_PASSWORD: qrmenu123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://qrmenu:qrmenu123@postgres:5432/qr_menu_db
      JWT_SECRET: your-secret-key
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:  
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:5000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 🚀 Deployment

### Railway Deployment

Railway modern, geliştiriciler için optimize edilmiş cloud platformudur.

```bash
# Railway CLI kurulumu
npm install -g @railway/cli

# Railway'e login
railway login

# Proje oluştur ve deploy et
railway init
railway up
```

**Detaylı Railway Rehberi:** [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

### Vercel Deployment (Frontend)

```bash
# Vercel CLI kurulumu  
npm install -g vercel

# Frontend'i deploy et
cd frontend
vercel --prod
```

### Neon Database (PostgreSQL)

Serverless PostgreSQL çözümü

1. [Neon.tech](https://neon.tech) hesabı oluştur
2. Yeni database oluştur
3. Connection string'i kopyala
4. Environment variables'larda güncelle

**Detaylı Neon Rehberi:** [NEON_DEPLOYMENT_GUIDE.md](NEON_DEPLOYMENT_GUIDE.md)

### Production Environment Variables

```env
# Backend Production
DATABASE_URL="postgresql://user:pass@neon-host/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@neon-host/db?sslmode=require"
JWT_SECRET="production-jwt-secret-key"
NODE_ENV="production"
CORS_ORIGIN="https://your-frontend-domain.com"

# Frontend Production  
NEXT_PUBLIC_API_URL="https://your-backend-domain.railway.app"
```

## 🧪 Test

### Backend Testleri

```bash
# Unit testleri çalıştır
cd backend  
npm test

# API testleri
npm run test:api

# Database testleri
npm run test:db

# Test coverage raporu
npm run test:coverage
```

### Frontend Testleri

```bash
# Component testleri
cd frontend
npm test

# E2E testleri (Cypress)
npm run test:e2e

# Accessibility testleri
npm run test:a11y
```

### Test Dosya Yapısı

```
backend/
├── tests/
│   ├── unit/           # Unit testler
│   │   ├── services/
│   │   ├── controllers/  
│   │   └── utils/
│   ├── integration/    # Integration testler
│   │   ├── auth.test.ts
│   │   ├── restaurants.test.ts
│   │   └── menu.test.ts
│   └── fixtures/       # Test data
│       ├── users.json
│       └── restaurants.json

frontend/
├── __tests__/          # Jest testleri
│   ├── components/
│   ├── pages/
│   └── utils/
├── cypress/            # E2E testleri
│   ├── e2e/
│   ├── fixtures/
│   └── support/
```

### API Test Örnekleri

```bash
# Manual API testleri için
# Backend test scripti çalıştır
./test-backend.ps1

# Veya curl ile test et
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@qrmenu.com","password":"admin123"}'
```

## 📊 Performans

### Backend Performans

- **Response Time**: < 200ms (ortalama)
- **Database Queries**: Prisma ORM optimizasyonu
- **File Upload**: Sharp ile image compression
- **Rate Limiting**: 100 request/minute per IP
- **Caching**: Redis (gelecek sürümde)

### Frontend Performans

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s  
- **Time to Interactive**: < 3s
- **Bundle Size**: < 500KB (gzipped)

### Optimizasyon Teknikleri

```typescript
// Image optimization
import Image from 'next/image'

<Image
  src="/menu-item.jpg"
  alt="Menu Item"
  width={300}
  height={200}
  placeholder="blur"
  priority={false}
/>

// Code splitting
const AdminPanel = dynamic(() => import('./AdminPanel'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

// Data prefetching
export async function generateStaticParams() {
  const restaurants = await getRestaurants();
  return restaurants.map(r => ({ id: r.id }));
}
```

### Database Optimizasyon

```sql
-- Index'ler (Prisma schema'da)
@@index([restaurantId, isActive])
@@index([categoryId])  
@@index([createdAt])
@@unique([restaurantId, slug])

-- N+1 Problem çözümü
include: {
  categories: {
    include: {
      products: true
    }
  }
}
```

## 🔒 Güvenlik

### Authentication & Authorization

- **JWT Tokens**: Secure, stateless authentication
- **Role-based Access Control**: SUPER_ADMIN, RESTAURANT_ADMIN, USER
- **Password Hashing**: bcrypt (12 rounds)
- **Token Expiry**: 7 days default

### API Güvenliği

- **CORS**: Configured origins
- **Rate Limiting**: DDoS protection
- **Input Validation**: Zod schemas
- **SQL Injection**: Prisma ORM protection
- **XSS Prevention**: Content Security Policy

### File Upload Güvenliği

```typescript
// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File validation middleware
export const validateFile = (req: Request, res: Response, next: NextFunction) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'Dosya yüklenmelidir' });
  
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return res.status(400).json({ error: 'Desteklenmeyen dosya formatı' });
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return res.status(400).json({ error: 'Dosya boyutu çok büyük' });
  }
  
  next();
};
```

## 📱 Mobile & PWA

### Responsive Design

- **Mobile-First**: Tailwind CSS approach
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Touch Friendly**: 44px minimum touch targets
- **Swipe Gestures**: Category navigation

### PWA Özellikleri (Gelecek)

```json
// manifest.json
{
  "name": "QR Menü Sistemi",
  "short_name": "QRMenu",
  "description": "Dijital restoran menü sistemi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🛠️ Geliştirme Araçları

### VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Git Hooks (Husky)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{md,json}": ["prettier --write"]
  }
}
```

### Development Scripts

```powershell
# Windows PowerShell scripts
.\setup.ps1          # İlk kurulum
.\git-push.ps1       # Git push with checks  
.\test-backend.ps1   # API testleri
.\quick-setup.ps1    # Hızlı geliştirme ortamı
```

## 🔧 Troubleshooting

### Sık Karşılaşılan Problemler

#### Database Connection Error
```bash
# Problem: Database connection refused
# Çözüm: PostgreSQL servisini kontrol et
pg_ctl status
pg_ctl start

# Connection string'i kontrol et
echo $DATABASE_URL
```

#### Port Already in Use  
```bash
# Problem: Port 3000 or 5000 already in use
# Çözüm: Portu değiştir veya process'i öldür
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Alternatif portlar kullan
PORT=3001 npm run dev:frontend
PORT=5001 npm run dev:backend
```

#### Prisma Migration Failed
```bash
# Problem: Migration failed
# Çözüm: Database'i reset et
npm run prisma:reset
npm run prisma:migrate
npm run prisma:seed
```

#### Frontend Build Error
```bash
# Problem: Next.js build fails
# Çözüm: Cache'i temizle
rm -rf .next
npm run build
```

### Debug Modları

```typescript
// Backend debug
DEBUG=app:* npm run dev

// Frontend debug  
NEXT_PUBLIC_DEBUG=true npm run dev

// Database queries debug
DEBUG=prisma:query npm run dev:backend
```

### Log Dosyaları

```
logs/
├── app.log          # Genel uygulama logları
├── error.log        # Hata logları  
├── access.log       # API access logları
└── db.log           # Database sorgu logları
```

## 📈 Roadmap

### v1.1 (Q1 2026)
- [ ] Multi-language support (EN, TR, AR)
- [ ] PWA support
- [ ] Offline menu viewing
- [ ] Push notifications
- [ ] Advanced analytics dashboard

### v1.2 (Q2 2026)  
- [ ] Table ordering system
- [ ] Payment integration
- [ ] Customer reviews
- [ ] Loyalty program
- [ ] Email notifications

### v1.3 (Q3 2026)
- [ ] Multi-location restaurants
- [ ] Franchise management
- [ ] Advanced reporting
- [ ] API webhooks
- [ ] Third-party integrations

### v2.0 (Q4 2026)
- [ ] Mobile apps (iOS/Android)
- [ ] AI-powered recommendations
- [ ] Voice ordering
- [ ] AR menu experience
- [ ] Kitchen display system

## 🤝 Katkıda Bulunma

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Create** a Pull Request

### Commit Convention

```bash
# Format: type(scope): description

feat(auth): add password reset functionality
fix(menu): resolve category sorting issue  
docs(api): update authentication endpoints
style(ui): improve button hover states
refactor(db): optimize restaurant queries
test(api): add menu CRUD tests
chore(deps): update dependencies
```

### Code Style

```typescript
// TypeScript/JavaScript
- Use TypeScript for type safety
- Follow ESLint + Prettier configuration
- Use descriptive variable names
- Add JSDoc comments for functions
- Prefer const over let
- Use async/await over Promises

// React/Next.js
- Use functional components with hooks
- Extract custom hooks for complex logic
- Use proper prop types
- Implement error boundaries
- Use Next.js best practices (Image, Link, etc.)

// CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first approach  
- Use semantic HTML elements
- Ensure accessibility (WCAG 2.1)
- Test on multiple devices
```

### Pull Request Guidelines

- ✅ Tests pass
- ✅ Code follows style guide
- ✅ Documentation updated
- ✅ No console.log statements
- ✅ Performance impact considered
- ✅ Accessibility tested
- ✅ Mobile responsive

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

```
MIT License

Copyright (c) 2024 QR Menü Sistemi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 İletişim

- **Email**: info@qrmenu.com
- **GitHub**: [QR Menu System](https://github.com/your-username/qr-menu-system)
- **Website**: [https://qrmenu.com](https://qrmenu.com)
- **Documentation**: [https://docs.qrmenu.com](https://docs.qrmenu.com)

---

<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐**

Made with ❤️ for restaurants and their customers

</div>