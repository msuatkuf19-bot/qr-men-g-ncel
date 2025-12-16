import { getEmailClient, isEmailEnabled } from './emailClient';
import { getWelcomeKvkkEmailTemplate, getWelcomeEmailSubject } from './templates/welcomeKvkk';
import logger from '../../utils/logger';

interface SendWelcomeEmailParams {
  to: string;
  name: string;
  loginEmail: string;
  loginUrl?: string;
  tempPassword?: string;
  includePassword?: boolean;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const sendWelcomeKvkkEmail = async (
  params: SendWelcomeEmailParams
): Promise<SendEmailResult> => {
  // Email servisi devre dışıysa sessizce başarılı dön (production için)
  if (!isEmailEnabled()) {
    logger.warn(`📧 Email disabled - Would send welcome email to: ${params.to}`);
    return { success: true, error: 'Email service not configured' };
  }

  const client = getEmailClient();
  if (!client) {
    logger.error('❌ Email client not initialized');
    return { success: false, error: 'Email client not initialized' };
  }

  try {
    const mailFrom = process.env.MAIL_FROM || 'MenüBen <onboarding@resend.dev>';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const loginUrl = params.loginUrl || `${appUrl}/login`;

    const { html, text } = getWelcomeKvkkEmailTemplate({
      name: params.name,
      loginEmail: params.loginEmail,
      loginUrl,
      tempPassword: params.tempPassword,
      includePassword: params.includePassword || false,
    });

    logger.info(`📧 Sending welcome email to: ${params.to}`);

    const result = await client.emails.send({
      from: mailFrom,
      to: params.to,
      subject: getWelcomeEmailSubject(),
      html,
      text,
    });

    logger.info(`✅ Welcome email sent successfully to ${params.to} - ID: ${result.data?.id}`);
    
    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error: any) {
    logger.error('❌ Failed to send welcome email:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
};
