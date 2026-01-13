# Yeni Restoran Ekleme Modülü - Test Senaryosu

## Kurulum Adımları

### 1. Database Migration
```bash
cd backend
npx prisma db push  # Schema değişiklikleri uygulandı ✓
npx prisma generate # Prisma Client güncellendi ✓
```

### 2. Dependency Kontrol
```bash
# Backend
npm list qrcode nanoid  # Her ikisi de kurulu ✓

# Frontend  
npm list lucide-react   # Kurulu ✓
```

## Test Senaryoları

### Senaryo 1: Yeni Restoran Oluşturma (Happy Path)

**Adımlar:**
1. Super Admin olarak giriş yap
   - URL: http://localhost:3000/login
   - Email: admin@qrmenu.com
   - Şifre: admin123

2. Yeni restoran sayfasına git
   - URL: http://localhost:3000/admin/restaurants/new

3. Formu doldur:
   ```
   İşletme Tipi: Restoran
   Restoran Adı: Test Lokantası
   Slug: (otomatik: test-lokantasi) veya manuel düzenle
   Telefon: 0532 123 4567
   Adres: Test Mahallesi, Test Sokak No:1, İstanbul
   Çalışma Saatleri: 09:00 - 22:00
   Üyelik Başlangıç: bugün
   Üyelik Bitiş: 1 yıl sonra
   Sahip Adı: Ahmet Yılmaz
   Sahip Email: ahmet@testlokantasi.com
   Sahip Şifre: test123456
   ```

4. "Slug Kontrol Et" butonuna tıkla
   - ✓ Beklenen: "Slug kullanılabilir" mesajı

5. "Restoran Oluştur" butonuna tıkla
   - ✓ Beklenen: Success toast
   - ✓ Redirect: /admin/restaurants/{id}

6. Detay sayfasını kontrol et:
   - ✓ Restoran bilgileri görüntüleniyor
   - ✓ 6 haneli üye numarası oluşturulmuş
   - ✓ QR kod görseli var
   - ✓ "QR Kodu İndir" butonu çalışıyor
   - ✓ "Menü Linkini Kopyala" butonu çalışıyor
   - ✓ "Menüyü Görüntüle" butonu yeni sekmede açıyor

### Senaryo 2: Slug Çakışması

**Adımlar:**
1. İkinci bir restoran ekle
2. Aynı adı kullan: "Test Lokantası"
3. Slug otomatik: "test-lokantasi-2" olmalı
4. Veya manuel slug gir ve "Kontrol Et" tıkla
   - Çakışma varsa: "Bu slug zaten kullanımda" uyarısı

### Senaryo 3: QR Kod Tarama

**Adımlar:**
1. QR kodu indir
2. Mobil cihazla tarat veya direkt linki aç:
   - URL: http://localhost:5000/api/qr/scan/{code}
3. ✓ Beklenen: Redirect to /menu/test-lokantasi
4. ✓ Menü sayfası açılmalı
5. Database'de scanCount arttı mı kontrol et

### Senaryo 4: Üyelik Süresi Dolmuş Restoran

**Adımlar:**
1. Database'de bir restoranın membershipEndDate'ini geçmiş tarihe çek
   ```sql
   UPDATE restaurants 
   SET "membershipEndDate" = '2024-01-01',
       "membershipStatus" = 'EXPIRED'
   WHERE slug = 'test-lokantasi';
   ```

2. Menü linkini aç: /menu/test-lokantasi
3. ✓ Beklenen: "Üyelik Süresi Doldu" ekranı
4. ✓ Restoran adı ve bitiş tarihi görüntüleniyor
5. ✓ İletişim bilgileri gösteriliyor

### Senaryo 5: Türkçe Karakter Slug Dönüşümü

**Test Verileri:**
- "Çağlayan Kafe" -> "caglayan-kafe"
- "Şişli Restaurant" -> "sisli-restaurant"
- "Günaydın Lokanta" -> "gunaydin-lokanta"
- "İstanbul'un Lezzeti" -> "istanbulun-lezzeti"

**Kontrol:**
1. Restoran adına Türkçe karakter gir
2. Slug otomatik normalize edilmeli
3. Özel karakterler temizlenmeli

### Senaryo 6: Validation Hataları

**Test Edilecek Durumlar:**

a) Boş alanlar:
   - Restoran adı boş -> Hata: "Restoran adı en az 2 karakter olmalıdır"
   - Telefon boş -> Hata: "Telefon numarası gerekli"
   - Sahip email boş -> Hata: "Email gerekli"
   - Şifre boş -> Hata: "Şifre en az 6 karakter olmalı"

b) Format hataları:
   - Geçersiz email -> Hata: "Geçerli bir email giriniz"
   - Kısa şifre (5 karakter) -> Hata: "Şifre en az 6 karakter"
   - Geçersiz telefon -> Hata: "Geçerli telefon numarası"

c) Tarih hataları:
   - Bitiş tarihi < Başlangıç tarihi -> Hata: "Bitiş tarihi başlangıç tarihinden sonra olmalı"

### Senaryo 7: API Endpoint Testleri

**cURL Testleri:**

```bash
# 1. Check slug availability
curl -X GET "http://localhost:5000/api/admin/restaurants/check-slug?slug=test-lokantasi" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: { available: false, message: "Slug zaten kullanımda" }

# 2. Generate slug from name
curl -X POST "http://localhost:5000/api/admin/restaurants/generate-slug" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Yeni Restoran"}'

# Expected: { name: "Yeni Restoran", slug: "yeni-restoran" }

# 3. Create restaurant
curl -X POST "http://localhost:5000/api/admin/restaurants" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessType": "RESTORAN",
    "name": "API Test Restaurant",
    "phone": "05321234567",
    "fullAddress": "Test Address",
    "membershipStartDate": "2025-01-01",
    "membershipEndDate": "2026-01-01",
    "ownerName": "Test Owner",
    "ownerEmail": "testowner@test.com",
    "ownerPassword": "test123456"
  }'

# Expected: 201 Created with restaurant, qrCode, menuUrl

# 4. QR Scan
curl -X GET "http://localhost:5000/api/qr/scan/QRCODE123"

# Expected: 302 Redirect to /menu/{slug}

# 5. Get menu (expired membership)
curl -X GET "http://localhost:5000/api/public/menu/expired-restaurant"

# Expected: 403 with { error: "MEMBERSHIP_EXPIRED", ... }
```

## Database Kontrolleri

### 1. Restaurant Kaydı
```sql
SELECT 
  id, "memberNo", "businessType", name, slug,
  "membershipStatus", "membershipStartDate", "membershipEndDate",
  "ownerId", "createdAt"
FROM restaurants
WHERE name = 'Test Lokantası';
```

✓ Kontrol:
- memberNo: 6 haneli sayı (örn: "493027")
- businessType: RESTORAN
- membershipStatus: ACTIVE
- slug: unique

### 2. Owner User Kaydı
```sql
SELECT id, email, name, role, "isActive"
FROM users
WHERE email = 'ahmet@testlokantasi.com';
```

✓ Kontrol:
- role: RESTAURANT_ADMIN
- isActive: true

### 3. QR Code Kaydı
```sql
SELECT id, code, "restaurantId", "scanCount", "imageData"
FROM qr_codes
WHERE "restaurantId" = (SELECT id FROM restaurants WHERE slug = 'test-lokantasi');
```

✓ Kontrol:
- code: 10 karakterli unique string
- imageData: "data:image/png;base64,..." ile başlamalı
- scanCount: 0 (ilk oluşturulduğunda)

## Başarı Kriterleri

### Backend
- [x] Restaurant, User, QRCode tek transaction'da oluşturuluyor
- [x] Member number unique ve 6 haneli
- [x] Slug unique ve Türkçe karakterler normalize
- [x] QR kod unique ve base64 PNG formatında
- [x] Membership status doğru hesaplanıyor
- [x] QR scan redirect çalışıyor
- [x] Expired membership kontrolü çalışıyor

### Frontend
- [x] Form validation çalışıyor (Zod)
- [x] Otomatik slug generation çalışıyor
- [x] Slug availability check çalışıyor
- [x] Success/error toast mesajları gösteriliyor
- [x] Detay sayfasında QR kod görüntüleniyor
- [x] QR kod download çalışıyor
- [x] Membership expired UI gösteriliyor

### Kullanıcı Deneyimi
- [x] Form akıcı ve sezgisel
- [x] Validasyon hataları anlaşılır
- [x] Loading states mevcut
- [x] Success feedback net
- [x] Detay sayfası bilgilendirici

## Bilinen Sınırlamalar

1. **QR Kod Storage**: Şu anda base64 olarak DB'de saklanıyor. Production'da Cloudinary vs. kullanılabilir.

2. **Member Number Collision**: 10 denemeden sonra hata veriyor. Production'da retry logic artırılabilir.

3. **Email Gönderimi**: Başarısız olursa restoran oluşturmayı engellemez (non-blocking).

4. **Slug Auto-increment**: Çakışma durumunda "-2, -3" eki ekliyor. Kullanıcı manuel değiştirebilir.

## Troubleshooting

### Problem 1: "Slug zaten kullanılıyor" hatası
**Çözüm:** Slug'ı manuel düzenle veya "Kontrol Et" ile müsaitliği doğrula.

### Problem 2: QR kod görseli görünmüyor
**Çözüm:** 
- Backend log'ları kontrol et
- QRCode package kurulu mu: `npm list qrcode`
- imageData field base64 string mi kontrol et

### Problem 3: Menü sayfası açılmıyor
**Çözüm:**
- Restaurant slug'ı doğru mu?
- isActive = true mi?
- Frontend API_URL doğru mu?

### Problem 4: Membership expired gösterilmiyor
**Çözüm:**
- Backend'de membershipStatus ve endDate kontrol et
- Frontend MembershipExpired component import edilmiş mi?
- API 403 dönüyor mu kontrol et

## Sonraki Adımlar

1. ✅ **Migration tamamlandı** - Schema güncellemeleri applied
2. ✅ **Backend endpoints hazır** - Restaurant CRUD + QR + Public Menu
3. ✅ **Frontend forms hazır** - Create + Detail pages
4. ✅ **Validation hazır** - Zod schemas
5. ✅ **Membership check hazır** - Expired UI

### Yapılabilecek İyileştirmeler:

- [ ] Unit tests (Jest)
- [ ] E2E tests (Cypress)
- [ ] QR kod customize (logo, color)
- [ ] Bulk restaurant import (CSV)
- [ ] Advanced analytics for QR scans
- [ ] Email template customization
- [ ] Multi-language support for forms
- [ ] Restaurant approval workflow
