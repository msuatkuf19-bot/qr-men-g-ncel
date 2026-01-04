import nodemailer, { Transporter } from 'nodemailer';
import logger from '../../utils/logger';

// Nodemailer transporter singleton
let transporter: Transporter | null = null;

export const getMailTransporter = (): Transporter | null => {
  const mailHost = process.env.MAIL_HOST;
  const mailPort = process.env.MAIL_PORT;
  const mailUser = process.env.MAIL_USER;
  const mailPass = process.env.MAIL_PASS;

  // SMTP ayarları eksikse mail gönderimi devre dışı
  if (!mailHost || !mailPort || !mailUser || !mailPass) {
    logger.warn('⚠️  SMTP credentials not configured - mail notifications disabled');
    return null;
  }

  // Transporter zaten oluşturulmuşsa tekrar oluşturma
  if (!transporter) {
    try {
      transporter = nodemailer.createTransport({
        host: mailHost,
        port: parseInt(mailPort, 10),
        secure: parseInt(mailPort, 10) === 465, // SSL/TLS (465 portu için true)
        auth: {
          user: mailUser,
          pass: mailPass,
        },
      });

      logger.info('✅ Nodemailer transporter initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Nodemailer:', error);
      return null;
    }
  }

  return transporter;
};

export const isMailEnabled = (): boolean => {
  return !!getMailTransporter();
};
