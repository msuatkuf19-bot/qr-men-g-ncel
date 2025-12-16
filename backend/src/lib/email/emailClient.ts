import { Resend } from 'resend';
import logger from '../../utils/logger';

// Resend client singleton
let resendClient: Resend | null = null;

export const getEmailClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    logger.warn('RESEND_API_KEY not configured - email sending disabled');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
    logger.info('✅ Resend email client initialized');
  }

  return resendClient;
};

export const isEmailEnabled = (): boolean => {
  return !!process.env.RESEND_API_KEY;
};
