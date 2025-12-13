'use client';

import QRCode from 'react-qr-code';

type QrBoxProps =
  | {
      slug: string;
      url?: never;
      size?: number;
    }
  | {
      slug?: never;
      url: string;
      size?: number;
    };

function getClientBaseUrl(): string {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase && envBase.trim()) return envBase.trim().replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

export default function QrBox(props: QrBoxProps) {
  const size = props.size ?? 240;
  const base = getClientBaseUrl();
  let fullUrl = '';
  if ('url' in props && typeof props.url === 'string') {
    fullUrl = props.url;
  } else if ('slug' in props && typeof props.slug === 'string') {
    fullUrl = `${base}/m/${props.slug}`;
  } else {
    fullUrl = base;
  }

  return (
    <div className="w-full">
      <div className="inline-flex flex-col items-center">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <QRCode value={fullUrl} size={size} level="M" />
        </div>
        <div className="mt-3 text-xs text-gray-600 max-w-[320px] break-all text-center">
          {fullUrl}
        </div>
      </div>
    </div>
  );
}
