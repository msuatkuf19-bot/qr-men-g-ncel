/**
 * Türkiye telefon numarasını WhatsApp formatına (90XXXXXXXXXX) normalize eder
 * 
 * @param input - Ham telefon numarası (herhangi formatta)
 * @returns 12 haneli rakam string (90 ile başlar) veya null (geçersizse)
 * 
 * @example
 * normalizeTRPhoneToWaDigits("05063400639")      // "905063400639"
 * normalizeTRPhoneToWaDigits("5063400639")       // "905063400639"
 * normalizeTRPhoneToWaDigits("+90 (506) 340 0639") // "905063400639"
 * normalizeTRPhoneToWaDigits("0090 506 340 0639")  // "905063400639"
 * normalizeTRPhoneToWaDigits("abc")              // null
 */
export function normalizeTRPhoneToWaDigits(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // 1) Rakam olmayanları temizle
  let digits = input.replace(/\D/g, '');

  // 2) Boş veya çok kısa ise geçersiz
  if (digits.length < 10) {
    return null;
  }

  // 3) Baştaki 00 varsa kaldır (uluslararası format: 0090...)
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // 4) 90 ile başlıyorsa - zaten doğru formatta
  if (digits.startsWith('90') && digits.length === 12) {
    return digits;
  }

  // 5) 0 ile başlıyorsa - Türkiye yerel format (0506...)
  if (digits.startsWith('0') && digits.length === 11) {
    digits = '90' + digits.slice(1);
    return digits;
  }

  // 6) 10 haneli ise (506...) - başına 90 ekle
  if (digits.length === 10 && !digits.startsWith('0')) {
    digits = '90' + digits;
    return digits;
  }

  // 7) 90 ile başlıyor ama 12 haneden farklı - düzelt
  if (digits.startsWith('90') && digits.length > 12) {
    // Fazla rakam var, ilk 12'yi al
    digits = digits.slice(0, 12);
    return digits;
  }

  // 8) Son kontrol - 12 hane ve 90 ile başlamalı
  if (digits.length === 12 && digits.startsWith('90')) {
    return digits;
  }

  // Geçersiz numara
  return null;
}

/**
 * WhatsApp demo mesajı oluşturur
 * 
 * @param fullName - Müşteri adı soyadı
 * @param restaurantName - Restoran adı
 * @returns Hazır mesaj metni
 */
export function buildDemoWhatsAppMessage(fullName?: string | null, restaurantName?: string | null): string {
  const name = fullName?.trim();
  const restaurant = restaurantName?.trim();

  if (name || restaurant) {
    let greeting = 'Merhaba';
    if (name) {
      greeting += ` ${name}`;
    }
    if (restaurant) {
      greeting += name ? `, ${restaurant}` : ` ${restaurant}`;
    }
    return `${greeting}. QR Menü demo talebiniz için yazıyorum. Uygun olduğunuzda kısaca görüşebilir miyiz?`;
  }

  return 'Merhaba, QR Menü demo talebiniz için yazıyorum. Uygun olduğunuzda kısaca görüşebilir miyiz?';
}

/**
 * WhatsApp URL'i oluşturur
 * 
 * @param phone - Telefon numarası
 * @param message - Gönderilecek mesaj
 * @returns WhatsApp URL veya null
 */
export function buildWhatsAppUrl(phone: string, message: string): string | null {
  const digits = normalizeTRPhoneToWaDigits(phone);
  if (!digits) {
    return null;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
