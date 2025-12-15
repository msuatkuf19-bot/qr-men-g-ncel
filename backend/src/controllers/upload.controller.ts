import { Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendSuccess, ApiError } from '../utils/response';
import prisma from '../config/database';

// PostgreSQL ImageType enum values
const ImageType = {
  LOGO: 'LOGO' as const,
  PRODUCT: 'PRODUCT' as const,
  CATEGORY: 'CATEGORY' as const,
  OTHER: 'OTHER' as const
};

export const uploadImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Dosya yüklenmedi');
    }

    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      throw new ApiError(400, 'Restoran ID gerekli');
    }

    // Orijinal dosya
    const originalPath = req.file.path;
    const filename = req.file.filename;
    const mimetype = req.file.mimetype;
    const originalSize = req.file.size;

    // Optimize edilmiş dosya adı
    const optimizedFilename = `optimized-${filename}`;
    const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);

    // Sharp ile görsel optimizasyonu
    const optimizedBuffer = await sharp(originalPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Save optimized image temporarily
    fs.writeFileSync(optimizedPath, optimizedBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `qr-menu/${restaurantId}`,
          public_id: optimizedFilename.replace(/\.[^/.]+$/, ''), // Remove extension
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(optimizedBuffer);
    });

    // Dosyaları temizle
    try {
      fs.unlinkSync(originalPath);
      fs.unlinkSync(optimizedPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    // Database'e Cloudinary URL'ini kaydet
    const imageType = (req.body.type && Object.values(ImageType).includes(req.body.type)) 
      ? req.body.type 
      : ImageType.OTHER;
    
    console.log('Cloudinary upload successful:', {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });
      
    const image = await prisma.image.create({
      data: {
        url: uploadResult.secure_url, // Cloudinary URL
        filename: optimizedFilename,
        mimetype,
        size: optimizedBuffer.length,
        type: imageType as any,
        restaurantId,
      },
    });

    console.log('Image saved to database:', {
      id: image.id,
      url: image.url,
      type: image.type
    });

    sendSuccess(res, image, 'Görsel başarıyla yüklendi', 201);
  } catch (error) {
    // Hata durumunda dosyayı temizle
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('File cleanup error:', e);
      }
    }
    next(error);
  }
};

export const deleteImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      throw new ApiError(404, 'Görsel bulunamadı');
    }

    // Dosyayı sil
    const filePath = path.join(__dirname, '../../uploads', image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Database'den sil
    await prisma.image.delete({ where: { id } });

    sendSuccess(res, null, 'Görsel başarıyla silindi');
  } catch (error) {
    next(error);
  }
};

export const getImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      throw new ApiError(400, 'Restoran ID gerekli');
    }

    const images = await prisma.image.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(res, images);
  } catch (error) {
    next(error);
  }
};
