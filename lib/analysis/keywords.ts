import { KNOWN_SKILLS } from '../data/skills';

/**
 * Escape regex special chars so skills like "c++", "c#", "node.js" work.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a regex to test whether `skill` appears as a whole token in text.
 * For single-letter or ambiguous skills, require word boundaries.
 */
function skillRegex(skill: string): RegExp {
  const escaped = escapeRegex(skill);
  // Use word boundaries for all skills to ensure whole-token matching
  return new RegExp(`(?:^|\\b|\\s|[,;:.()])${escaped}(?:$|\\b|\\s|[,;:.()])?`, 'i');
}

/**
 * Check if a skill appears in text as a whole token (case-insensitive).
 */
function skillAppearsInText(skill: string, text: string): boolean {
  return skillRegex(skill).test(text);
}

export interface KeywordResult {
  required: string[];
  matched: string[];
  missing: string[];
  matchScore: number;
}

/**
 * Match keywords between resume and JD.
 * - required = KNOWN_SKILLS that appear in the JD
 * - matched = required that also appear in the resume
 * - missing = required minus matched
 * - matchScore = required.length === 0 ? 60 : round(matched/required * 100)
 */
export function matchKeywords(resume: string, jd: string): KeywordResult {
  const resumeLower = resume.toLowerCase();
  const jdLower = jd.toLowerCase();

  const required = KNOWN_SKILLS.filter((skill) => skillAppearsInText(skill, jdLower));
  const matched = required.filter((skill) => skillAppearsInText(skill, resumeLower));
  const missing = required.filter((skill) => !matched.includes(skill));

  const matchScore =
    required.length === 0 ? 60 : Math.round((matched.length / required.length) * 100);

  return { required, matched, missing, matchScore };
}
