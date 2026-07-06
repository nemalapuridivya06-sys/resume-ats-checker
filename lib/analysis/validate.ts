import { isSectionHeader } from './sections';

/**
 * Input validation — return {kind, message} or null.
 *
 * "not-a-resume": resume < 200 chars OR none of (an email, or any section header).
 * "resume-is-job-description": resume contains 2+ JD-like phrases.
 */
export function validateInput(
  resume: string
): { kind: 'not-a-resume' | 'resume-is-job-description'; message: string } | null {
  // Check for job description first
  const jdPhrases = [
    'we are looking for',
    'responsibilities',
    'requirements',
    'you will',
    'the ideal candidate',
    'apply now',
  ];
  const jdMatches = jdPhrases.filter((phrase) =>
    resume.toLowerCase().includes(phrase)
  );
  if (jdMatches.length >= 2) {
    return {
      kind: 'resume-is-job-description',
      message: "This looks like a job description, not a resume.",
    };
  }

  // Check for not-a-resume
  const hasEmail = /@/.test(resume);
  const lines = resume.split('\n');
  const hasAnyHeader = lines.some((line) => isSectionHeader(line.trim()));

  if (resume.length < 200 || (!hasEmail && !hasAnyHeader)) {
    return {
      kind: 'not-a-resume',
      message: "This doesn't look like a resume. Paste your full resume text.",
    };
  }

  return null;
}
