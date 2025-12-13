import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = (searchParams.get('text') || '').trim();

  if (!text) {
    return NextResponse.json({ success: false, message: 'text query param gerekli' }, { status: 400 });
  }

  if (text.length > 2048) {
    return NextResponse.json({ success: false, message: 'text çok uzun' }, { status: 400 });
  }

  const png = await QRCode.toBuffer(text, {
    type: 'png',
    width: 512,
    margin: 3,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  const body = new Uint8Array(png);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
