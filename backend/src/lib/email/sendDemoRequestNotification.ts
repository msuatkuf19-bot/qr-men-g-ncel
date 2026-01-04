import { getMailTransporter } from './mailer';
import { getDemoRequestEmailTemplate } from './templates/demoRequestNotification';
import logger from '../../utils/logger';

interface DemoRequestData {
  restaurantName: string;
  fullName: string;
  phone: string;
  email: string | null;
  restaurantType: string;
  tableCount: number;
  potentialStatus: string;
  createdAt: Date;
}

const ADMIN_EMAIL = 'menuben.com@gmail.com';
const ADMIN_PANEL_URL = 'https://www.menuben.com/admin/demo-requests';

/**
 * Demo talebi oluşturulduğunda admin'e bildirim maili gönderir
 * Async çalışır, hata olursa kayıt işlemini etkilemez
 */
export const sendDemoRequestNotification = async (data: DemoRequestData): Promise<void> => {
  try {
    const transporter = getMailTransporter();

    if (!transporter) {
      logger.info('📧 Mail notification skipped - SMTP not configured');
      return;
    }

    const mailFrom = process.env.MAIL_FROM || 'Menuben Demo <noreply@menuben.com>';
    const { html, text } = getDemoRequestEmailTemplate({
      ...data,
      adminPanelUrl: ADMIN_PANEL_URL,
    });

    const mailOptions = {
      from: mailFrom,
      to: ADMIN_EMAIL,
      subject: '📩 Yeni Demo Talebi Alındı',
      html,
      text,
    };

    await transporter.sendMail(mailOptions);
    
    logger.info(`✅ Demo request notification sent to ${ADMIN_EMAIL} for restaurant: ${data.restaurantName}`);
  } catch (error) {
    // Mail gönderilemese bile kayıt işlemi başarılı olmalı
    logger.error('❌ Failed to send demo request notification:', error);
    console.error('[MAIL ERROR]', error);
  }
};
