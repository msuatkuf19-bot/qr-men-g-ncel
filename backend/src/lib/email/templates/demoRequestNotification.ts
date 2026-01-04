interface DemoRequestEmailData {
  restaurantName: string;
  fullName: string;
  phone: string;
  email: string | null;
  restaurantType: string;
  tableCount: number;
  potentialStatus: string;
  createdAt: Date;
  adminPanelUrl: string;
}

const statusLabels: Record<string, string> = {
  NONE: 'Seçilmemiş',
  PENDING: 'Beklemede',
  DEMO_CREATED: 'Demo Oluşturuldu',
  HIGH_PROBABILITY: 'Yüksek İhtimal',
  EVALUATING: 'Değerlendiriyor',
  FOLLOW_UP: 'Takip',
  LONG_TERM: 'Uzun Vade',
  NEGATIVE: 'Olumsuz',
};

export const getDemoRequestEmailTemplate = (data: DemoRequestEmailData): { html: string; text: string } => {
  const statusLabel = statusLabels[data.potentialStatus] || data.potentialStatus;
  const formattedDate = new Date(data.createdAt).toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yeni Demo Talebi</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Ana Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; max-width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                📩 Yeni Demo Talebi
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 15px; font-weight: 400;">
                Menuben QR Menü Sistemi
              </p>
            </td>
          </tr>

          <!-- İçerik -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Uyarı Badge -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>🔔 Hemen İnceleyin:</strong> Yeni bir demo talebi sisteme kaydedildi ve sizin onayınızı bekliyor.
                </p>
              </div>

              <!-- Restoran Bilgileri -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                  🏪 Restoran Bilgileri
                </h2>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Restoran Adı:</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                      <span style="color: #111827; font-size: 14px; font-weight: 600;">${data.restaurantName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Restoran Tipi:</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                      <span style="color: #111827; font-size: 14px;">${data.restaurantType || '-'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Masa Sayısı:</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                      <span style="color: #111827; font-size: 14px;">${data.tableCount} masa</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- İletişim Bilgileri -->
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                  👤 Yetkili Bilgileri
                </h2>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Ad Soyad:</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                      <span style="color: #111827; font-size: 14px; font-weight: 600;">${data.fullName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Telefon:</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                      <a href="tel:${data.phone}" style="color: #3b82f6; font-size: 14px; text-decoration: none;">${data.phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">E-posta:</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                      ${data.email 
                        ? `<a href="mailto:${data.email}" style="color: #3b82f6; font-size: 14px; text-decoration: none;">${data.email}</a>`
                        : '<span style="color: #9ca3af; font-size: 14px;">-</span>'
                      }
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Durum ve Tarih -->
              <div style="margin-bottom: 35px;">
                <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                  📊 Talep Detayları
                </h2>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Potansiyel Durum:</span>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
                      <span style="display: inline-block; background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;">
                        ${statusLabel}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Talep Tarihi:</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right;">
                      <span style="color: #111827; font-size: 14px;">${formattedDate}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${data.adminPanelUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); transition: all 0.3s;">
                      🚀 Demo Talebini Gör
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                Bu e-posta <strong>Menuben QR Menü Sistemi</strong> tarafından otomatik olarak gönderilmiştir.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Menuben. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
📩 YENİ DEMO TALEBİ ALINDI

🏪 RESTORAN BİLGİLERİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Restoran Adı: ${data.restaurantName}
Restoran Tipi: ${data.restaurantType || '-'}
Masa Sayısı: ${data.tableCount}

👤 YETKİLİ BİLGİLERİ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ad Soyad: ${data.fullName}
Telefon: ${data.phone}
E-posta: ${data.email || '-'}

📊 TALEP DETAYLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Potansiyel Durum: ${statusLabel}
Talep Tarihi: ${formattedDate}

🚀 Demo talebini görüntülemek için:
${data.adminPanelUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bu e-posta Menuben QR Menü Sistemi tarafından otomatik olarak gönderilmiştir.
  `.trim();

  return { html, text };
};
