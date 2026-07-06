import { KNOWN_SKILLS } from '../data/skills';
import { STRONG_VERBS } from '../data/verbs';
import { VAGUE_PHRASES } from '../data/phrases';
import { findProjectsSection } from './sections';

export interface ProjectScore {
  title: string;
  body: string;
  score: number;
  issues: string[];
  rewrite: string;
}

interface RawProject {
  title: string;
  bodyLines: string[];
}

/**
 * Escape regex special chars.
 */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Split the projects section text into individual projects.
 * A blank line ends the current project.
 * A line is a TITLE if there is no current project AND it is < 60 chars
 * AND has <= 8 words AND is not a full multi-sentence line.
 */
function splitProjects(sectionText: string): RawProject[] {
  const lines = sectionText.split('\n');
  const projects: RawProject[] = [];
  let current: RawProject | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // A blank line ends the current project
    if (!trimmed) {
      if (current) {
        projects.push(current);
        current = null;
      }
      continue;
    }

    // Check if this is a title line
    const isMultiSentence = (trimmed.match(/\.\s+[A-Z]/g) || []).length >= 1;
    const wordCount = trimmed.split(/\s+/).length;
    const isTitle = !current && trimmed.length < 60 && wordCount <= 8 && !isMultiSentence;

    if (isTitle) {
      current = { title: trimmed, bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(trimmed);
    } else {
      // Line is not a title and there's no current project — start one with empty title
      current = { title: trimmed, bodyLines: [] };
    }
  }

  // Don't forget the last project
  if (current) {
    projects.push(current);
  }

  return projects;
}

/**
 * Score a project body. Start at 100, subtract for each rule.
 */
export function scoreProject(body: string): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];
  const bodyLower = body.toLowerCase();

  // No strong verb
  const hasStrongVerb = STRONG_VERBS.some((verb) => {
    const regex = new RegExp(`\\b${escapeRegex(verb)}\\b`, 'i');
    return regex.test(bodyLower);
  });
  if (!hasStrongVerb) {
    score -= 20;
    issues.push('Start with a strong action verb.');
  }

  // No digit and no "%"
  if (!/\d/.test(body) && !/%/.test(body)) {
    score -= 25;
    issues.push('Add a quantified result (numbers, %).');
  }

  // No known skill
  const hasSkill = KNOWN_SKILLS.some((skill) => {
    const escaped = escapeRegex(skill);
    const regex = new RegExp(`(?:^|\\b|\\s|[,;:.()])?${escaped}(?:$|\\b|\\s|[,;:.()])?`, 'i');
    return regex.test(body);
  });
  if (!hasSkill) {
    score -= 20;
    issues.push('Name the technologies you used.');
  }

  // Vague phrases present
  const hasVague = VAGUE_PHRASES.some((phrase) => bodyLower.includes(phrase.toLowerCase()));
  if (hasVague) {
    score -= 15;
    issues.push('Replace vague phrasing with specifics.');
  }

  // Body too short
  if (body.length < 60) {
    score -= 20;
    issues.push('Add more detail.');
  }

  // Clamp to 0..100
  score = Math.max(0, Math.min(100, score));

  return { score, issues };
}

/**
 * Find projects section, split, score, return array + projAvg.
 */
export function findAndScoreProjects(resumeText: string): {
  projects: ProjectScore[];
  projAvg: number;
} {
  const sectionText = findProjectsSection(resumeText);

  if (!sectionText) {
    return { projects: [], projAvg: 40 };
  }

  const rawProjects = splitProjects(sectionText);

  // Keep only projects whose body length > 10
  const validProjects = rawProjects.filter(
    (p) => p.bodyLines.join(' ').length > 10
  );

  const projects: ProjectScore[] = validProjects.map((p) => {
    const body = p.bodyLines.join(' ');
    const { score, issues } = scoreProject(body);
    return {
      title: p.title,
      body,
      score,
      issues,
      rewrite: '', // Phase 1: no rewrites
    };
  });

  const projAvg =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length)
      : 40;

  return { projects, projAvg };
}
