import { TailoredResume } from '../../types/tailored';

export function deterministicTailor(resume: string, missingKeywords: string[]): TailoredResume {
  const lines = resume.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract Name (first non-empty line usually)
  let name = lines.length > 0 ? lines[0] : 'Unknown';

  // Contact info
  const emailMatch = resume.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = resume.match(/(\+?\d{1,2}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const githubMatch = resume.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = resume.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  
  const contact: any = {};
  if (emailMatch) contact.email = emailMatch[0];
  if (phoneMatch) contact.phone = phoneMatch[0];
  if (githubMatch) contact.github = githubMatch[0];
  if (linkedinMatch) contact.linkedin = linkedinMatch[0];

  // Very naive section parsing for fallback
  const skills: string[] = [];
  const projects: { title: string; bullets: string[] }[] = [];
  const experience: { title: string; company: string; dates: string; bullets: string[] }[] = [];
  const education: { degree: string; school: string; dates: string; details: string }[] = [];
  
  let currentSection = '';
  let currentItem: any = null;

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper === 'SKILLS' || upper.includes('TECHNICAL SKILLS')) {
      currentSection = 'SKILLS';
      continue;
    } else if (upper === 'PROJECTS' || upper.includes('PERSONAL PROJECTS')) {
      currentSection = 'PROJECTS';
      continue;
    } else if (upper === 'EXPERIENCE' || upper.includes('WORK EXPERIENCE')) {
      currentSection = 'EXPERIENCE';
      continue;
    } else if (upper === 'EDUCATION') {
      currentSection = 'EDUCATION';
      continue;
    }

    if (currentSection === 'SKILLS') {
      // split by comma or bullets
      const parsedSkills = line.split(/[,|•]/).map(s => s.trim()).filter(Boolean);
      skills.push(...parsedSkills);
    } else if (currentSection === 'PROJECTS') {
      if (!line.startsWith('-') && !line.startsWith('•')) {
        currentItem = { title: line, bullets: [] };
        projects.push(currentItem);
      } else if (currentItem) {
        currentItem.bullets.push(rewriteBullet(line.substring(1).trim()));
      }
    } else if (currentSection === 'EXPERIENCE') {
      if (!line.startsWith('-') && !line.startsWith('•')) {
        if (!currentItem || currentItem.bullets) {
          // crude heuristic: split by at or comma
          const parts = line.split(/ at |,| - /i);
          currentItem = { title: parts[0]?.trim() || line, company: parts[1]?.trim() || '', dates: '', bullets: [] };
          experience.push(currentItem);
        }
      } else if (currentItem) {
        currentItem.bullets.push(rewriteBullet(line.substring(1).trim()));
      }
    } else if (currentSection === 'EDUCATION') {
      if (education.length === 0) {
        education.push({ degree: line, school: '', dates: '', details: '' });
      } else if (!education[0].school) {
        education[0].school = line;
      }
    }
  }

  // Weave in missing keywords to skills
  for (const missing of missingKeywords) {
    if (!skills.some(s => s.toLowerCase() === missing.toLowerCase())) {
      skills.push(missing);
    }
  }

  return {
    name,
    contact,
    skills: Array.from(new Set(skills)), // deduplicate
    projects,
    experience,
    education
  };
}

function rewriteBullet(bullet: string): string {
  // A crude XYZ rewrite fallback
  const firstWord = bullet.split(' ')[0];
  const strongVerbs = ['Built', 'Designed', 'Shipped', 'Optimized', 'Engineered', 'Developed', 'Created'];
  
  if (strongVerbs.includes(firstWord)) {
    return bullet + ' resulting in [metric] improvement.';
  }
  return `Engineered solution for ${bullet.toLowerCase()}, measured by [metric].`;
}
