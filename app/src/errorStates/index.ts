export * from './loading';
export * from './asr_failed';
export * from './mic_denied';
export * from './offline';
export * from './sync_pending';
export * from './answer_incorrect';
export * from './sound_check';
export * from './sound_failed';
export * from './probe_inconsistent';
export * from './all_probes_correct';
export * from './audio_failed';
export * from './content_missing';
export * from './content_not_approved';
export * from './crash_recovered';
export * from './storage_error';
export * from './skipped';

import { LoadingState } from './loading';
import { AsrFailedState } from './asr_failed';
import { MicDeniedState } from './mic_denied';
import { OfflineState } from './offline';
import { SyncPendingState } from './sync_pending';
import { AnswerIncorrectState } from './answer_incorrect';
import { SoundCheckState } from './sound_check';
import { SoundFailedState } from './sound_failed';
import { ProbeInconsistentState } from './probe_inconsistent';
import { AllProbesCorrectState } from './all_probes_correct';
import { AudioFailedState } from './audio_failed';
import { ContentMissingState } from './content_missing';
import { ContentNotApprovedState } from './content_not_approved';
import { CrashRecoveredState } from './crash_recovered';
import { StorageErrorState } from './storage_error';
import { SkippedState } from './skipped';
import type { ErrorStateProps } from './loading';

export type ErrorStateType =
  | 'loading'
  | 'asr_failed'
  | 'mic_denied'
  | 'offline'
  | 'sync_pending'
  | 'answer_incorrect'
  | 'sound_check'
  | 'sound_failed'
  | 'probe_inconsistent'
  | 'all_probes_correct'
  | 'audio_failed'
  | 'content_missing'
  | 'content_not_approved'
  | 'crash_recovered'
  | 'storage_error'
  | 'skipped';

export const ERROR_STATE_COMPONENTS: Record<ErrorStateType, React.FC<ErrorStateProps>> = {
  loading: LoadingState,
  asr_failed: AsrFailedState,
  mic_denied: MicDeniedState,
  offline: OfflineState,
  sync_pending: SyncPendingState,
  answer_incorrect: AnswerIncorrectState,
  sound_check: SoundCheckState,
  sound_failed: SoundFailedState,
  probe_inconsistent: ProbeInconsistentState,
  all_probes_correct: AllProbesCorrectState,
  audio_failed: AudioFailedState,
  content_missing: ContentMissingState,
  content_not_approved: ContentNotApprovedState,
  crash_recovered: CrashRecoveredState,
  storage_error: StorageErrorState,
  skipped: SkippedState,
};
