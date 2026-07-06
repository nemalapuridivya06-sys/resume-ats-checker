'use client';

import { useState } from 'react';
import InputForm from '../components/InputForm';
import ScoreCard from '../components/ScoreCard';
import TailorCTA from '../components/TailorCTA';
import { AnalysisResult } from '../types/analysis';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');

  const handleAnalyze = async (resume: string, jd: string) => {
    setJdText(jd);
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jd }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed.');
        return;
      }

      setResult(data as AnalysisResult);
    } catch {
      setError('Failed to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/3 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Phase 2 — AI-Powered Tailoring
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight">
            Resume ATS Checker
          </h1>
          <p className="mt-3 text-slate-400 text-lg max-w-2xl mx-auto">
            Paste your resume and a job description to get an instant ATS compatibility score with
            actionable feedback.
          </p>
        </header>

        {/* Input Form */}
        <section className="mb-10">
          <InputForm
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            resumeText={resumeText}
            setResumeText={setResumeText}
          />
        </section>

        {/* Error */}
        {error && (
          <div className="mb-8 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <section className="mb-16">
            <ScoreCard result={result} />
            <TailorCTA resumeText={resumeText} jdText={jdText} />
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-slate-600 text-xs pt-8 border-t border-slate-800/50">
          <p>Resume ATS Checker · Phase 2 · Deterministic Analysis + AI Tailoring</p>
        </footer>
      </div>
    </div>
  );
}
