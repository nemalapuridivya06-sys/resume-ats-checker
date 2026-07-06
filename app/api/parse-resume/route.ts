import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { normalizeText } from '../../../lib/analysis/normalize';

export const runtime = 'nodejs';

// Force dynamic rendering to prevent prerendering issues with pdf-parse
export const dynamic = 'force-dynamic';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

async function parsePdf(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid ES module __dirname issues during build
  const pdfParse = (await import('pdf-parse')).default;
  const result = await pdfParse(buffer);
  return result.text;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded.' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    // Check file extension
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only .pdf and .docx files are supported.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (name.endsWith('.pdf')) {
      text = await parsePdf(buffer);
    } else {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    text = normalizeText(text);

    // Detect garbled output
    let warning: string | undefined;
    if (text.length < 200 || !/(EDUCATION|PROJECTS|EXPERIENCE|SKILLS)/i.test(text)) {
      warning = 'parser_garbled';
    }

    return NextResponse.json({ text, warning });
  } catch (error) {
    console.error('Parse resume error:', error);
    return NextResponse.json(
      { error: 'Failed to parse file.' },
      { status: 500 }
    );
  }
}
