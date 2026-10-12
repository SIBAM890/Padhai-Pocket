/**
 * PRD v4.0 §4.5 Agreement Rule & State Machine finalLabel
 *
 * Agreement = (sets agreeing with the label) / (sets run)
 * Heuristic, not a confidence percentage.
 * INCONSISTENT sets count toward "sets run".
 */

import { SetLabel } from './table';

export type LabelStatus = 'provisional' | 'confirmed' | 'abstained';

export type Verdict =
  | { done: false }
  | {
      done: true;
      label: SetLabel;
      status: LabelStatus;
      agreement: string;
    };

/**
 * Evaluates sequence of set labels so far against threshold (1 for demo, 2 for production).
 */
export function finalLabel(sets: SetLabel[], threshold: 1 | 2): Verdict {
  const n = sets.length; // sets run so far, max 3

  if (threshold === 1) {
    // demo: first non-INCONSISTENT set label
    const first = sets.find((s) => s !== 'INCONSISTENT');
    if (first) {
      return {
        done: true,
        label: first,
        status: 'provisional',
        agreement: `1/${n}`,
      };
    }
    return n < 3
      ? { done: false }
      : {
          done: true,
          label: 'INCONSISTENT',
          status: 'abstained',
          agreement: `0/${n}`,
        };
  }

  // production (threshold === 2): a clean first set ends the episode
  if (sets[0] === 'RESOLVED') {
    return {
      done: true,
      label: 'RESOLVED',
      status: 'confirmed',
      agreement: '1/1',
    };
  }

  const counts = new Map<SetLabel, number>();
  for (const s of sets) {
    if (s !== 'INCONSISTENT') {
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
  }

  for (const [label, c] of counts) {
    if (c >= 2) {
      return {
        done: true,
        label,
        status: 'confirmed',
        agreement: `${c}/${n}`,
      };
    }
  }

  return n < 3
    ? { done: false }
    : {
        done: true,
        label: 'INCONSISTENT',
        status: 'abstained',
        agreement: `0/${n}`,
      };
}
