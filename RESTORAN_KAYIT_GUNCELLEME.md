# RESTORAN KAYIT EKRANI - GÜNCELLEMELERİ

## 📋 GENEL BAKIŞ

Mevcut basit "Yeni Restoran Ekle" modalı, profesyonel bir "RESTORAN KAYIT EKRANI" haline getirildi. Yeni tasarım modern, okunaklı, iki kolonlu (desktop) ve mobilde tek kolon şeklinde çalışmaktadır.

## ✅ TAMAMLANAN GÖREVLER

### 1. **Database Schema Güncellemeleri** ✓
**Dosya:** `backend/prisma/schema.prisma`

Aşağıdaki yeni alanlar Restaurant modeline eklendi:
- `memberNo` - Üye numarası (unique, 6 haneli)
- `businessType` - İşletme tipi (Restoran, Kafe, Otel, Diğer)
- `city`, `district`, `neighborhood`, `fullAddress` - Detaylı adres bilgileri
- `googleMapsUrl` - Google Maps linki
- `internalNote` - İç not/açıklama (sadece admin görür)

Mevcut alanlar korundu ve genişletildi.

### 2. **Backend API Güncellemeleri** ✓
**Dosya:** `backend/src/controllers/restaurant.controller.ts`

#### `createRestaurant` endpoint güncellendi:
- Tüm yeni alanları destekliyor
- Üye numarası otomatik oluşturma (6 haneli, unique)
- Üye numarası çakışma kontrolü
- Çalışma saatleri JSON validasyonu ve saklaması
- workingHours array veya object formatını JSON string'e dönüştürme
- Adres alanları için backward compatibility

#### `updateRestaurant` endpoint güncellendi:
- Tüm yeni alanları destekliyor
- Opsiyonel alan güncellemeleri
- workingHours JSON formatı desteği

### 3. **Frontend Modal - Profesyonel Tasarım** ✓
**Dosya:** `frontend/src/app/admin/restaurants/page.tsx`

#### Yeni Özellikler:

**Modal Başlık:**
- "Restoran Kayıt Ekranı" (yeni kayıt için)
- "Restoran Düzenle" (güncelleme için)

**İKI ANA BÖLÜM:**

#### 📍 İŞLETME BİLGİLERİ:

1. **İşletme Tipi*** (select)
   - Seçenekler: Restoran, Kafe, Otel, Bar, Diğer
   - Placeholder: "Seçiniz"

2. **Üye Numarası*** (auto-generated)
   - 6 haneli rakamlardan oluşan numara
   - Otomatik oluşturulur, read-only
   - Yeniden oluşturma butonu (🔄)
   - Font: monospace

3. **Restoran Adı*** (text)
   - Min 2, max 80 karakter
   - Otomatik slug önerisi

4. **Slug (URL)*** (text)
   - Türkçe karakter dönüşümü otomatik
   - Canlı doğrulama: sadece [a-z0-9-]
   - API ile slug kullanılabilirlik kontrolü
   - Öneri sistemi (slug kullanımdaysa)
   - Real-time menü linki önizlemesi: `/m/{slug}`

5. **Açıklama** (textarea)
   - Max 500 karakter
   - Karakter sayacı

6. **Telefon*** (tel)
   - Min 10 rakam validasyonu
   - Türkiye formatı önerisi

7. **Email*** (email)
   - Email format kontrolü

8. **Google Maps Linki** (url)
   - URL validasyonu (http/https)

9. **Instagram URL** (url)
10. **Facebook URL** (url)

11. **Çalışma Saatleri*** (component)
    - Mevcut `WorkingHoursEditor` komponenti kullanılıyor
    - 7 gün için açık/kapalı toggle
    - Her gün için açılış ve kapanış saati
    - "Haftaiçi Uygula" kısayolu
    - "Tüm Günler" kısayolu
    - En az 1 gün açık olma validasyonu

12. **Üyelik Başlangıç Tarihi*** (date)
13. **Üyelik Bitiş Tarihi*** (date)
    - Bitiş >= Başlangıç validasyonu
    - Başlangıç default: bugün

14. **Adres Bilgileri***
    - İl (text)
    - İlçe (text)
    - Mahalle/Semt (text)
    - Açık Adres* (textarea) - zorunlu

15. **Not / İç Açıklama** (textarea)
    - Max 1000 karakter
    - "Sadece admin görür" etiketi
    - Karakter sayacı

#### 👤 SAHİP BİLGİLERİ (Sadece Yeni Kayıt):

1. **Sahip Adı*** (text)
   - Min 2, max 80 karakter

2. **Sahip Email*** (email)
   - Email format kontrolü

3. **Sahip Şifresi*** (password)
   - Min 8 karakter
   - En az 1 harf ve 1 rakam zorunlu
   - Göster/Gizle butonu (👁️)
   - **"Şifre Üret"** butonu - güçlü random şifre
   - **"Kopyala"** butonu - şifreyi clipboard'a kopyala
   - Şifre kuralları açıklaması

### 4. **Form Validasyonları** ✓

#### Client-Side Validasyonlar:
- Zorunlu alanlar boş bırakılamaz
- Email format kontrolü
- Telefon numarası min 10 rakam
- Slug format kontrolü (sadece lowercase, rakam, tire)
- URL formatları (http/https)
- Şifre güvenlik kuralları (min 8 kar, 1 harf + 1 rakam)
- Üyelik tarihleri mantık kontrolü
- Çalışma saatleri - en az 1 gün açık
- Karakter limitleri

#### Hata Mesajları (Türkçe):
- "Restoran adı zorunludur"
- "Slug yalnızca küçük harf, rakam ve tire içerebilir"
- "Üyelik bitiş tarihi başlangıçtan önce olamaz"
- "En az bir gün çalışma saati açık olmalıdır"
- "Şifre en az 8 karakter olmalıdır"
- "Şifre en az 1 harf ve 1 rakam içermelidir"
- "Geçerli bir email adresi giriniz"
- vs.

### 5. **UX İyileştirmeleri** ✓

1. **Loading States:**
   - Form submit sırasında buton disabled
   - Spinner animasyonu
   - "İşleniyor..." text

2. **Slug Preview:**
   - Menü linki önizlemesi: `/m/{slug}`
   - Real-time slug kontrol durumu:
     - "Kontrol ediliyor..." (loading)
     - "✓ Slug uygun" (yeşil)
     - "✗ Slug kullanımda" (kırmızı) + öneri

3. **Form Close Confirmation:**
   - Kaydedilmemiş değişiklikler varsa uyarı
   - "Çıkmak istediğinizden emin misiniz?"

4. **Responsive Design:**
   - Desktop: 2 kolon grid
   - Mobile: Tek kolon, full width
   - Tablet: Adaptive layout

5. **Visual Hierarchy:**
   - İki ana bölüm border ve background ile ayrılmış
   - İşletme Bilgileri: Gri arka plan
   - Sahip Bilgileri: Mavi tonlu arka plan
   - İkonlar: Store ve User ikonları

6. **Accessibility:**
   - Zorunlu alanlar * ile işaretli
   - Label + input ilişkisi
   - Focus ring'ler
   - Placeholder metinler
   - Helper text'ler

## 📊 VERİ AKIŞI

### Form Submit Payload:
```typescript
{
  businessType: string,
  memberNo: string,
  name: string,
  slug: string,
  description: string,
  city: string,
  district: string,
  neighborhood: string,
  fullAddress: string,
  phone: string,
  email: string,
  googleMapsUrl: string,
  workingHours: string, // JSON string
  instagramUrl: string,
  facebookUrl: string,
  membershipStartDate: string,
  membershipEndDate: string,
  internalNote: string,
  ownerName: string,
  ownerEmail: string,
  ownerPassword: string
}
```

### Backend Response:
- Başarılı: 201 Created + restaurant object
- Hata: 400/500 + error message
- Toast mesajı: "Restoran başarıyla oluşturuldu!"

## 🗄️ DATABASE MIGRATION

```bash
npx prisma db push --accept-data-loss
```

Yeni alanlar:
- `memberNo` String? @unique
- `businessType` String? @default("Restoran")
- `city` String?
- `district` String?
- `neighborhood` String?
- `fullAddress` String?
- `googleMapsUrl` String?
- `internalNote` String?

Index eklendi:
- @@index([memberNo])

## 🚀 DEPLOYMENT

### Adımlar:

1. **Backend:**
   ```bash
   cd backend
   npx prisma db push --accept-data-loss
   npx prisma generate
   npm run dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test:**
   - http://localhost:3000/admin/restaurants
   - "Yeni Restoran" butonuna tıkla
   - Formu doldur
   - Validasyonları test et
   - Submit et

## 📝 BACKUP

Eski dosya yedeklendi:
- `frontend/src/app/admin/restaurants/page_BACKUP.tsx`

## 🎨 TASARIM ÖZELLİKLERİ

### Renkler:
- Primary: Blue-600
- Success: Green-700
- Error: Red-600
- Background: Gray-50/50
- Border: Gray-200

### Spacing:
- Modal padding: 2rem (desktop), 1.5rem (mobile)
- Section gap: 2rem
- Field gap: 1rem
- Button gap: 0.75rem

### Typography:
- Başlık: 2xl-3xl, bold
- Alt başlık: lg, semibold
- Label: sm, medium
- Input: base
- Helper: xs

### Components:
- Border radius: rounded-xl (12px)
- Shadow: shadow-sm, shadow-2xl
- Transition: all 200ms ease-out

## 🔐 GÜVENLİK

1. **Backend Validasyonları:**
   - Slug unique kontrolü
   - MemberNo unique kontrolü
   - Email format kontrolü
   - Tarih mantık kontrolü
   - Owner oluşturma/güncelleme logic

2. **Şifre Güvenliği:**
   - Min 8 karakter
   - Komplekslik kuralı (harf + rakam)
   - Hash'lenerek saklanıyor
   - Otomatik şifre üretici

3. **API Güvenliği:**
   - SUPER_ADMIN yetki kontrolü
   - Input sanitization
   - SQL injection koruması (Prisma)

## 🐛 KNOWN ISSUES / TODO

- [ ] Telefon numarası için maskeleme eklenebilir
- [ ] Google Maps URL için otomatik iframe preview
- [ ] Logo upload field'ı eklenebilir
- [ ] Batch restoran import özelliği
- [ ] Excel export özelliği

## 📚 KULLANIM

1. Admin paneline giriş yap
2. "Restoranlar" menüsüne git
3. "Yeni Restoran" butonuna tıkla
4. **İşletme Bilgileri** bölümünü doldur:
   - İşletme tipi seç
   - Üye numarası otomatik
   - Restoran adı gir (slug otomatik oluşur)
   - Açıklama ekle (opsiyonel)
   - Telefon ve email gir
   - Sosyal medya linklerini ekle
   - Çalışma saatlerini ayarla
   - Üyelik tarihlerini seç
   - Adres bilgilerini gir
   - İç not ekle (opsiyonel)
5. **Sahip Bilgileri** bölümünü doldur:
   - Sahip adı ve email
   - Şifre gir veya "Şifre Üret" butonunu kullan
6. "Oluştur" butonuna tıkla
7. Başarı mesajını bekle
8. Liste otomatik refresh olur

## 🎯 SONUÇ

✅ Profesyonel, kullanıcı dostu restoran kayıt ekranı tamamlandı
✅ Tüm gereksinimler karşılandı
✅ Validasyonlar ve hata yönetimi eklendi
✅ Responsive tasarım
✅ Backend ve database güncellemeleri yapıldı
✅ Mevcut kod yapısı korundu
✅ Backward compatibility sağlandı

**Sistem hazır ve test edilebilir!** 🚀
