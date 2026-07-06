import { TailoredResume } from '../../types/tailored';

export function tailoredToText(r: TailoredResume): string {
  const parts: string[] = [];

  parts.push(r.name);
  
  const contactLine = [
    r.contact.email,
    r.contact.phone,
    r.contact.location,
    r.contact.linkedin,
    r.contact.github,
    r.contact.website
  ].filter(Boolean).join(' | ');
  
  if (contactLine) {
    parts.push(contactLine);
  }
  
  parts.push('');

  if (r.summary) {
    parts.push('SUMMARY');
    parts.push(r.summary);
    parts.push('');
  }

  if (r.skills && r.skills.length > 0) {
    parts.push('SKILLS');
    parts.push(r.skills.join(', '));
    parts.push('');
  }

  if (r.experience && r.experience.length > 0) {
    parts.push('EXPERIENCE');
    for (const exp of r.experience) {
      parts.push(`${exp.title} at ${exp.company} ${exp.dates ? '(' + exp.dates + ')' : ''}`);
      for (const b of exp.bullets) {
        parts.push(`- ${b}`);
      }
      parts.push('');
    }
  }

  if (r.projects && r.projects.length > 0) {
    parts.push('PROJECTS');
    for (const proj of r.projects) {
      parts.push(proj.title);
      for (const b of proj.bullets) {
        parts.push(`- ${b}`);
      }
      parts.push('');
    }
  }

  if (r.education && r.education.length > 0) {
    parts.push('EDUCATION');
    for (const ed of r.education) {
      parts.push(`${ed.degree} ${ed.school ? 'at ' + ed.school : ''} ${ed.dates ? '(' + ed.dates + ')' : ''}`);
      if (ed.details) {
        parts.push(ed.details);
      }
      parts.push('');
    }
  }

  return parts.join('\n');
}

export function countPlaceholders(r: TailoredResume): number {
  const text = tailoredToText(r);
  const matches = text.match(/\[.*?\]/g);
  return matches ? matches.length : 0;
}
