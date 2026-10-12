/**
 * PRD v4.0 §5.1 Concept and Term Mastery (BKT)
 *
 * Formulas:
 * wrong:   P' = P·s / (P·s + (1−P)(1−g))
 * correct: P' = P(1−s) / (P(1−s) + (1−P)·g)
 * learn:   P_next = P' + (1−P')·t  (applied after every observation, including wrong)
 *
 * Parameters:
 * s = 0.10 (slip)
 * g = 1 / n_options (default 0.25 for 4 options)
 * t = 0.15 for concept, 0.10 for term
 *
 * Rule: Chained at full precision; rounding is display-only.
 */

export interface BKTParams {
  s?: number; // slip, default 0.10
  g?: number; // guess, default 0.25 (1/n_options)
  t?: number; // transition/learn rate, default 0.15 for concept, 0.10 for term
}

const DEFAULT_S = 0.10;
const DEFAULT_G = 0.25;
const DEFAULT_T_CONCEPT = 0.15;
const DEFAULT_T_TERM = 0.10;

/**
 * Single step BKT posterior update + transition.
 */
export function bktStep(
  p: number,
  correct: boolean,
  params?: BKTParams
): number {
  const s = params?.s ?? DEFAULT_S;
  const g = params?.g ?? DEFAULT_G;
  const t = params?.t ?? DEFAULT_T_CONCEPT;

  let pPrime: number;
  if (correct) {
    const num = p * (1 - s);
    const den = num + (1 - p) * g;
    pPrime = num / den;
  } else {
    const num = p * s;
    const den = num + (1 - p) * (1 - g);
    pPrime = num / den;
  }

  const pNext = pPrime + (1 - pPrime) * t;
  return pNext;
}

/**
 * Concept mastery update (t = 0.15 by default).
 */
export function updateConceptMastery(
  current: number,
  correct: boolean,
  nOptions: number = 4
): number {
  const g = 1 / nOptions;
  return bktStep(current, correct, { s: DEFAULT_S, g, t: DEFAULT_T_CONCEPT });
}

/**
 * Term mastery update (t = 0.10 by default).
 */
export function updateTermMastery(
  current: number,
  correct: boolean,
  nOptions: number = 4
): number {
  const g = 1 / nOptions;
  return bktStep(current, correct, { s: DEFAULT_S, g, t: DEFAULT_T_TERM });
}
