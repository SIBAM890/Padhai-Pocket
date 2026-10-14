/**
 * PRD v4.0 §4.4 & §4.10 Decision & Resolution Table
 */

export type Bit = 0 | 1 | null;
export type Pat = [Bit, Bit, Bit]; // [P, A, T] where 1 = pass, 0 = fail, null = unavailable

export type Candidate =
  | 'RESOLVED'
  | 'READING_GAP_CANDIDATE'
  | 'LANGUAGE_OR_TERM_GAP_CANDIDATE'
  | 'CONCEPT_GAP_CANDIDATE'
  | 'INCONSISTENT';

export type SetLabel =
  | 'RESOLVED'
  | 'CONCEPT_GAP'
  | 'READING_GAP'
  | 'TERM_GAP'
  | 'LISTENING_OR_COMPREHENSION'
  | 'INCONSISTENT';

const TABLE: Record<string, Candidate> = {
  '1,1,1': 'RESOLVED',
  '1,1,0': 'READING_GAP_CANDIDATE',
  '1,0,0': 'LANGUAGE_OR_TERM_GAP_CANDIDATE',
  '0,0,0': 'CONCEPT_GAP_CANDIDATE',
};

/**
 * Maps a [P, A, T] pattern to a Candidate.
 * Any pattern containing null (e.g. audio unavailable) yields INCONSISTENT.
 * Any pattern not explicitly matched in the 4 canonical rows yields INCONSISTENT.
 */
export function candidateOf(p: Pat): Candidate {
  if (p.includes(null)) {
    return 'INCONSISTENT';
  }
  return TABLE[p.join(',')] ?? 'INCONSISTENT';
}

/**
 * Resolves a Candidate with targeted confirmation outcome into a SetLabel.
 * confirmPassed: learner passed ALL confirmation items for the configured depth.
 */
export function resolve(c: Candidate, confirmPassed: boolean): SetLabel {
  switch (c) {
    case 'LANGUAGE_OR_TERM_GAP_CANDIDATE':
      return confirmPassed ? 'LISTENING_OR_COMPREHENSION' : 'TERM_GAP';
    case 'READING_GAP_CANDIDATE':
      return confirmPassed ? 'INCONSISTENT' : 'READING_GAP';
    case 'CONCEPT_GAP_CANDIDATE':
      return confirmPassed ? 'INCONSISTENT' : 'CONCEPT_GAP';
    case 'RESOLVED':
      return 'RESOLVED';
    default:
      return 'INCONSISTENT';
  }
}
