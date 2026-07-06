import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { TailoredResume } from '../../types/tailored';

export async function buildDocx(resume: TailoredResume): Promise<string> {
  const children: any[] = [];

  // Name
  children.push(
    new Paragraph({
      text: resume.name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  // Contact
  const contactLine = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github,
    resume.contact.website,
  ]
    .filter(Boolean)
    .join(' | ');

  if (contactLine) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: contactLine, size: 20 })],
        alignment: AlignmentType.CENTER,
      })
    );
    children.push(new Paragraph({ text: '' })); // empty line
  }

  // Summary
  if (resume.summary) {
    children.push(
      new Paragraph({
        text: 'SUMMARY',
        heading: HeadingLevel.HEADING_2,
      })
    );
    children.push(new Paragraph({ text: resume.summary }));
    children.push(new Paragraph({ text: '' }));
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    children.push(
      new Paragraph({
        text: 'SKILLS',
        heading: HeadingLevel.HEADING_2,
      })
    );
    children.push(new Paragraph({ text: resume.skills.join(', ') }));
    children.push(new Paragraph({ text: '' }));
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    children.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_2,
      })
    );
    for (const exp of resume.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true }),
            new TextRun({ text: ` at ${exp.company}` }),
            new TextRun({ text: exp.dates ? ` (${exp.dates})` : '', italics: true }),
          ],
        })
      );
      for (const bullet of exp.bullets) {
        children.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
          })
        );
      }
      children.push(new Paragraph({ text: '' }));
    }
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    children.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_2,
      })
    );
    for (const proj of resume.projects) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: proj.title, bold: true })],
        })
      );
      for (const bullet of proj.bullets) {
        children.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
          })
        );
      }
      children.push(new Paragraph({ text: '' }));
    }
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    children.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_2,
      })
    );
    for (const ed of resume.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: ed.degree, bold: true }),
            new TextRun({ text: ed.school ? ` at ${ed.school}` : '' }),
            new TextRun({ text: ed.dates ? ` (${ed.dates})` : '', italics: true }),
          ],
        })
      );
      if (ed.details) {
        children.push(new Paragraph({ text: ed.details }));
      }
      children.push(new Paragraph({ text: '' }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer.toString('base64');
}
