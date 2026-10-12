import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import type {NetworkMode} from '../types/events';

let forcedOffline = false;
let lastMode: NetworkMode = 'OFFLINE';

function baseMode(state: NetInfoState): NetworkMode {
  if (!state.isConnected || state.isInternetReachable === false) return 'OFFLINE';
  if (state.isInternetReachable === null) return 'WEAK';
  return 'ONLINE';
}

export async function detectNetworkMode(healthUrl?: string): Promise<NetworkMode> {
  if (forcedOffline) {
    lastMode = 'OFFLINE';
    return lastMode;
  }

  const state = await NetInfo.fetch();
  const base = baseMode(state);
  if (base === 'OFFLINE' || !healthUrl) {
    lastMode = base;
    return lastMode;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(healthUrl, {signal: controller.signal});
    clearTimeout(timer);
    lastMode = response.ok ? 'ONLINE' : 'WEAK';
  } catch {
    lastMode = 'WEAK';
  }
  return lastMode;
}

export function subscribeNetwork(listener: (mode: NetworkMode) => void) {
  return NetInfo.addEventListener(async state => {
    if (forcedOffline) return listener('OFFLINE');
    const base = baseMode(state);
    lastMode = base;
    listener(base);
  });
}

export function setForcedOffline(value: boolean) {
  forcedOffline = value;
  lastMode = value ? 'OFFLINE' : lastMode;
}

export function isForcedOffline() {
  return forcedOffline;
}

export function getLastMode() {
  return lastMode;
}
