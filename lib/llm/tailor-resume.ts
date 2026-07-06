import { groqChat } from './client';
import { TailoredResume } from '../../types/tailored';

const SYSTEM_PROMPT = `
You are a resume tailoring assistant. Your job is to take an existing resume and a
target job description, then produce a NEW resume that:
1. Aligns terminology with the job description (using the JD's preferred phrasing for skills the candidate already has)
2. Reorders and emphasizes content most relevant to the role
3. Rewrites every project and experience bullet in the XYZ format ("Accomplished X by doing Y, measured by Z") — start each with a strong action verb (Built, Designed, Shipped, Optimized, Engineered, etc.)
4. Includes quantified outcomes wherever the original suggests them — and uses [bracketed placeholders] when the candidate must fill in a real number
5. Weaves in keywords from the job description ONLY where the candidate plausibly has the skill — never invent expertise

You MUST respond with strict JSON only, no markdown, no prose. The JSON must match the TailoredResume interface exactly.
`.trim();

export async function tailorResumeWithLLM(resume: string, jd: string): Promise<TailoredResume | null> {
  const userMessage = `ORIGINAL RESUME:\n${resume}\n\nTARGET JOB DESCRIPTION:\n${jd.slice(0, 4000)}\n\nProduce the tailored resume now as strict JSON matching the TailoredResume interface. No preamble, no markdown fences.`;

  const content = await groqChat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    json: true,
    maxTokens: 2500,
    temperature: 0.3,
  });

  if (!content) {
    return null;
  }

  try {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(cleanContent);

    // Coerce into TailoredResume
    const tailored: TailoredResume = {
      name: parsed.name || 'Unknown',
      contact: parsed.contact || {},
      summary: parsed.summary || '',
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    };

    return tailored;
  } catch (error) {
    return null;
  }
}
