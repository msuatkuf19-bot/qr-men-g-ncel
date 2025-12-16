# 📧 Email Sistemi - Kurulum ve Kullanım

## 🎯 Özellikler

Yeni kullanıcı oluşturulduğunda otomatik olarak:
- ✅ Hoş geldiniz e-postası gönderilir
- ✅ Giriş bilgileri paylaşılır
- ✅ KVKK bilgilendirmesi yapılır
- ✅ Şifre güvenli şekilde yönetilir (opsiyonel gösterim)

## 🚀 Kurulum

### 1. Resend Hesabı Oluştur

1. [Resend.com](https://resend.com) adresine git
2. Ücretsiz hesap oluştur (ayda 3,000 mail ücretsiz)
3. API Key oluştur: [https://resend.com/api-keys](https://resend.com/api-keys)

### 2. .env Ayarları

```env
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=MenüBen <onboarding@resend.dev>
APP_URL=http://localhost:3000
SUPPORT_EMAIL=destek@menuben.com
KVKK_CONTACT_EMAIL=kvkk@menuben.com
```

**Test için:** `onboarding@resend.dev` kullanabilirsiniz (Resend test domain)

**Production için:** Kendi domain'inizi Resend'de doğrulayın ve kullanın
- Örnek: `MAIL_FROM=MenüBen <hello@yourdomain.com>`

### 3. Paket Yükleme

```bash
npm install resend
```

## 📁 Dosya Yapısı

```
backend/src/
├── lib/
│   └── email/
│       ├── emailClient.ts          # Resend client wrapper
│       ├── sendWelcomeKvkk.ts      # Mail gönderme fonksiyonu
│       └── templates/
│           └── welcomeKvkk.ts      # HTML + text template
├── controllers/
│   └── user.controller.ts          # createUser'da tetikleme
└── utils/
    └── logger.ts                   # Basit logger
```

## 🔧 Kullanım

### Otomatik Gönderim

Yeni kullanıcı oluşturulduğunda otomatik olarak mail gönderilir:

```typescript
// POST /api/users
const user = await prisma.user.create({...});

// Mail otomatik gönderilir
sendWelcomeKvkkEmail({
  to: user.email,
  name: user.name,
  loginEmail: user.email,
  loginUrl: `${APP_URL}/login`,
});
```

### Manuel Gönderim

İhtiyaç halinde manuel olarak:

```typescript
import { sendWelcomeKvkkEmail } from '@/lib/email/sendWelcomeKvkk';

await sendWelcomeKvkkEmail({
  to: 'user@example.com',
  name: 'Ahmet Yılmaz',
  loginEmail: 'user@example.com',
  loginUrl: 'https://yourapp.com/login',
  tempPassword: 'Abc123!', // Opsiyonel
  includePassword: false,   // Varsayılan: false (güvenlik)
});
```

## 🔒 Güvenlik

### Şifre Gösterimi

**Varsayılan:** Şifre mailde gösterilmez (güvenli) ✅

Eğer şifre gösterilmesi isteniyorsa:

```typescript
await sendWelcomeKvkkEmail({
  ...
  tempPassword: 'Abc123!',
  includePassword: true,  // ⚠️  Dikkatli kullan
});
```

**Öneri:** İlk girişte kullanıcıyı şifre değiştirmeye yönlendirin.

## 📧 Mail İçeriği

### HTML Mail Şablonu

- 🎨 Modern ve responsive tasarım
- 📱 Mobil uyumlu
- 🔘 "Panele Giriş Yap" butonu
- 📋 Detaylı KVKK bilgilendirmesi
- 🎯 Giriş bilgileri kutucukta vurgulanır

### Text Mail Şablonu

HTML desteklemeyen mail istemcileri için düz metin versiyonu.

## 🧪 Test

### Development (Console Log)

`.env` dosyasında `RESEND_API_KEY` boş bırakırsanız:
- Mail gönderilmez
- Console'da log görünür
- Kullanıcı kaydı yine başarılı olur

```bash
[WARN] RESEND_API_KEY not configured - email sending disabled
[WARN] 📧 Email disabled - Would send welcome email to: user@example.com
```

### Test Domain (Resend)

```env
MAIL_FROM=MenüBen <onboarding@resend.dev>
```

Bu mail adresi Resend tarafından sağlanan test domain'dir.
Gerçek mail gönderilebilir ama spam olarak işaretlenebilir.

### Production (Verified Domain)

1. Resend panelinde domain doğrula
2. DNS kayıtlarını ekle (SPF, DKIM, DMARC)
3. `.env` dosyasını güncelle:

```env
MAIL_FROM=MenüBen <hello@yourdomain.com>
```

## 📊 Response Format

Mail başarılı:
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu ve hoş geldiniz e-postası gönderildi",
  "data": {
    "id": "...",
    "email": "user@example.com",
    "emailSent": true
  }
}
```

Mail başarısız (kullanıcı yine oluşturulur):
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu (e-posta gönderilemedi)",
  "data": {
    "id": "...",
    "email": "user@example.com",
    "emailSent": false
  }
}
```

## 🐛 Hata Yönetimi

Mail gönderimi başarısız olsa bile kullanıcı kaydı başarılı sayılır:

```typescript
try {
  const result = await sendWelcomeKvkkEmail(...);
  emailSent = result.success;
} catch (error) {
  console.error('❌ Welcome email error:', error);
  // Kullanıcı kaydı yine devam eder
}
```

**Loglar:**
- ✅ Başarılı: `✅ Welcome email sent successfully`
- ⚠️  Başarısız: `⚠️  Welcome email could not be sent`
- ❌ Hata: `❌ Welcome email error: ...`

## 📋 KVKK İçeriği

Mail şablonunda aşağıdaki KVKK bilgileri yer alır:

- **Veri Sorumlusu:** MenüBen
- **İşlenen Veriler:** Ad, e-posta, telefon, restoran bilgileri
- **İşleme Amacı:** Hesap yönetimi, hizmet sunumu, destek
- **Hukuki Sebep:** Sözleşme ve meşru menfaat
- **Saklama Süresi:** Hizmet süresince + yasal gereklilik
- **KVKK Madde 11 Hakları:** Erişim, düzeltme, silme, itiraz
- **İletişim:** kvkk@menuben.com

## 🔄 Güncelleme

Mail şablonunu değiştirmek için:
`backend/src/lib/email/templates/welcomeKvkk.ts`

Email gönderme mantığını değiştirmek için:
`backend/src/lib/email/sendWelcomeKvkk.ts`

## 🌐 Alternatif: Nodemailer + SMTP

Resend yerine kendi SMTP sunucunuz varsa:

1. `npm install nodemailer`
2. `emailClient.ts` dosyasını nodemailer ile güncelle
3. `.env` dosyasına SMTP bilgileri ekle

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📞 Destek

Sorun yaşarsanız:
- Backend loglarını kontrol edin
- Resend dashboard'da mail gönderim durumunu görün
- `.env` ayarlarını doğrulayın
- API key'in doğru olduğundan emin olun

---

**Not:** Production'da mutlaka kendi domain'inizi kullanın ve DNS kayıtlarını doğru ayarlayın. Bu, mail'lerin spam'e düşmesini engeller.
