/**
 * Lifts: array of { desc, sub, gain }
 * - If missing.length > 0: add missing keywords lift
 * - For each project with score < 80: add strengthen project lift
 * - If !hasContact: add contact info lift
 * Sort by gain descending.
 */

interface ProjectInfo {
  title: string;
  score: number;
  issues: string[];
}

export interface Lift {
  desc: string;
  sub: string;
  gain: number;
}

export function computeLifts(
  missing: string[],
  projects: ProjectInfo[],
  hasContact: boolean
): Lift[] {
  const lifts: Lift[] = [];

  if (missing.length > 0) {
    lifts.push({
      desc: 'Add missing keywords',
      sub: missing.slice(0, 5).join(', '),
      gain: 12,
    });
  }

  for (const project of projects) {
    if (project.score < 80) {
      lifts.push({
        desc: `Strengthen "${project.title}"`,
        sub: project.issues[0] || '',
        gain: 8,
      });
    }
  }

  if (!hasContact) {
    lifts.push({
      desc: 'Add contact info',
      sub: 'Include email and phone',
      gain: 10,
    });
  }

  // Sort by gain descending
  lifts.sort((a, b) => b.gain - a.gain);

  return lifts;
}
