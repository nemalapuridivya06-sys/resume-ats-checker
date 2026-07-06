import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TailoredResume } from '../../types/tailored';
import { toLatin1Safe } from '../text/sanitize';

export async function buildPdf(resume: TailoredResume): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  let page = pdfDoc.addPage([612, 792]); // US Letter
  const { width, height } = page.getSize();
  const margin = 54;
  let cursorY = height - margin;

  const drawText = (text: string, font: any, size: number, x: number = margin, align: 'left' | 'center' = 'left') => {
    const safeText = toLatin1Safe(text);
    const textWidth = font.widthOfTextAtSize(safeText, size);
    
    let drawX = x;
    if (align === 'center') {
      drawX = (width - textWidth) / 2;
    }
    
    page.drawText(safeText, { x: drawX, y: cursorY, font, size, color: rgb(0, 0, 0) });
    cursorY -= (size * 1.2);
  };

  const drawWrappedText = (text: string, font: any, size: number, xOffset: number = 0) => {
    const safeText = toLatin1Safe(text);
    const words = safeText.split(' ');
    let line = '';
    const maxWidth = width - margin * 2 - xOffset;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let testLine = line + (line ? ' ' : '') + word;
      let testWidth = font.widthOfTextAtSize(testLine, size);

      if (testWidth > maxWidth) {
        if (!line) {
          // A single word is longer than the line, we have to print it anyway or hard-break.
          // For simplicity, just print it and move down.
          page.drawText(testLine, { x: margin + xOffset, y: cursorY, font, size, color: rgb(0, 0, 0) });
          cursorY -= (size * 1.2);
          line = '';
        } else {
          // Print current line and start new line with the word
          page.drawText(line, { x: margin + xOffset, y: cursorY, font, size, color: rgb(0, 0, 0) });
          cursorY -= (size * 1.2);
          checkPageBreak();
          line = word;
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x: margin + xOffset, y: cursorY, font, size, color: rgb(0, 0, 0) });
      cursorY -= (size * 1.2);
    }
  };

  const checkPageBreak = (needed: number = 20) => {
    if (cursorY < margin + needed) {
      page = pdfDoc.addPage([612, 792]);
      cursorY = height - margin;
    }
  };

  // Name
  drawText(resume.name, fontBold, 20, margin, 'center');
  cursorY -= 4;

  // Contact
  const contactLine = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
    resume.contact.github,
    resume.contact.website,
  ].filter(Boolean).join(' | ');

  if (contactLine) {
    drawText(contactLine, fontRegular, 10, margin, 'center');
  }
  cursorY -= 10;

  // Summary
  if (resume.summary) {
    checkPageBreak(40);
    drawText('SUMMARY', fontBold, 12);
    drawWrappedText(resume.summary, fontRegular, 10);
    cursorY -= 10;
  }

  // Skills
  if (resume.skills && resume.skills.length > 0) {
    checkPageBreak(40);
    drawText('SKILLS', fontBold, 12);
    drawWrappedText(resume.skills.join(', '), fontRegular, 10);
    cursorY -= 10;
  }

  // Experience
  if (resume.experience && resume.experience.length > 0) {
    checkPageBreak(40);
    drawText('EXPERIENCE', fontBold, 12);
    for (const exp of resume.experience) {
      checkPageBreak(30);
      const titleLine = `${exp.title} at ${exp.company} ${exp.dates ? '(' + exp.dates + ')' : ''}`;
      drawText(titleLine, fontBold, 11);
      for (const bullet of exp.bullets) {
        checkPageBreak(15);
        drawWrappedText(`- ${bullet}`, fontRegular, 10, 10);
      }
      cursorY -= 5;
    }
    cursorY -= 5;
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    checkPageBreak(40);
    drawText('PROJECTS', fontBold, 12);
    for (const proj of resume.projects) {
      checkPageBreak(30);
      drawText(proj.title, fontBold, 11);
      for (const bullet of proj.bullets) {
        checkPageBreak(15);
        drawWrappedText(`- ${bullet}`, fontRegular, 10, 10);
      }
      cursorY -= 5;
    }
    cursorY -= 5;
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    checkPageBreak(40);
    drawText('EDUCATION', fontBold, 12);
    for (const ed of resume.education) {
      checkPageBreak(30);
      const titleLine = `${ed.degree} ${ed.school ? 'at ' + ed.school : ''} ${ed.dates ? '(' + ed.dates + ')' : ''}`;
      drawText(titleLine, fontBold, 11);
      if (ed.details) {
        checkPageBreak(15);
        drawWrappedText(ed.details, fontRegular, 10, 10);
      }
      cursorY -= 5;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}
