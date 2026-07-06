/**
 * normalizeText: convert CRLF/CR to \n, collapse 3+ blank lines to 2,
 * trim trailing spaces on each line, trim the whole string.
 */
export function normalizeText(s: string): string {
  // Convert CRLF and CR to LF
  let result = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Collapse 3+ consecutive blank lines to 2
  result = result.replace(/\n{3,}/g, '\n\n');

  // Trim trailing spaces on each line
  result = result
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n');

  // Trim the whole string
  result = result.trim();

  return result;
}
