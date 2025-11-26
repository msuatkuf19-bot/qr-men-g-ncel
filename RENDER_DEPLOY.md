# Render.com ile Backend Deploy

## 1. Render.com Hesabı
https://render.com/
GitHub ile giriş yap

## 2. New Web Service
- Dashboard → New → Web Service
- GitHub repository seç: `msuatkuf19-bot/qr-men-g-ncel`

## 3. Ayarlar:
- **Name**: qr-menu-backend
- **Region**: Oregon (US West)
- **Branch**: main
- **Root Directory**: backend
- **Runtime**: Node
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npx prisma migrate deploy && npm start`

## 4. Environment Variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_0HO3cftNaVzL@ep-winter-hat-adt73z8b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

NODE_ENV=production

JWT_SECRET=zNGdoLUh4jW6IQqeacuXwxHFMO05JsVv

FRONTEND_URL=https://qr-men-g-ncel.vercel.app

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
JWT_EXPIRES_IN=7d
```

## 5. Plan:
- **Free** seç

## 6. Create Web Service
Deploy başlayacak - 3-5 dakika sürer

## 7. URL Al:
Deploy bitince: `https://qr-menu-backend.onrender.com`
