'use client';

import { useState } from 'react';
import { TailorResponse } from '../types/tailored';

interface TailorCTAProps {
  resumeText: string;
  jdText: string;
}

export default function TailorCTA({ resumeText, jdText }: TailorCTAProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [tailorResult, setTailorResult] = useState<TailorResponse | null>(null);
  const [error, setError] = useState('');

  const handleTailor = async () => {
    setIsLoading(true);
    setError('');
    setTailorResult(null);

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeText, jd: jdText }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Tailoring failed.');
        return;
      }

      setTailorResult(data as TailorResponse);
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (base64: string, filename: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  const handleOverleaf = (latex: string) => {
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    form.style.display = 'none';

    const snipInput = document.createElement('input');
    snipInput.type = 'hidden';
    snipInput.name = 'encoded_snip';
    snipInput.value = encodeURIComponent(latex);
    
    const engineInput = document.createElement('input');
    engineInput.type = 'hidden';
    engineInput.name = 'engine';
    engineInput.value = 'pdflatex';

    form.appendChild(snipInput);
    form.appendChild(engineInput);
    document.body.appendChild(form);
    
    form.submit();
    
    // cleanup
    setTimeout(() => document.body.removeChild(form), 1000);
  };

  const handleDownloadTex = (latex: string, filename: string) => {
    const blob = new Blob([latex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };

  return (
    <div className="mt-8 bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wide border border-indigo-500/20">
          Phase 2
        </span>
      </div>

      {!tailorResult && (
        <div className="text-center py-6">
          <h2 className="text-2xl font-bold text-white mb-3">Want a higher score?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto">
            Let our intelligent tailoring engine rewrite your resume to better match this job description, insert missing keywords, and format it for ATS success.
          </p>
          <button
            onClick={handleTailor}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Tailoring in progress...' : 'Tailor My Resume'}
          </button>
          {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
        </div>
      )}

      {tailorResult && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Tailoring Complete! 🎉
                {tailorResult.mode === 'fallback' && (
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-normal" title="No Groq API Key found. Used deterministic fallback.">Fallback Mode</span>
                )}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Your resume has been rewritten to target this role.
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-center">
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Before</div>
                <div className="text-xl font-bold text-slate-300">{tailorResult.before.composite}</div>
              </div>
              <div className="text-slate-600">→</div>
              <div className="text-center">
                <div className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">After</div>
                <div className="text-2xl font-bold text-indigo-400">{tailorResult.after.composite}</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex justify-between items-center">
              <span>Preview & Placeholders</span>
              {tailorResult.placeholders > 0 && (
                <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-medium border border-amber-500/20">
                  {tailorResult.placeholders} placeholder{tailorResult.placeholders !== 1 ? 's' : ''} to fill
                </span>
              )}
            </h4>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {tailorResult.tailored.summary && (
                <div>
                  <h5 className="text-xs font-bold text-slate-500 mb-1">SUMMARY</h5>
                  <p className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: tailorResult.tailored.summary.replace(/\\[(.*?)\\]/g, '<span class="bg-amber-500/20 text-amber-300 px-1 rounded">[$1]</span>') }} />
                </div>
              )}
              {tailorResult.tailored.experience?.map((exp, i) => (
                <div key={i}>
                  <h5 className="text-xs font-bold text-slate-500 mb-1">{exp.title} - {exp.company}</h5>
                  <ul className="list-disc pl-5 space-y-1">
                    {exp.bullets.map((b, j) => (
                      <li key={j} className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: b.replace(/\\[(.*?)\\]/g, '<span class="bg-amber-500/20 text-amber-300 px-1 rounded">[$1]</span>') }} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Export Options</h4>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => tailorResult.exports.docxBase64 && handleDownload(tailorResult.exports.docxBase64, `${tailorResult.filenameBase}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
                disabled={!tailorResult.exports.docxBase64}
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 transition-colors disabled:opacity-50"
              >
                Word (.docx)
              </button>
              
              <button
                onClick={() => tailorResult.exports.pdfBase64 && handleDownload(tailorResult.exports.pdfBase64, `${tailorResult.filenameBase}.pdf`, 'application/pdf')}
                disabled={!tailorResult.exports.pdfBase64}
                className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-rose-600/20 text-rose-400 border border-rose-600/30 hover:bg-rose-600/30 transition-colors disabled:opacity-50"
              >
                PDF
              </button>

              <button
                onClick={() => tailorResult.exports.latex && handleOverleaf(tailorResult.exports.latex)}
                disabled={!tailorResult.exports.latex}
                className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
              >
                Open in Overleaf
              </button>

              {tailorResult.exports.latex && (
                <button
                  onClick={() => handleDownloadTex(tailorResult.exports.latex!, `${tailorResult.filenameBase}.tex`)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  title="Download .tex file"
                >
                  .tex
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
