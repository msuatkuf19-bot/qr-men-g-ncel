interface WelcomeEmailData {
  name: string;
  loginEmail: string;
  loginUrl: string;
  tempPassword?: string;
  includePassword?: boolean;
  restaurantName?: string;
}

/**
 * Base URL oluşturma - logo ve panel linkleri için
 */
const getBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  );
};

/**
 * Logo URL - public/benmedya.png dosyası için tam URL
 */
const getLogoUrl = (): string => {
  return `${getBaseUrl()}/benmedya.png`;
};

export const getWelcomeKvkkEmailTemplate = (data: WelcomeEmailData) => {
  const { name, loginEmail, loginUrl, tempPassword, includePassword = false, restaurantName } = data;
  
  const kvkkContactEmail = process.env.KVKK_CONTACT_EMAIL || 'kvkk@menuben.com';
  const supportEmail = process.env.SUPPORT_EMAIL || 'destek@menuben.com';
  const logoUrl = getLogoUrl();
  const currentYear = new Date().getFullYear();
  const panelUrl = loginUrl || `${getBaseUrl()}/login`;

  // HTML Template - Modern Dark Theme
  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menü Ben'e Hoş Geldiniz</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px 16px 0 0; padding: 32px 40px; text-align: center; border-bottom: 2px solid #EF742C;">
              <img src="${logoUrl}" alt="Menü Ben" style="height: 48px; width: auto; margin-bottom: 12px;" />
              <p style="margin: 0; color: #9ca3af; font-size: 14px;">QR Menü Yönetim Sistemi</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #111827; padding: 40px;">
              
              <!-- Welcome Message -->
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Hoş geldiniz, ${name || 'Değerli Kullanıcı'}
              </h1>
              
              ${restaurantName ? `
              <p style="margin: 0 0 24px 0; color: #10b981; font-size: 16px; font-weight: 600;">
                ✓ ${restaurantName} restoranınız başarıyla oluşturuldu.
              </p>
              ` : `
              <p style="margin: 0 0 24px 0; color: #10b981; font-size: 16px; font-weight: 600;">
                ✓ QR menü paneliniz başarıyla oluşturuldu.
              </p>
              `}

              <p style="margin: 0 0 28px 0; color: #d1d5db; font-size: 15px; line-height: 1.6;">
                Artık restoranınızın dijital menüsünü kolayca yönetebilir, QR kodlarınızı oluşturabilir ve müşterilerinize modern bir deneyim sunabilirsiniz.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border-radius: 12px; margin-bottom: 28px; border-left: 4px solid #EF742C;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📧 Giriş E-postanız</p>
                    <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">${loginEmail}</p>
                    
                    ${includePassword && tempPassword ? `
                    <p style="margin: 16px 0 12px 0; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🔑 Geçici Şifreniz</p>
                    <p style="margin: 0; padding: 8px 12px; background-color: #fef3c7; border-radius: 6px; color: #92400e; font-size: 16px; font-weight: 600; display: inline-block;">${tempPassword}</p>
                    <p style="margin: 12px 0 0 0; color: #fbbf24; font-size: 12px;">⚠️ İlk girişten sonra şifrenizi değiştirmenizi öneririz.</p>
                    ` : `
                    <p style="margin: 0; color: #9ca3af; font-size: 13px;">🔐 Şifreniz admin tarafından belirlenmiştir.</p>
                    `}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 32px 0;">
                    <a href="${panelUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #EF742C 0%, #ff9a5a 100%); color: #000000; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px rgba(239, 116, 44, 0.4);">
                      Panele Git →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Quick Start Guide -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; color: #ffffff; font-size: 16px; font-weight: 600;">🚀 Hızlı Başlangıç</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span> Menü ve kategorileri ekleyin
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span> Masa / QR kodları oluşturun
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span> Tema ve görünümü yönetin
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span> Analizleri takip edin
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- KVKK Section -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 14px; font-weight: 600;">📋 KVKK Bilgilendirmesi</p>
                    <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                      Bu e-posta, Menü Ben (QR Kod) hizmeti kapsamında adınıza bir kullanıcı hesabı ve restoran kaydı oluşturulması nedeniyle gönderilmiştir.
                    </p>
                    <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                      Kişisel verileriniz ve işletme verileriniz; hizmetin mevzuata uygun, eksiksiz ve sağlıklı bir şekilde sunulması, müşterilerinizin işletmenizle hızlı ve etkin iletişim kurabilmesi ile operasyonel süreçlerin yürütülmesi amaçlarıyla, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında işlenmektedir.
                    </p>
                    <p style="margin: 0; color: #64748b; font-size: 12px;">
                      KVKK hakları için: <a href="mailto:${kvkkContactEmail}" style="color: #EF742C; text-decoration: none;">${kvkkContactEmail}</a> | 
                      Destek: <a href="mailto:${supportEmail}" style="color: #EF742C; text-decoration: none;">${supportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; border-radius: 0 0 16px 16px; padding: 24px 40px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">Bu e-posta otomatik olarak gönderilmiştir.</p>
              <p style="margin: 0; color: #475569; font-size: 11px;">© ${currentYear} Menü Ben — Tüm hakları saklıdır.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Plain Text Template
  const text = `
MENÜ BEN'E HOŞ GELDİNİZ

Hoş geldiniz, ${name || 'Değerli Kullanıcı'}

${restaurantName ? `✓ ${restaurantName} restoranınız başarıyla oluşturuldu.` : '✓ QR menü paneliniz başarıyla oluşturuldu.'}

Artık restoranınızın dijital menüsünü kolayca yönetebilir, QR kodlarınızı oluşturabilir ve müşterilerinize modern bir deneyim sunabilirsiniz.

━━━━━━━━━━━━━━━━━━━━━━
GİRİŞ BİLGİLERİNİZ
━━━━━━━━━━━━━━━━━━━━━━
📧 E-posta: ${loginEmail}
${includePassword && tempPassword ? `🔑 Geçici Şifre: ${tempPassword}\n⚠️  İlk girişten sonra şifrenizi değiştirmenizi öneririz.` : '🔐 Şifreniz admin tarafından belirlenmiştir.'}

🚀 Panel Linki: ${panelUrl}

━━━━━━━━━━━━━━━━━━━━━━
HIZLI BAŞLANGIÇ
━━━━━━━━━━━━━━━━━━━━━━
✓ Menü ve kategorileri ekleyin
✓ Masa / QR kodları oluşturun
✓ Tema ve görünümü yönetin
✓ Analizleri takip edin

━━━━━━━━━━━━━━━━━━━━━━
KVKK BİLGİLENDİRMESİ
━━━━━━━━━━━━━━━━━━━━━━
Bu e-posta, Menü Ben (QR Kod) hizmeti kapsamında adınıza bir kullanıcı hesabı ve restoran kaydı oluşturulması nedeniyle gönderilmiştir.

Kişisel verileriniz ve işletme verileriniz; hizmetin mevzuata uygun, eksiksiz ve sağlıklı bir şekilde sunulması, müşterilerinizin işletmenizle hızlı ve etkin iletişim kurabilmesi ile operasyonel süreçlerin yürütülmesi amaçlarıyla, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında işlenmektedir.

KVKK hakları için: ${kvkkContactEmail} | Destek: ${supportEmail}

━━━━━━━━━━━━━━━━━━━━━━

Bu e-posta otomatik olarak gönderilmiştir.
© ${currentYear} Menü Ben — Tüm hakları saklıdır.
  `;

  return { html, text };
};

export const getWelcomeEmailSubject = (restaurantName?: string): string => {
  if (restaurantName) {
    return `Menü Ben'e Hoş Geldiniz — ${restaurantName}`;
  }
  return "Menü Ben'e Hoş Geldiniz 🎉";
};
