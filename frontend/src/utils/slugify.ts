export function slugifyTR(input: string): string {
  const value = (input ?? '').toString().trim().toLowerCase();
  if (!value) return '';

  const trMap: Record<string, string> = {
    'ş': 's',
    'ı': 'i',
    'ç': 'c',
    'ö': 'o',
    'ü': 'u',
    'ğ': 'g',
  };

  const replaced = value
    .split('')
    .map((ch) => trMap[ch] ?? ch)
    .join('');

  // Replace whitespace with '-', remove invalid chars, collapse dashes
  const dashed = replaced
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  return dashed;
}
