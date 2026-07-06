/**
 * Replace smart quotes, dashes, bullets, ellipsis, and exotic spaces with standard ASCII equivalents.
 * Strips zero-width and control characters.
 */
export function normalizeTypography(s: string): string {
  if (!s) return '';
  return s
    // Smart quotes
    .replace(/[\u2018\u2019\u201A\u201B\u2039\u203A]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"')
    // Dashes
    .replace(/[\u2013]/g, '--') // en dash
    .replace(/[\u2014]/g, '---') // em dash
    // Bullets / middots
    .replace(/[\u2022\u2023\u25E6\u2043\u2219\u00B7]/g, '-')
    // Ellipsis
    .replace(/[\u2026]/g, '...')
    // Exotic spaces (NBSP, EN SPACE, EM SPACE, etc.)
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    // Zero-width spaces, joiners, BOM
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Other control chars
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Normalizes typography then drops any character above U+00FF.
 * Crucial for pdf-lib standard fonts and pdflatex.
 */
export function toLatin1Safe(s: string): string {
  if (!s) return '';
  const normalized = normalizeTypography(s);
  let safe = '';
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    if (code <= 0x00FF) {
      safe += normalized[i];
    }
  }
  return safe;
}
