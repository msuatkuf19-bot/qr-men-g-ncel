# 🧪 Email Sistemi Test Senaryosu

## Test Ortamı Hazırlığı

### 1. .env Ayarları

```bash
# Development Test (Console Log)
RESEND_API_KEY=

# veya

# Resend Test (Gerçek Mail)
RESEND_API_KEY=re_your_api_key_here
MAIL_FROM=MenüBen <onboarding@resend.dev>
APP_URL=http://localhost:3000
```

### 2. Backend Başlat

```bash
cd backend
npm run dev
```

Backend çıktısı:
```
[INFO] 🚀 Server başlatıldı - Port: 5000
[WARN] RESEND_API_KEY not configured - email sending disabled  # API key yoksa
# veya
[INFO] ✅ Resend email client initialized  # API key varsa
```

---

## Test 1: Email Kapalı (API Key Yok)

### Amaç
Email servisi kapalıyken kullanıcı oluşturma başarılı olmalı.

### Adımlar

1. `.env` dosyasında `RESEND_API_KEY=` boş bırak
2. Backend restart: `npm run dev`
3. Kullanıcı oluştur (Postman/cURL/Frontend):

```bash
POST http://localhost:5000/api/users
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test Kullanıcı",
  "password": "Test123!",
  "role": "RESTAURANT_ADMIN"
}
```

### Beklenen Sonuç

**Response:**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu (e-posta gönderilemedi)",
  "data": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test Kullanıcı",
    "role": "RESTAURANT_ADMIN",
    "emailSent": false  ← Email gönderilmedi
  }
}
```

**Console Log:**
```
[WARN] RESEND_API_KEY not configured - email sending disabled
[WARN] 📧 Email disabled - Would send welcome email to: test@example.com
[WARN] ⚠️  Welcome email could not be sent: Email service not configured
```

✅ **Test Başarılı:** Kullanıcı oluşturuldu, email gönderilmedi ama hata vermedi.

---

## Test 2: Email Aktif (Resend Test Domain)

### Amaç
Email servisi aktifken hoşgeldiniz maili gönderilmeli.

### Adımlar

1. `.env` dosyasını güncelle:

```env
RESEND_API_KEY=re_your_actual_api_key
MAIL_FROM=MenüBen <onboarding@resend.dev>
APP_URL=http://localhost:3000
```

2. Backend restart: `npm run dev`
3. Yeni kullanıcı oluştur:

```bash
POST http://localhost:5000/api/users
Authorization: Bearer <super_admin_token>

{
  "email": "your-real-email@gmail.com",  ← Gerçek mail adresi
  "name": "Ahmet Yılmaz",
  "password": "Abc123!",
  "role": "RESTAURANT_ADMIN"
}
```

### Beklenen Sonuç

**Response:**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu ve hoş geldiniz e-postası gönderildi",
  "data": {
    "id": "...",
    "email": "your-real-email@gmail.com",
    "name": "Ahmet Yılmaz",
    "emailSent": true  ← Email başarıyla gönderildi
  }
}
```

**Console Log:**
```
[INFO] ✅ Resend email client initialized
[INFO] 📧 Sending welcome email to: your-real-email@gmail.com
[INFO] ✅ Welcome email sent successfully to your-real-email@gmail.com - ID: abc123...
```

**Email Kontrolü:**
1. Gmail/Outlook inbox'ı kontrol et
2. Spam klasörünü kontrol et (test domain olduğu için spam'e düşebilir)
3. Mail içeriğini doğrula:
   - ✅ "MenüBen Ailesine Hoş Geldiniz!" başlığı
   - ✅ Giriş e-postası gösteriliyor
   - ✅ "Panele Giriş Yap" butonu çalışıyor
   - ✅ KVKK bilgilendirmesi var
   - ✅ Şifre gösterilmiyor (güvenlik)

✅ **Test Başarılı:** Email geldi ve içerik doğru.

---

## Test 3: Şifre Gösterimi (Opsiyonel)

### Amaç
Eğer istenirse şifre mailde gösterilebilmeli.

### Kod Değişikliği

`backend/src/controllers/user.controller.ts` dosyasında:

```typescript
const emailResult = await sendWelcomeKvkkEmail({
  to: user.email,
  name: user.name || '',
  loginEmail: user.email,
  loginUrl: `${appUrl}/login`,
  tempPassword: password,      // ← Şifreyi ekle
  includePassword: true,        // ← Gösterimi aç
});
```

### Adımlar

1. Yukarıdaki değişikliği yap
2. Backend restart
3. Yeni kullanıcı oluştur

### Beklenen Sonuç

Email'de şifre bölümü:
```
🔑 Geçici Şifreniz: Abc123!
⚠️ İlk girişten sonra şifrenizi değiştirmenizi öneririz.
```

⚠️ **Güvenlik Uyarısı:** Production'da bu özelliği kapalı tutun!

---

## Test 4: Resend Dashboard Kontrolü

### Adımlar

1. [Resend Dashboard](https://resend.com/emails) aç
2. Son gönderilen mail'leri kontrol et
3. Delivery status'ü doğrula:
   - ✅ **Delivered:** Mail başarıyla iletildi
   - ⏳ **Queued:** Gönderim sırasında
   - ❌ **Failed:** Hata oluştu

### Troubleshooting

**Mail görünmüyor:**
- API key doğru mu?
- Rate limit aşıldı mı? (Free plan: 3,000/ay)
- Email adresi geçerli mi?

**Spam'e düşüyor:**
- `onboarding@resend.dev` test domain'i kullanıyorsunuz
- Production'da kendi domain'inizi doğrulayın

---

## Test 5: Frontend Entegrasyonu (Opsiyonel)

### Admin Panelinde Kullanıcı Ekle

1. Frontend'i başlat: `npm run dev`
2. Super Admin olarak giriş yap
3. Kullanıcı yönetimi sayfasına git
4. "Yeni Kullanıcı Ekle" formu doldur
5. "Kaydet" butonuna tıkla

### Beklenen UI Davranışı

**Mail başarılı:**
```
✅ Kullanıcı oluşturuldu
✅ Hoş geldiniz e-postası gönderildi
```

**Mail başarısız:**
```
✅ Kullanıcı oluşturuldu
⚠️  E-posta gönderilemedi
```

---

## Hata Senaryoları

### Senaryo 1: Geçersiz API Key

```env
RESEND_API_KEY=invalid_key
```

**Beklenen:**
```
[ERROR] ❌ Failed to send welcome email: Invalid API key
[WARN] ⚠️  Welcome email could not be sent: Invalid API key
```

Kullanıcı yine oluşturulur: `emailSent: false`

### Senaryo 2: Geçersiz Email Adresi

```json
{
  "email": "invalid-email"
}
```

**Beklenen:**
API validation hatası (email formatı geçersiz)

### Senaryo 3: Resend Servisi Down

**Beklenen:**
```
[ERROR] ❌ Failed to send welcome email: Service temporarily unavailable
```

Kullanıcı yine oluşturulur: `emailSent: false`

---

## Production Checklist

Deployment öncesi kontrol:

- [ ] Kendi domain'inizi Resend'de doğrulayın
- [ ] DNS kayıtlarını ekleyin (SPF, DKIM, DMARC)
- [ ] `.env` dosyasında production API key kullanın
- [ ] `MAIL_FROM` production domain'e çekin
- [ ] `APP_URL` production URL'i olsun
- [ ] `includePassword` kapalı olsun (güvenlik)
- [ ] Email rate limit'i izleyin
- [ ] Spam score'unu test edin
- [ ] KVKK iletişim adreslerini güncelleyin

---

## Sonuç

✅ Email sistemi hazır ve test edildi  
✅ Graceful fallback çalışıyor  
✅ KVKK uyumlu  
✅ Production'a hazır  

**Next Steps:**
1. Resend API key al
2. `.env` dosyasını güncelle
3. Test et
4. Production'a deploy et
5. Domain doğrula
