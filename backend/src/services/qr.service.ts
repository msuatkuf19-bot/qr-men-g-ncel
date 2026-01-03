// Lazy import for heavy libraries to improve cold start performance
import * as path from 'path';
import prisma from '../config/prisma';
import { ApiError } from '../utils/response';
import { logger } from './logger.service';

export class QRCodeService {
  /**
   * QR kodun merkezine logo ekle
   */
  private async addLogoToQR(qrDataUrl: string, logoPath?: string | null): Promise<string> {
    try {
      // Logo yoksa orijinal QR'ı döndür
      if (!logoPath) {
        logger.warn('Logo yolu belirtilmedi, QR logosuz oluşturuluyor');
        return qrDataUrl;
      }

      logger.info('QR koduna logo ekleniyor', { logoPath });

      // Lazy load canvas library
      const { createCanvas, loadImage } = await import('canvas');

      // QR kodunu canvas'a yükle
      const qrImage = await loadImage(qrDataUrl);
      const qrSize = qrImage.width;
      
      const canvas = createCanvas(qrSize, qrSize);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(qrImage, 0, 0, qrSize, qrSize);
      
      // Logo boyutunu hesapla (QR'ın %18'i)
      const logoSize = Math.floor(qrSize * 0.18);
      const logoPosition = (qrSize - logoSize) / 2;
      
      // Beyaz pad boyutu (min 8px)
      const padSize = Math.max(8, Math.floor(logoSize * 0.15));
      const padPosition = logoPosition - padSize;
      const padDimension = logoSize + (padSize * 2);
      
      // Beyaz yuvarlak pad çiz
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(qrSize / 2, qrSize / 2, padDimension / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Logoyu yükle ve çiz
      try {
        const logo = await loadImage(logoPath);
        
        // Logo yuvarlak maske
        ctx.save();
        ctx.beginPath();
        ctx.arc(qrSize / 2, qrSize / 2, logoSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logo, logoPosition, logoPosition, logoSize, logoSize);
        ctx.restore();
        
        logger.info('✅ QR koduna logo başarıyla eklendi', { logoPath, logoSize, qrSize });
      } catch (logoError) {
        logger.warn('❌ Logo yüklenemedi, QR kod logosuz oluşturuldu', { logoPath, error: (logoError as Error).message });
      }
      
      // Canvas'ı data URL'e çevir
      return canvas.toDataURL('image/png');
    } catch (error) {
      logger.error('Logo ekleme hatası, orijinal QR döndürülüyor', { error: (error as Error).message });
      return qrDataUrl;
    }
  }

  /**
   * QR kod oluştur (PNG veya SVG)
   */
  async generateQRCode(
    restaurantId: string,
    tableNumber?: string,
    format: 'png' | 'svg' = 'png'
  ): Promise<{ code: string; image: string; url: string }> {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new ApiError(404, 'Restoran bulunamadı');
      }

      // Unique kod oluştur
      const code = `${restaurant.slug}-${tableNumber || 'general'}-${Date.now()}`;
      
      // Menü URL'i
      const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${restaurant.slug}${
        tableNumber ? `?table=${tableNumber}` : ''
      }`;

      // Lazy load QRCode library
      const QRCode = (await import('qrcode')).default;

      // QR görselini oluştur
      let qrImage: string;
      
      if (format === 'svg') {
        qrImage = await QRCode.toString(menuUrl, {
          type: 'svg',
          errorCorrectionLevel: 'H',
          margin: 2,
          color: {
            dark: restaurant.themeColor || '#000000',
            light: '#FFFFFF',
          },
        });
      } else {
        qrImage = await QRCode.toDataURL(menuUrl, {
          errorCorrectionLevel: 'H',
          width: 400,
          margin: 2,
          color: {
            dark: restaurant.themeColor || '#000000',
            light: '#FFFFFF',
          },
        });
        
        // PNG formatında ise logo ekle
        // Restoran logosu varsa onu kullan, yoksa default benmedya.png kullan
        let logoPath: string | null = null;
        if (restaurant.logo) {
          logoPath = `${process.cwd()}/uploads${restaurant.logo}`;
        } else {
          // Default logo olarak benmedya.png kullan (frontend/public klasöründe)
          logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'benmedya.png');
        }
        
        logger.info('QR için logo yolu belirlendi', { logoPath, hasRestaurantLogo: !!restaurant.logo });
        
        qrImage = await this.addLogoToQR(qrImage, logoPath);
      }

      // Veritabanına kaydet
      await prisma.qRCode.create({
        data: {
          code,
          tableNumber: tableNumber || null,
          restaurantId,
        },
      });

      logger.info(`QR kod oluşturuldu: ${code}`, { restaurantId, tableNumber });

      return { code, image: qrImage, url: menuUrl };
    } catch (error: any) {
      logger.error('QR kod oluşturma hatası', { error: error.message, restaurantId });
      throw error;
    }
  }

  /**
   * PDF formatında QR kod oluştur
   */
  async generateQRPDF(
    restaurantId: string,
    tableNumbers: string[]
  ): Promise<Uint8Array> {
    try {
      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new ApiError(404, 'Restoran bulunamadı');
      }

      // Lazy load PDF library
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      // PDF oluştur
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const tableNumber of tableNumbers) {
        const page = pdfDoc.addPage([595, 842]); // A4 boyutu
        const { width, height } = page.getSize();

        // QR kod oluştur
        const qrData = await this.generateQRCode(restaurantId, tableNumber, 'png');
        
        // Base64'ten image'e çevir
        const imageData = qrData.image.split(',')[1];
        const qrImage = await pdfDoc.embedPng(Buffer.from(imageData, 'base64'));

        // Başlık
        page.drawText(restaurant.name, {
          x: 50,
          y: height - 50,
          size: 24,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        // Masa numarası
        page.drawText(`Masa ${tableNumber}`, {
          x: 50,
          y: height - 80,
          size: 18,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        });

        // QR kodu ortala
        const qrSize = 300;
        const x = (width - qrSize) / 2;
        const y = (height - qrSize) / 2;

        page.drawImage(qrImage, {
          x,
          y,
          width: qrSize,
          height: qrSize,
        });

        // Alt bilgi
        page.drawText('QR kodu okutarak menümüze erişebilirsiniz', {
          x: 100,
          y: 100,
          size: 14,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        });

        page.drawText(qrData.url, {
          x: 50,
          y: 70,
          size: 10,
          font: font,
          color: rgb(0.6, 0.6, 0.6),
        });
      }

      const pdfBytes = await pdfDoc.save();
      logger.info(`PDF QR kod oluşturuldu`, { restaurantId, tableCount: tableNumbers.length });

      return pdfBytes;
    } catch (error: any) {
      logger.error('PDF QR kod oluşturma hatası', { error: error.message, restaurantId });
      throw error;
    }
  }

  /**
   * Toplu QR kod oluştur
   */
  async generateBulkQRCodes(
    restaurantId: string,
    startTable: number,
    endTable: number
  ): Promise<Array<{ tableNumber: string; code: string; image: string }>> {
    const qrCodes = [];

    for (let i = startTable; i <= endTable; i++) {
      const tableNumber = i.toString();
      const qr = await this.generateQRCode(restaurantId, tableNumber);
      qrCodes.push({
        tableNumber,
        code: qr.code,
        image: qr.image,
      });
    }

    logger.info(`Toplu QR kod oluşturuldu`, { restaurantId, count: qrCodes.length });
    return qrCodes;
  }

  /**
   * QR kod tarama kayıt - Optimize edilmiş
   */
  async trackScan(
    code: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ restaurantSlug: string; tableNumber?: string }> {
    const t0 = Date.now();
    
    try {
      const t1 = Date.now();
      const qrCode = await prisma.qRCode.findUnique({
        where: { code },
        include: {
          restaurant: {
            select: {
              id: true,
              slug: true,
            },
          },
        },
      });
      const t2 = Date.now();

      if (!qrCode) {
        throw new ApiError(404, 'QR kod bulunamadı');
      }

      // Tarama sayısını artır ve Analytics'i fire-and-forget olarak yap
      // Response'u bekletmemek için async işlemler
      const updatePromise = prisma.qRCode.update({
        where: { code },
        data: {
          scanCount: { increment: 1 },
          lastScannedAt: new Date(),
        },
      }).catch((err: Error) => logger.error('QR update hatası', { error: err.message }));

      // Analytics kaydı oluştur
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const analyticsPromise = prisma.analytics.upsert({
        where: {
          restaurantId_date: {
            restaurantId: qrCode.restaurantId,
            date: today,
          },
        },
        create: {
          restaurantId: qrCode.restaurantId,
          date: today,
          viewCount: 1,
        },
        update: {
          viewCount: { increment: 1 },
        },
      }).catch((err: Error) => logger.error('Analytics upsert hatası', { error: err.message }));

      // Fire-and-forget: Ana response'u bekletmeden arka planda çalışsın
      Promise.all([updatePromise, analyticsPromise]);

      const t3 = Date.now();
      
      // Timing log
      logger.info(`[TIMING][QR-SCAN] code=${code} | findUnique=${t2-t1}ms | total=${t3-t0}ms`);

      return {
        restaurantSlug: qrCode.restaurant.slug,
        tableNumber: qrCode.tableNumber || undefined,
      };
    } catch (error: any) {
      logger.error('QR kod tarama hatası', { error: error.message, code });
      throw error;
    }
  }

  /**
   * Restoran QR kodlarını listele
   */
  async getQRCodes(restaurantId: string) {
    try {
      const qrCodes = await prisma.qRCode.findMany({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
      });

      const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (!restaurant) {
        throw new ApiError(404, 'Restoran bulunamadı');
      }

      // Her QR kod için URL ve imageUrl oluştur
      const apiUrl = process.env.API_URL || 'http://localhost:5000';
      const qrCodesWithImages = qrCodes.map((qr) => {
        const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${restaurant.slug}${
          qr.tableNumber ? `?table=${qr.tableNumber}` : ''
        }`;

        return {
          ...qr,
          url: menuUrl,
          imageUrl: `${apiUrl}/api/qr/${qr.id}/image`,
          type: qr.tableNumber ? 'TABLE' : 'RESTAURANT',
        };
      });

      return qrCodesWithImages;
    } catch (error: any) {
      logger.error('QR kod listesi alınırken hata', { error: error.message });
      throw error;
    }
  }

  /**
   * QR kod sil
   */
  async deleteQRCode(id: string) {
    try {
      await prisma.qRCode.delete({
        where: { id },
      });

      logger.info('QR kod silindi', { id });
      return { message: 'QR kod başarıyla silindi' };
    } catch (error: any) {
      logger.error('QR kod silinirken hata', { error: error.message });
      throw error;
    }
  }

  /**
   * QR kod görselini buffer olarak döndür
   */
  async getQRCodeImage(id: string): Promise<Buffer> {
    try {
      const qrCode = await prisma.qRCode.findUnique({
        where: { id },
        include: { restaurant: true },
      });

      if (!qrCode) {
        throw new ApiError(404, 'QR kod bulunamadı');
      }

      // Menü URL'ini oluştur
      const menuUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${qrCode.restaurant.slug}${
        qrCode.tableNumber ? `?table=${qrCode.tableNumber}` : ''
      }`;

      // Lazy load QRCode for buffer generation
      const QRCode = (await import('qrcode')).default;

      // QR görselini buffer olarak oluştur
      const qrBuffer = await QRCode.toBuffer(menuUrl, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2,
        color: {
          dark: qrCode.restaurant.themeColor || '#000000',
          light: '#FFFFFF',
        },
      });

      return qrBuffer;
    } catch (error: any) {
      logger.error('QR görsel oluşturma hatası', { error: error.message, id });
      throw error;
    }
  }
}

export const qrCodeService = new QRCodeService();
