import { AnalysisResult } from '../../types/analysis';
import { normalizeText } from './normalize';
import { matchKeywords } from './keywords';
import { findAndScoreProjects } from './projects';
import { analyzeFormat } from './format';
import { computeComposite } from './composite';
import { computePrediction } from './prediction';
import { validateInput } from './validate';
import { computeLifts } from './lifts';

/**
 * Orchestrator: runAnalysis(resume, jd) runs all analysis steps
 * and returns AnalysisResult.
 */
export function runAnalysis(resume: string, jd: string): AnalysisResult {
  // Normalize inputs
  const normalizedResume = normalizeText(resume);
  const normalizedJd = normalizeText(jd);

  // Input validation
  const inputWarning = validateInput(normalizedResume);

  // Keyword matching
  const { matched, missing, matchScore } = matchKeywords(normalizedResume, normalizedJd);

  // Project scoring
  const { projects, projAvg } = findAndScoreProjects(normalizedResume);

  // Format scoring
  const { hasContact, hasSections, formatScore } = analyzeFormat(normalizedResume);

  // Composite + verdict
  const { composite, verdict } = computeComposite(matchScore, projAvg, formatScore);

  // Prediction
  const prediction = computePrediction(composite, missing.length);

  // Lifts
  const lifts = computeLifts(missing, projects, hasContact);

  return {
    composite,
    verdict,
    prediction,
    matchScore,
    projAvg,
    formatScore,
    matched,
    missing,
    projects,
    hasContact,
    hasSections,
    lifts,
    inputWarning,
  };
}
