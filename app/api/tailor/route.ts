import { NextRequest, NextResponse } from 'next/server';
import { tailorResumeWithLLM } from '../../../lib/llm/tailor-resume';
import { deterministicTailor } from '../../../lib/analysis/tailor-fallback';
import { tailoredToText, countPlaceholders } from '../../../lib/tailor/serialize';
import { buildDocx } from '../../../lib/docx/build';
import { buildPdf } from '../../../lib/pdf/build';
import { buildLatex } from '../../../lib/latex/build';
import { runAnalysis } from '../../../lib/analysis';
import { TailorResponse, TailoredResume, TailorScore } from '../../../types/tailored';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function extractMissingKeywords(resume: string, jd: string): string[] {
  const analysis = runAnalysis(resume, jd);
  return analysis.missing;
}

function extractScores(resumeText: string, jd: string): TailorScore {
  const analysis = runAnalysis(resumeText, jd);
  return {
    composite: analysis.composite,
    matchScore: analysis.matchScore,
    projAvg: analysis.projAvg,
    formatScore: analysis.formatScore,
    matchedCount: analysis.matched.length,
    missingCount: analysis.missing.length,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { resume, jd } = await req.json();

    if (!resume || !jd) {
      return NextResponse.json({ error: 'Missing resume or jd' }, { status: 400 });
    }

    // 1. Tailor Resume
    let mode: 'llm' | 'fallback' = 'llm';
    let tailored: TailoredResume | null = await tailorResumeWithLLM(resume, jd);

    if (!tailored) {
      mode = 'fallback';
      const missingKeywords = extractMissingKeywords(resume, jd);
      tailored = deterministicTailor(resume, missingKeywords);
    }

    // 2. Build Exports
    let docxBase64: string | null = null;
    let pdfBase64: string | null = null;
    let latex: string | null = null;

    try { docxBase64 = await buildDocx(tailored); } catch (e) { console.error('DOCX error', e); }
    try { pdfBase64 = await buildPdf(tailored); } catch (e) { console.error('PDF error', e); }
    try { latex = buildLatex(tailored); } catch (e) { console.error('LaTeX error', e); }

    // 3. Scores before and after
    const before = extractScores(resume, jd);
    const after = extractScores(tailoredToText(tailored), jd);

    // 4. Filename base and placeholders
    const safeName = (tailored.name || 'Unknown').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const filenameBase = `${safeName}_tailored`;
    const placeholders = countPlaceholders(tailored);

    const response: TailorResponse = {
      mode,
      tailored,
      filenameBase,
      exports: { docxBase64, pdfBase64, latex },
      placeholders,
      before,
      after,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Tailor API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
