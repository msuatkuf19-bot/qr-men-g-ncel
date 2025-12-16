interface WelcomeEmailData {
  name: string;
  loginEmail: string;
  loginUrl: string;
  tempPassword?: string;
  includePassword?: boolean;
}

export const getWelcomeKvkkEmailTemplate = (data: WelcomeEmailData) => {
  const { name, loginEmail, loginUrl, tempPassword, includePassword = false } = data;
  
  const kvkkContactEmail = process.env.KVKK_CONTACT_EMAIL || 'kvkk@menuben.com';
  const supportEmail = process.env.SUPPORT_EMAIL || 'destek@menuben.com';

  // HTML Template
  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MenüBen'e Hoş Geldiniz</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    h1 {
      color: #1e293b;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box strong {
      color: #1e40af;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #3b82f6;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background-color: #2563eb;
    }
    .kvkk-section {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 20px;
      margin-top: 30px;
      font-size: 13px;
      color: #64748b;
    }
    .kvkk-section h2 {
      font-size: 16px;
      color: #334155;
      margin-bottom: 15px;
    }
    .kvkk-section ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .kvkk-section li {
      margin: 8px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    .highlight {
      background-color: #fef3c7;
      padding: 2px 6px;
      border-radius: 3px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎉 MenüBen</div>
      <p style="color: #64748b; margin: 0;">QR Menü Yönetim Sistemi</p>
    </div>

    <h1>MenüBen Ailesine Hoş Geldiniz!</h1>
    
    <p>Merhaba <strong>${name || 'Değerli Kullanıcı'}</strong>,</p>
    
    <p>QR menü yönetim paneliniz başarıyla oluşturuldu. Artık restoranınızın dijital menüsünü kolayca yönetebilir, QR kodlarınızı oluşturabilir ve müşterilerinize modern bir deneyim sunabilirsiniz.</p>

    <div class="info-box">
      <p style="margin: 0 0 10px 0;"><strong>📧 Giriş E-postanız:</strong></p>
      <p style="margin: 0; font-size: 16px;">${loginEmail}</p>
      
      ${includePassword && tempPassword ? `
      <p style="margin: 20px 0 10px 0;"><strong>🔑 Geçici Şifreniz:</strong></p>
      <p style="margin: 0; font-size: 16px;" class="highlight">${tempPassword}</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">⚠️ İlk girişten sonra şifrenizi değiştirmenizi öneririz.</p>
      ` : `
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #64748b;">🔐 Şifreniz admin tarafından belirlenmiştir.</p>
      `}
    </div>

    <div style="text-align: center;">
      <a href="${loginUrl}" class="button">🚀 Panele Giriş Yap</a>
    </div>

    <div class="kvkk-section">
      <h2>📋 Kişisel Verilerin Korunması (KVKK) Bilgilendirmesi</h2>
      
      <p><strong>Veri Sorumlusu:</strong> MenüBen</p>
      
      <p><strong>İşlenen Veriler:</strong></p>
      <ul>
        <li>Kimlik bilgileri (ad, soyad)</li>
        <li>İletişim bilgileri (e-posta, telefon)</li>
        <li>Restoran ve menü içerikleri</li>
        <li>Kullanıcı hesap bilgileri</li>
      </ul>

      <p><strong>İşleme Amacı:</strong></p>
      <ul>
        <li>Kullanıcı hesabının oluşturulması ve yönetimi</li>
        <li>QR menü hizmetinin sunulması</li>
        <li>Müşteri destek ve iletişim hizmetleri</li>
        <li>Platform güvenliğinin sağlanması</li>
      </ul>

      <p><strong>Hukuki Sebep:</strong> Hizmet sözleşmesinin kurulması ve ifası, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında meşru menfaat</p>

      <p><strong>Saklama Süresi:</strong> Hizmetin devamı süresince ve yasal mevzuatın öngördüğü süreler boyunca</p>

      <p><strong>Haklarınız (KVKK Madde 11):</strong></p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
        <li>Silme veya yok edilmesini isteme</li>
        <li>İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi sonucu aleyhinize bir sonuç doğması halinde itiraz etme</li>
        <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
      </ul>

      <p><strong>İletişim:</strong></p>
      <p>KVKK hakları ile ilgili başvurularınız için: <a href="mailto:${kvkkContactEmail}">${kvkkContactEmail}</a></p>
      <p>Destek için: <a href="mailto:${supportEmail}">${supportEmail}</a></p>
    </div>

    <div class="footer">
      <p>Bu e-posta otomatik olarak gönderilmiştir.</p>
      <p style="margin-top: 10px;">© ${new Date().getFullYear()} MenüBen - Tüm hakları saklıdır.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Plain Text Template
  const text = `
MenüBen Ailesine Hoş Geldiniz! 🎉

Merhaba ${name || 'Değerli Kullanıcı'},

QR menü yönetim paneliniz başarıyla oluşturuldu.

GİRİŞ BİLGİLERİNİZ:
━━━━━━━━━━━━━━━━━━━━━━
📧 E-posta: ${loginEmail}
${includePassword && tempPassword ? `🔑 Geçici Şifre: ${tempPassword}\n⚠️  İlk girişten sonra şifrenizi değiştirmenizi öneririz.` : '🔐 Şifreniz admin tarafından belirlenmiştir.'}

🚀 Panel Linki: ${loginUrl}

━━━━━━━━━━━━━━━━━━━━━━
KVKK BİLGİLENDİRMESİ
━━━━━━━━━━━━━━━━━━━━━━

Veri Sorumlusu: MenüBen

İşlenen Veriler:
• Kimlik bilgileri (ad, soyad)
• İletişim bilgileri (e-posta, telefon)
• Restoran ve menü içerikleri
• Kullanıcı hesap bilgileri

İşleme Amacı:
• Kullanıcı hesabının oluşturulması ve yönetimi
• QR menü hizmetinin sunulması
• Müşteri destek ve iletişim hizmetleri
• Platform güvenliğinin sağlanması

Hukuki Sebep: Hizmet sözleşmesinin kurulması ve ifası

Saklama Süresi: Hizmet süresince ve yasal mevzuat süresi boyunca

KVKK Haklarınız (Madde 11):
• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• Düzeltme, silme veya yok edilmesini isteme
• İtiraz etme ve zarar giderimini talep etme

İletişim:
KVKK: ${kvkkContactEmail}
Destek: ${supportEmail}

━━━━━━━━━━━━━━━━━━━━━━

Bu e-posta otomatik olarak gönderilmiştir.
© ${new Date().getFullYear()} MenüBen - Tüm hakları saklıdır.
  `;

  return { html, text };
};

export const getWelcomeEmailSubject = (): string => {
  return 'MenüBen Ailesine Hoş Geldiniz 🎉';
};
