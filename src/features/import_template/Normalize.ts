export const capitalize = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    // majuscule après début, espace, tiret ou apostrophe : "jean-pierre" → "Jean-Pierre"
    .replace(/(^|[\s'’-])(\p{L})/gu, (_, sep, l) => sep + l.toUpperCase());

export const normalizeEmail = (s: string): string => s.trim().toLowerCase();

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;