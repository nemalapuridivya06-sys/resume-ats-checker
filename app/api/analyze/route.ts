import { NextRequest, NextResponse } from 'next/server';
import { runAnalysis } from '../../../lib/analysis';
import { normalizeText } from '../../../lib/analysis/normalize';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, jd } = body;

    if (!resume || !jd) {
      return NextResponse.json(
        { error: 'Both resume and jd fields are required.' },
        { status: 400 }
      );
    }

    const normalizedResume = normalizeText(resume);
    const normalizedJd = normalizeText(jd);

    const result = runAnalysis(normalizedResume, normalizedJd);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Analysis failed.' },
      { status: 500 }
    );
  }
}
