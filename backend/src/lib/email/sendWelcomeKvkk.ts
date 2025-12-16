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
  console.log('=== WELCOME EMAIL START ===');
  console.log('To:', params.to);
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('RESEND_API_KEY value (first 10 chars):', process.env.RESEND_API_KEY?.substring(0, 10));
  
  // Email servisi devre dışıysa sessizce başarılı dön (production için)
  if (!isEmailEnabled()) {
    console.log('❌ EMAIL DISABLED - API KEY MISSING');
    logger.warn(`📧 Email disabled - Would send welcome email to: ${params.to}`);
    return { success: false, error: 'Email service not configured' };
  }
  
  console.log('✅ Email service enabled, getting client...');
  const client = getEmailClient();
  if (!client) {
    console.log('❌ EMAIL CLIENT IS NULL');
    logger.error('❌ Email client not initialized');
    return { success: false, error: 'Email client not initialized' };
  }

  try {
    const mailFrom = process.env.MAIL_FROM || 'MenüBen <onboarding@resend.dev>';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const loginUrl = params.loginUrl || `${appUrl}/login`;
    
    console.log('Mail config:', { mailFrom, appUrl, loginUrl });

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
    console.log('✅ RESEND API RESPONSE:', result);
    logger.info(`✅ Welcome email sent successfully to ${params.to} - ID: ${result.data?.id}`);
    
    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error: any) {
    console.error('❌ RESEND API ERROR:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      name: error.name
    });
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
