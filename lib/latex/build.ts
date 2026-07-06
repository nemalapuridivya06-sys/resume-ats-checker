import { TailoredResume } from '../../types/tailored';
import { toLatin1Safe } from '../text/sanitize';

function escapeLatex(s: string): string {
  if (!s) return '';
  // Single pass replace to avoid double escaping
  const regex = /([\\{}#%&_^$~])/g;
  return s.replace(regex, (match) => {
    switch (match) {
      case '\\\\': return '\\\\textbackslash{}';
      case '{': return '\\\\{';
      case '}': return '\\\\}';
      case '$': return '\\\$';
      case '&': return '\\\\&';
      case '#': return '\\\\#';
      case '%': return '\\\\%';
      case '_': return '\\\\_';
      case '~': return '\\\\textasciitilde{}';
      case '^': return '\\\\textasciicircum{}';
      default: return match;
    }
  });
}

function processText(s: string): string {
  return escapeLatex(toLatin1Safe(s));
}

function processBullet(s: string): string {
  const processed = processText(s);
  // Guard against bullet starting with '[' which latex \item reads as label
  if (processed.startsWith('[')) {
    return '{}' + processed;
  }
  return processed;
}

export function buildLatex(resume: TailoredResume): string {
  const parts: string[] = [];

  parts.push(`\\documentclass[11pt,letterpaper]{article}`);
  parts.push(`\\usepackage[margin=1in]{geometry}`);
  parts.push(`\\usepackage[T1]{fontenc}`);
  parts.push(`\\usepackage[utf8]{inputenc}`);
  parts.push(`\\usepackage{lmodern}`);
  parts.push(`\\usepackage{parskip}`);
  parts.push(`\\usepackage{enumitem}`);
  parts.push(`\\usepackage{titlesec}`);
  parts.push(`\\usepackage[hidelinks]{hyperref}`);
  
  parts.push('');
  parts.push(`\\titleformat{\\section}{\\Large\\bfseries}{\\thesection}{1em}{}[\\titlerule]`);
  parts.push(`\\titlespacing*{\\section}{0pt}{*2}{*1}`);
  parts.push('');
  
  parts.push(`\\begin{document}`);
  parts.push('');
  
  // Name
  parts.push(`\\begin{center}`);
  parts.push(`{\\Huge \\textbf{${processText(resume.name)}}}\\\\[0.5em]`);
  
  // Contact
  const contactLines = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github,
    resume.contact.website,
  ].filter((s): s is string => Boolean(s)).map(processText);

  if (contactLines.length > 0) {
    parts.push(contactLines.join(' $|$ '));
  }
  parts.push(`\\end{center}`);
  parts.push('');

  // Summary
  if (resume.summary) {
    parts.push(`\\section*{SUMMARY}`);
    parts.push(processText(resume.summary));
    parts.push('');
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    parts.push(`\\section*{SKILLS}`);
    parts.push(processText(resume.skills.join(', ')));
    parts.push('');
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    parts.push(`\\section*{EXPERIENCE}`);
    for (const exp of resume.experience) {
      parts.push(`\\noindent \\textbf{${processText(exp.title)}} at ${processText(exp.company)} \\hfill \\textit{${processText(exp.dates || '')}}`);
      if (exp.bullets && exp.bullets.length > 0) {
        parts.push(`\\begin{itemize}[leftmargin=*,nosep]`);
        for (const bullet of exp.bullets) {
          parts.push(`  \\item ${processBullet(bullet)}`);
        }
        parts.push(`\\end{itemize}`);
      }
      parts.push('');
    }
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    parts.push(`\\section*{PROJECTS}`);
    for (const proj of resume.projects) {
      parts.push(`\\noindent \\textbf{${processText(proj.title)}}`);
      if (proj.bullets && proj.bullets.length > 0) {
        parts.push(`\\begin{itemize}[leftmargin=*,nosep]`);
        for (const bullet of proj.bullets) {
          parts.push(`  \\item ${processBullet(bullet)}`);
        }
        parts.push(`\\end{itemize}`);
      }
      parts.push('');
    }
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    parts.push(`\\section*{EDUCATION}`);
    for (const ed of resume.education) {
      parts.push(`\\noindent \\textbf{${processText(ed.degree)}} ${ed.school ? 'at ' + processText(ed.school) : ''} \\hfill \\textit{${processText(ed.dates || '')}}`);
      if (ed.details) {
        parts.push(`\\\\[0.2em] ${processText(ed.details)}`);
      }
      parts.push('');
    }
  }

  parts.push(`\\end{document}`);
  return parts.join('\n');
}
