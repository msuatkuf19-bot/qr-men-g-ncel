# Demo Talebi Mail Bildirimi Sistemi

## 📩 Genel Bakış

Demo talebi oluşturulduğunda otomatik olarak admin'e bildirim maili gönderilir. Sistem async çalışır ve kayıt işlemini etkilemez.

## ✨ Özellikler

- ✅ Sadece **YENİ** demo talebi oluşturulduğunda mail gönderilir
- ✅ Mail gönderimi **async** çalışır (kayıt işlemini yavaşlatmaz)
- ✅ Hata durumunda kayıt işlemi **başarısız olmaz** (try-catch korumalı)
- ✅ Admin mail adresi: `menuben.com@gmail.com` (sabit)
- ✅ Mobil uyumlu, profesyonel HTML mail tasarımı
- ✅ SMTP ayarları `.env` üzerinden yapılandırılır
- ✅ Production ve test ortamlarında çalışır

## 📦 Kurulum

### 1. Backend Dependencies

```bash
cd backend
npm install
```

Yeni eklenen paketler:
- `nodemailer`: ^6.9.7
- `@types/nodemailer`: ^6.4.14

### 2. Environment Variables

`.env` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
# E-POSTA BİLDİRİMLERİ (SMTP - Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM="Menuben Demo <noreply@menuben.com>"
```

#### Gmail İçin Özel Notlar:

1. **Uygulama Şifresi Oluşturma** (Gmail hesabı için):
   - Google Hesabı → Güvenlik → 2 Adımlı Doğrulama → Uygulama Şifreleri
   - "Mail" ve "Diğer" seçin, bir isim verin (örn: "Menuben Backend")
   - Oluşturulan 16 haneli şifreyi `MAIL_PASS` değişkenine yazın

2. **SMTP Ayarları**:
   - Host: `smtp.gmail.com`
   - Port: `587` (TLS) veya `465` (SSL)
   - Secure: Port 465 için `true`, 587 için `false`

#### Diğer SMTP Sağlayıcıları:

**SendGrid:**
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=your-sendgrid-api-key
```

**Amazon SES:**
```env
MAIL_HOST=email-smtp.eu-central-1.amazonaws.com
MAIL_PORT=587
MAIL_USER=your-ses-smtp-username
MAIL_PASS=your-ses-smtp-password
```

**Mailgun:**
```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USER=your-mailgun-username
MAIL_PASS=your-mailgun-password
```

## 🏗️ Yapı

### Dosya Ağacı

```
backend/src/lib/email/
├── mailer.ts                          # Nodemailer transporter (SMTP bağlantısı)
├── sendDemoRequestNotification.ts      # Mail gönderim servisi
└── templates/
    └── demoRequestNotification.ts      # HTML/text mail template'i
```

### Çalışma Akışı

1. **Demo Talebi Oluşturma**: Frontend'den demo talebi gönderilir
2. **Database Kayıt**: Backend talebi veritabanına kaydeder
3. **Async Mail**: Kayıt başarılıysa async mail gönderimi tetiklenir
4. **Mail Template**: HTML/text mail hazırlanır
5. **SMTP Gönderim**: Nodemailer ile mail admin'e gönderilir
6. **Error Handling**: Mail başarısız olsa bile kayıt işlemi başarılı döner

## 📧 Mail İçeriği

### Konu
```
📩 Yeni Demo Talebi Alındı
```

### İçerik Bölümleri

1. **Header**: Gradient arkaplan, Menuben logosu
2. **Uyarı Badge**: Yeni talep bildirimi
3. **Restoran Bilgileri**:
   - Restoran Adı
   - Restoran Tipi
   - Masa Sayısı
4. **Yetkili Bilgileri**:
   - Ad Soyad
   - Telefon (tıklanabilir link)
   - E-posta (tıklanabilir link)
5. **Talep Detayları**:
   - Potansiyel Durum (badge)
   - Talep Tarihi (TR formatında)
6. **CTA Button**: "Demo Talebini Gör" (admin paneline yönlendirme)
7. **Footer**: Copyright, otomatik mail bildirimi

### Örnek Görünüm

```
┌─────────────────────────────────────┐
│  📩 Yeni Demo Talebi                │
│  Menuben QR Menü Sistemi            │
├─────────────────────────────────────┤
│  🔔 Hemen İnceleyin: Yeni bir demo  │
│  talebi sisteme kaydedildi...       │
│                                     │
│  🏪 Restoran Bilgileri              │
│  ─────────────────────────────────  │
│  Restoran Adı: Bella Pizza          │
│  Restoran Tipi: Pizzeria            │
│  Masa Sayısı: 15 masa               │
│                                     │
│  👤 Yetkili Bilgileri               │
│  ─────────────────────────────────  │
│  Ad Soyad: Ahmet Yılmaz             │
│  Telefon: +905551234567             │
│  E-posta: info@bellapizza.com       │
│                                     │
│  📊 Talep Detayları                 │
│  ─────────────────────────────────  │
│  Potansiyel Durum: [Beklemede]      │
│  Talep Tarihi: 4 Ocak 2026 15:30    │
│                                     │
│  [🚀 Demo Talebini Gör]             │
├─────────────────────────────────────┤
│  Bu e-posta Menuben QR Menü         │
│  Sistemi tarafından otomatik        │
│  olarak gönderilmiştir.             │
└─────────────────────────────────────┘
```

## 🧪 Test Etme

### Local Test (Dummy SMTP)

Mailhog veya Ethereal kullanarak test edebilirsiniz:

#### Ethereal (Ücretsiz Test SMTP)

```bash
# 1. Ethereal hesabı oluştur (geçici)
# https://ethereal.email/create

# 2. .env dosyasına test credentials'ı ekle
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=your-ethereal-username@ethereal.email
MAIL_PASS=your-ethereal-password
```

#### Mailhog (Docker)

```bash
# Docker ile Mailhog başlat
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# .env ayarları
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USER=test
MAIL_PASS=test

# Web UI: http://localhost:8025
```

### Test Demo Talebi Gönderme

Frontend'den normal akışla demo talebi oluşturun veya API'ye direkt istek atın:

```bash
curl -X POST http://localhost:5000/api/demo-requests \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Kullanıcı",
    "restaurantName": "Test Restaurant",
    "phone": "+905551234567",
    "email": "test@test.com",
    "restaurantType": "Cafe",
    "tableCount": 10
  }'
```

### Log Kontrolleri

Mail gönderimi sırasında backend konsolunda şu logları göreceksiniz:

**Başarılı:**
```
[EMAIL] Checking RESEND_API_KEY: MISSING
✅ Nodemailer transporter initialized successfully
✅ Demo request notification sent to menuben.com@gmail.com for restaurant: Test Restaurant
```

**SMTP Ayarları Eksik:**
```
⚠️  SMTP credentials not configured - mail notifications disabled
📧 Mail notification skipped - SMTP not configured
```

**Hata:**
```
❌ Failed to send demo request notification: Error: ...
[MAIL ERROR] Error details...
```

## 🔒 Güvenlik

- ✅ Mail credentials **asla** kod içine yazılmaz
- ✅ Tüm hassas veriler `.env` dosyasından okunur
- ✅ `.env` dosyası `.gitignore` içinde (commit edilmez)
- ✅ Production'da environment variables Railway/Vercel'den inject edilir
- ✅ Mail gönderim hatası kayıt işlemini etkilemez
- ✅ Try-catch blokları ile error handling

## 🚀 Production Deployment

### Railway

1. Railway Dashboard'a git
2. Variables sekmesine mail ayarlarını ekle:
   ```
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=menuben.com@gmail.com
   MAIL_PASS=your-app-password
   MAIL_FROM="Menuben Demo <noreply@menuben.com>"
   ```
3. Deploy et (otomatik restart olur)

### Vercel (Backend Edge Functions)

```bash
# Vercel CLI ile environment variables ekle
vercel env add MAIL_HOST
vercel env add MAIL_PORT
vercel env add MAIL_USER
vercel env add MAIL_PASS
vercel env add MAIL_FROM
```

## ⚙️ Yapılandırma

### Admin Mail Adresi Değiştirme

[sendDemoRequestNotification.ts](./src/lib/email/sendDemoRequestNotification.ts) dosyasında:

```typescript
const ADMIN_EMAIL = 'menuben.com@gmail.com'; // Burası değiştirilebilir
```

### Admin Panel URL Değiştirme

Aynı dosyada:

```typescript
const ADMIN_PANEL_URL = 'https://www.menuben.com/admin/demo-requests';
```

### Mail Template Özelleştirme

[templates/demoRequestNotification.ts](./src/lib/email/templates/demoRequestNotification.ts) dosyasında HTML/CSS düzenlemeleri yapabilirsiniz.

## 📊 Özelleştirilmiş Durumlar

Mail template'i potansiyel durum labellarını otomatik çevirir:

```typescript
const statusLabels = {
  NONE: 'Seçilmemiş',
  PENDING: 'Beklemede',
  DEMO_CREATED: 'Demo Oluşturuldu',
  HIGH_PROBABILITY: 'Yüksek İhtimal',
  EVALUATING: 'Değerlendiriyor',
  FOLLOW_UP: 'Takip',
  LONG_TERM: 'Uzun Vade',
  NEGATIVE: 'Olumsuz',
};
```

## 🐛 Sorun Giderme

### "Mail notification skipped - SMTP not configured"

**Sebep**: `.env` dosyasında SMTP ayarları eksik veya yanlış

**Çözüm**:
```bash
# .env dosyasını kontrol edin
cat .env | grep MAIL_

# Tüm değişkenler dolu mu?
MAIL_HOST=✓
MAIL_PORT=✓
MAIL_USER=✓
MAIL_PASS=✓
```

### "Invalid login: 535-5.7.8 Username and Password not accepted"

**Sebep**: Gmail şifresi yanlış veya uygulama şifresi kullanılmamış

**Çözüm**:
1. Gmail hesabında 2FA aktif olmalı
2. Uygulama şifresi oluşturup `MAIL_PASS`'e yazın
3. Normal hesap şifresini değil, 16 haneli uygulama şifresini kullanın

### Mail Gönderilmiyor Ama Hata Yok

**Sebep**: Async işlem sessizce fail olabilir

**Çözüm**:
```typescript
// demo-requests.controller.ts içinde catch bloğunu kontrol edin
}).catch(err => {
  console.error('[DEMO REQUEST] Mail notification failed:', err);
});
```

Backend konsolunu kontrol edin, detaylı hata mesajı göreceksiniz.

### Port 587 Blocked (Firewall)

**Sebep**: Bazı hosting sağlayıcıları SMTP portlarını bloklar

**Çözüm**:
- Port 465 (SSL) deneyin: `MAIL_PORT=465`
- Veya SendGrid/Amazon SES gibi API tabanlı servis kullanın

## 📝 Notlar

- Mail gönderimi **opsiyoneldir** - SMTP ayarları yoksa sistem normal çalışmaya devam eder
- Günceleme/edit işlemlerinde mail **gönderilmez** (sadece create)
- Admin paneli URL'i mail içinde dinamik değildir (sabit)
- Mail gönderim süresi genelde 1-3 saniye (async olduğu için kullanıcı etkilenmez)

## 📚 İlgili Dosyalar

- **Controller**: [demo-requests.controller.ts](./src/controllers/demo-requests.controller.ts)
- **Mail Servis**: [sendDemoRequestNotification.ts](./src/lib/email/sendDemoRequestNotification.ts)
- **SMTP Config**: [mailer.ts](./src/lib/email/mailer.ts)
- **Template**: [demoRequestNotification.ts](./src/lib/email/templates/demoRequestNotification.ts)
- **Environment**: [.env.example](./.env.example)

---

**Son Güncelleme**: 4 Ocak 2026
**Versiyon**: 1.0.0
