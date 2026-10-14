import { useRef, useCallback } from 'react';

export interface FiveTapState {
  count: number;
  lastTapMs: number;
}

export interface UseFiveTapOptions {
  windowMs?: number;
  requiredTaps?: number;
}

/**
 * Pure state reducer helper for the five-tap gesture.
 * Allows deterministic unit testing without React component rendering.
 */
export function _tickFiveTap(
  state: FiveTapState,
  nowMs: number,
  windowMs = 3000,
  requiredTaps = 5
): { nextState: FiveTapState; triggered: boolean } {
  const isWithinWindow =
    state.count > 0 &&
    nowMs >= state.lastTapMs &&
    nowMs - state.lastTapMs <= windowMs;

  const nextCount = isWithinWindow ? state.count + 1 : 1;
  const triggered = nextCount >= requiredTaps;

  return {
    nextState: {
      count: triggered ? 0 : nextCount,
      lastTapMs: triggered ? 0 : nowMs,
    },
    triggered,
  };
}

/**
 * React hook to detect multi-tap gestures (e.g. 5 taps within 3 seconds)
 * to open secret teacher / diagnostic panels in child-safe apps.
 */
export function useFiveTapGesture(
  onTrigger: () => void,
  options?: UseFiveTapOptions
): { onTap: () => void } {
  const windowMs = options?.windowMs ?? 3000;
  const requiredTaps = options?.requiredTaps ?? 5;
  const stateRef = useRef<FiveTapState>({ count: 0, lastTapMs: 0 });

  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const onTap = useCallback(() => {
    const now = Date.now();
    const { nextState, triggered } = _tickFiveTap(
      stateRef.current,
      now,
      windowMs,
      requiredTaps
    );
    stateRef.current = nextState;
    if (triggered) {
      onTriggerRef.current();
    }
  }, [windowMs, requiredTaps]);

  return { onTap };
}
