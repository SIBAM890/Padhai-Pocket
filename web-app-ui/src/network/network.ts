import { useEffect, useState, useCallback, useTransition } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import type { NetworkMode } from '../types/events';

let forcedOfflineState = false;
let currentModeState: NetworkMode = 'OFFLINE';
const listeners = new Set<(mode: NetworkMode) => void>();

function notifyListeners(mode: NetworkMode) {
  currentModeState = mode;
  for (const listener of listeners) {
    listener(mode);
  }
}

/**
 * Derives the base network mode from NetInfo state.
 * If isInternetReachable is null (e.g. startup / initializing),
 * we treat isConnected as WEAK rather than immediately OFFLINE,
 * because connectivity exists but reachability check hasn't finished yet.
 */
function baseMode(state: NetInfoState): NetworkMode {
  if (!state.isConnected || state.isInternetReachable === false) {
    return 'OFFLINE';
  }
  if (state.isInternetReachable === null) {
    return 'WEAK';
  }
  return 'ONLINE';
}

/**
 * Checks backend health endpoint if available.
 * Returns ONLINE if /healthz responds 200 {ok: true}.
 * If health check fails or times out, but device has network connectivity, returns WEAK.
 */
async function checkHealthz(healthUrl: string): Promise<NetworkMode> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timer);
    return response.ok ? 'ONLINE' : 'WEAK';
  } catch {
    return 'WEAK';
  }
}

/**
 * Single authoritative network detection function.
 * State precedence:
 *   forcedOffline === true -> OFFLINE
 *   forcedOffline === false -> real network detection:
 *     - If not connected -> OFFLINE
 *     - If connected & healthUrl provided -> /healthz ping
 *     - If connected & no healthUrl -> baseMode
 */
export async function detectNetworkMode(healthUrl?: string): Promise<NetworkMode> {
  if (forcedOfflineState) {
    currentModeState = 'OFFLINE';
    return 'OFFLINE';
  }

  const state = await NetInfo.fetch();
  const base = baseMode(state);

  if (base === 'OFFLINE' || !healthUrl) {
    currentModeState = base;
    return base;
  }

  const mode = await checkHealthz(healthUrl);
  currentModeState = mode;
  return mode;
}

/**
 * Subscribes a listener to network changes.
 * Immediately invokes listener with current detected mode.
 */
export function subscribeNetwork(
  listener: (mode: NetworkMode) => void,
  healthUrl?: string
): () => void {
  listeners.add(listener);

  // Initial push with current / detected mode
  detectNetworkMode(healthUrl).then((mode) => {
    listener(mode);
  });

  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (forcedOfflineState) {
      notifyListeners('OFFLINE');
      return;
    }

    const base = baseMode(state);
    if (base === 'OFFLINE' || !healthUrl) {
      notifyListeners(base);
      return;
    }

    const mode = await checkHealthz(healthUrl);
    notifyListeners(mode);
  });

  return () => {
    listeners.delete(listener);
    unsubscribe();
  };
}

export function setForcedOffline(value: boolean, healthUrl?: string) {
  forcedOfflineState = value;
  if (value) {
    notifyListeners('OFFLINE');
  } else {
    // Immediately re-run real network detection
    detectNetworkMode(healthUrl).then((mode) => {
      notifyListeners(mode);
    });
  }
}

export function isForcedOffline(): boolean {
  return forcedOfflineState;
}

export function getLastMode(): NetworkMode {
  return currentModeState;
}

/**
 * Unified React hook for authoritative network status.
 */
export function useNetworkStatus(healthUrl?: string) {
  const [networkMode, setNetworkMode] = useState<NetworkMode>(() =>
    forcedOfflineState ? 'OFFLINE' : currentModeState
  );
  const [forcedOffline, setForced] = useState<boolean>(forcedOfflineState);

  const refreshNetworkStatus = useCallback(async () => {
    const mode = await detectNetworkMode(healthUrl);
    setNetworkMode(mode);
    return mode;
  }, [healthUrl]);

  const updateForcedOffline = useCallback(
    (value: boolean) => {
      setForced(value);
      setForcedOffline(value, healthUrl);
    },
    [healthUrl]
  );

  useEffect(() => {
    // Initial fetch on mount
    refreshNetworkStatus();

    const unsubscribe = subscribeNetwork((mode) => {
      setNetworkMode(mode);
    }, healthUrl);

    return unsubscribe;
  }, [healthUrl, refreshNetworkStatus]);

  return {
    networkMode,
    forcedOffline,
    setForcedOffline: updateForcedOffline,
    refreshNetworkStatus,
  };
}
