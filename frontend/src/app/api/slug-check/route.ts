import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getBackendBaseUrl() {
  // Prefer explicit server env, fallback to the same value used by the client.
  const serverUrl = process.env.API_URL || process.env.BACKEND_URL;
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  return (serverUrl || publicUrl || 'http://localhost:5000').replace(/\/$/, '');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get('slug') || '').trim();
  const excludeId = (searchParams.get('excludeId') || '').trim();

  if (!slug) {
    return NextResponse.json({ success: false, message: 'slug query param gerekli' }, { status: 400 });
  }

  const backend = getBackendBaseUrl();
  const url = new URL(`${backend}/api/public/slug-check`);
  url.searchParams.set('slug', slug);
  if (excludeId) url.searchParams.set('excludeId', excludeId);

  const res = await fetch(url.toString(), { cache: 'no-store' });
  const data = await res.json().catch(() => null);

  return NextResponse.json(data ?? { success: false, message: 'Geçersiz yanıt' }, {
    status: res.ok ? 200 : res.status,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
