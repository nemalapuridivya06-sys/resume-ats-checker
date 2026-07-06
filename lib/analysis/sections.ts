/**
 * Section headers and section extraction logic.
 */

const KNOWN_HEADERS = [
  'summary',
  'objective',
  'education',
  'experience',
  'work experience',
  'professional experience',
  'skills',
  'technical skills',
  'projects',
  'project',
  'certifications',
  'certificates',
  'awards',
  'publications',
  'interests',
  'hobbies',
  'references',
  'volunteer',
  'activities',
  'languages',
];

/**
 * A section header = a known header word (case-insensitive match)
 * OR an ALL-CAPS line of 3+ chars.
 */
export function isSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Check known headers (case-insensitive, exact match of trimmed line)
  if (KNOWN_HEADERS.some((h) => trimmed.toLowerCase() === h)) return true;

  // Check ALL-CAPS line of 3+ chars (only letters, spaces, and common punctuation)
  if (trimmed.length >= 3 && /^[A-Z\s&/,\-:]+$/.test(trimmed) && /[A-Z]{3,}/.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Find the "Projects" section: everything under a line whose text
 * is a section header matching /^projects?$/i, up to the next section header.
 */
export function findProjectsSection(text: string): string | null {
  const lines = text.split('\n');
  let inProjects = false;
  const projectLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^projects?$/i.test(trimmed)) {
      inProjects = true;
      continue;
    }

    if (inProjects) {
      if (isSectionHeader(trimmed)) {
        break;
      }
      projectLines.push(line);
    }
  }

  if (!inProjects) return null;

  return projectLines.join('\n');
}
