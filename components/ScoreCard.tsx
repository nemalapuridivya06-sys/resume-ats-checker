'use client';

import { AnalysisResult } from '../types/analysis';

interface ScoreCardProps {
  result: AnalysisResult;
}

function VerdictPill({ verdict }: { verdict: string }) {
  const config = {
    ready: {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'ATS Ready',
    },
    almost: {
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      label: 'Almost There',
    },
    'needs-work': {
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      text: 'text-red-400',
      dot: 'bg-red-400',
      label: 'Needs Work',
    },
  }[verdict] || {
    bg: 'bg-slate-500/15',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    label: verdict,
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold
        ${config.bg} ${config.border} ${config.text} border`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
}

function ScoreRing({
  score,
  verdict,
}: {
  score: number;
  verdict: string;
}) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color =
    verdict === 'ready'
      ? 'stroke-emerald-400'
      : verdict === 'almost'
      ? 'stroke-amber-400'
      : 'stroke-red-400';
  const glow =
    verdict === 'ready'
      ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
      : verdict === 'almost'
      ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
      : 'drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className={`w-36 h-36 -rotate-90 ${glow}`} viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          className="text-slate-700/50"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          className={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-400 font-medium">/100</span>
      </div>
    </div>
  );
}

function SubScoreBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300 font-medium">{value}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/50 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreCard({ result }: ScoreCardProps) {
  const pointsToBar = Math.max(0, 80 - result.composite);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Warning Banner */}
      {result.inputWarning && (
        <div className="px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-amber-400 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-amber-400 font-semibold text-sm">Warning</p>
              <p className="text-amber-300/80 text-sm mt-0.5">{result.inputWarning.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Score */}
      <div className="flex flex-col items-center gap-4 py-6">
        <ScoreRing score={result.composite} verdict={result.verdict} />
        <VerdictPill verdict={result.verdict} />
        {pointsToBar > 0 && (
          <p className="text-slate-400 text-sm">
            <span className="text-white font-semibold">+{pointsToBar} points</span> to clear the
            80 bar
          </p>
        )}
      </div>

      {/* Prediction */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-semibold text-slate-300">ATS Prediction:</span>
          <span
            className={`text-sm font-bold ${
              result.prediction.outcome === 'yes'
                ? 'text-emerald-400'
                : result.prediction.outcome === 'borderline'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            {result.prediction.outcome === 'yes'
              ? 'Likely Pass'
              : result.prediction.outcome === 'borderline'
              ? 'Borderline'
              : 'Unlikely to Pass'}
          </span>
        </div>
        <p className="text-slate-400 text-sm">{result.prediction.reason}</p>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
          <SubScoreBar label="Keywords" value={result.matchScore} max={100} />
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
          <SubScoreBar label="Projects" value={result.projAvg} max={100} />
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-3">
          <SubScoreBar label="Format" value={result.formatScore} max={100} />
        </div>
      </div>

      {/* Keywords */}
      <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
          Keywords
        </h3>

        {result.matched.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Matched ({result.matched.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {result.matched.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400
                    border border-emerald-500/20 font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.missing.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
              Missing ({result.missing.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {result.missing.map((kw) => (
                <span
                  key={kw}
                  className="px-2.5 py-1 text-xs rounded-lg bg-red-500/10 text-red-400
                    border border-red-500/20 font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.matched.length === 0 && result.missing.length === 0 && (
          <p className="text-slate-500 text-sm">No specific skill keywords detected in the job description.</p>
        )}
      </div>

      {/* Projects */}
      {result.projects.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/40">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Projects
          </h3>
          <div className="space-y-4">
            {result.projects.map((proj, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-slate-900/40 border border-slate-700/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-200">{proj.title}</h4>
                  <span
                    className={`text-sm font-bold ${
                      proj.score >= 80
                        ? 'text-emerald-400'
                        : proj.score >= 60
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {proj.score}/100
                  </span>
                </div>
                {proj.issues.length > 0 && (
                  <ul className="space-y-1 mt-2">
                    {proj.issues.map((issue, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                        <svg
                          className="w-4 h-4 text-amber-400 mt-0.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01"
                          />
                        </svg>
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifts */}
      {result.lifts.length > 0 && (
        <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/40">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
            Quick Wins
          </h3>
          <div className="space-y-3">
            {result.lifts.map((lift, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-3 rounded-lg bg-slate-900/40 border border-slate-700/30"
              >
                <span className="shrink-0 mt-0.5 text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  +{lift.gain}
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{lift.desc}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{lift.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
