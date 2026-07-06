/**
 * Format scoring:
 * - hasContact = /@/.test(resume) && /\d{3}/.test(resume)
 * - hasSections = /education/i.test(resume) && /(skills|experience|projects)/i.test(resume)
 * - formatScore = (hasContact ? 50 : 20) + (hasSections ? 50 : 20)
 */

export interface FormatResult {
  hasContact: boolean;
  hasSections: boolean;
  formatScore: number;
}

export function analyzeFormat(resume: string): FormatResult {
  const hasContact = /@/.test(resume) && /\d{3}/.test(resume);
  const hasSections =
    /education/i.test(resume) && /(skills|experience|projects)/i.test(resume);
  const formatScore = (hasContact ? 50 : 20) + (hasSections ? 50 : 20);

  return { hasContact, hasSections, formatScore };
}
