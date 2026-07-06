'use client';

import { useState, useRef } from 'react';

interface InputFormProps {
  onAnalyze: (resume: string, jd: string) => void;
  isLoading: boolean;
  resumeText: string;
  setResumeText: (text: string) => void;
}

export default function InputForm({
  onAnalyze,
  isLoading,
  resumeText,
  setResumeText,
}: InputFormProps) {
  const [jd, setJd] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadWarning, setUploadWarning] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadWarning('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Upload failed.');
        return;
      }

      setResumeText(data.text);
      if (data.warning === 'parser_garbled') {
        setUploadWarning(
          'The parser may not have extracted text perfectly. Please review and edit the text below.'
        );
      }
    } catch {
      setUploadError('Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    onAnalyze(resumeText, jd);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resume Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            htmlFor="resume-input"
            className="text-sm font-semibold text-slate-300 uppercase tracking-wider"
          >
            Your Resume
          </label>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                bg-slate-700/60 text-slate-300 border border-slate-600/50
                hover:bg-slate-600/60 hover:text-white hover:border-slate-500/50
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {uploading ? 'Uploading...' : 'Upload PDF / DOCX'}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {uploadError}
          </div>
        )}

        {uploadWarning && (
          <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
            {uploadWarning}
          </div>
        )}

        <textarea
          id="resume-input"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your full resume text here..."
          className="w-full h-80 lg:h-96 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50
            text-slate-200 placeholder-slate-500 text-sm leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
            resize-none transition-all duration-200
            scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
        />
      </div>

      {/* Job Description Input */}
      <div className="space-y-3">
        <label
          htmlFor="jd-input"
          className="text-sm font-semibold text-slate-300 uppercase tracking-wider block"
        >
          Job Description
        </label>

        <textarea
          id="jd-input"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-80 lg:h-96 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50
            text-slate-200 placeholder-slate-500 text-sm leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40
            resize-none transition-all duration-200
            scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600"
        />
      </div>

      {/* Analyze Button */}
      <div className="lg:col-span-2 flex justify-center pt-2">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !resumeText.trim() || !jd.trim()}
          className="relative group px-8 py-3.5 rounded-xl font-semibold text-white text-base
            bg-gradient-to-r from-indigo-600 to-violet-600
            hover:from-indigo-500 hover:to-violet-500
            disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500
            shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
            disabled:shadow-none
            transition-all duration-300 disabled:cursor-not-allowed
            active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Analyze Resume
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
