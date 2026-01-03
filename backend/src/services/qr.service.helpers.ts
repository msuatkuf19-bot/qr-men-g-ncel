import { prisma } from '../config/prisma';
import { ApiError } from '../utils/response';
import { logger } from './logger.service';

export class QRCodeServiceHelpers {
  /**
   * QR kodları listele
   */
  async getQRCodes(restaurantId: string) {
    try {
      const qrCodes = await prisma.qRCode.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
      });

      return qrCodes;
    } catch (error: any) {
      logger.error('QR kodları listeleme hatası', { error: error.message, restaurantId });
      throw error;
    }
  }

  /**
   * QR kod sil
   */
  async deleteQRCode(id: string) {
    try {
      const qrCode = await prisma.qRCode.findUnique({ where: { id } });
      
      if (!qrCode) {
        throw new ApiError(404, 'QR kod bulunamadı');
      }

      await prisma.qRCode.delete({ where: { id } });

      logger.info(`QR kod silindi: ${id}`);
    } catch (error: any) {
      logger.error('QR kod silme hatası', { error: error.message, id });
      throw error;
    }
  }
}

// QRCodeService'e ekleme yapıyoruz
import { qrCodeService as originalService } from './qr.service';

const helpers = new QRCodeServiceHelpers();

// Mevcut service'i genişlet
Object.assign(originalService, {
  getQRCodes: helpers.getQRCodes.bind(helpers),
  deleteQRCode: helpers.deleteQRCode.bind(helpers),
});
