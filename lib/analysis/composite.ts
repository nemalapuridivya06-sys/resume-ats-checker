import { Verdict } from '../../types/analysis';

/**
 * Composite score and verdict:
 * - composite = round(matchScore*0.45 + projAvg*0.35 + formatScore*0.20)
 * - verdict = composite >= 80 ? "ready" : composite >= 60 ? "almost" : "needs-work"
 */
export function computeComposite(
  matchScore: number,
  projAvg: number,
  formatScore: number
): { composite: number; verdict: Verdict } {
  const composite = Math.round(matchScore * 0.45 + projAvg * 0.35 + formatScore * 0.2);

  let verdict: Verdict;
  if (composite >= 80) {
    verdict = 'ready';
  } else if (composite >= 60) {
    verdict = 'almost';
  } else {
    verdict = 'needs-work';
  }

  return { composite, verdict };
}
