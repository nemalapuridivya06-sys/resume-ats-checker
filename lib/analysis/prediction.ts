/**
 * Prediction:
 * - outcome = composite >= 80 ? "yes" : composite >= 60 ? "borderline" : "no"
 * - reason: one sentence based on outcome
 */
export function computePrediction(
  composite: number,
  missingCount: number
): { outcome: 'yes' | 'borderline' | 'no'; reason: string } {
  let outcome: 'yes' | 'borderline' | 'no';
  let reason: string;

  if (composite >= 80) {
    outcome = 'yes';
    reason = 'Your resume is well-optimized with strong keyword coverage and project descriptions.';
  } else if (composite >= 60) {
    outcome = 'borderline';
    reason = `Your resume is close but missing ${missingCount} keyword${missingCount !== 1 ? 's' : ''} from the job description.`;
  } else {
    outcome = 'no';
    reason = `Your resume is missing ${missingCount} keyword${missingCount !== 1 ? 's' : ''} from the job description and needs significant improvement.`;
  }

  return { outcome, reason };
}
