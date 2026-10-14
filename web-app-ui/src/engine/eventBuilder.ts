/**
 * PRD v4.0 §7.1 Event Builder
 *
 * All events are immutable rows with canonical JSON hashing for input_hash.
 * The input_hash is the first 12 hex chars of SHA-256 over canonical JSON (sorted keys, no whitespace, UTF-8).
 */

import * as crypto from 'crypto';

export type EventNode =
  | 'PLAN'
  | 'TOOL'
  | 'OBSERVE'
  | 'PROBE'
  | 'CONFIRM'
  | 'REFLECT'
  | 'ACT'
  | 'MASTERY'
  | 'FALLBACK'
  | 'NETWORK'
  | 'SYNC'
  | 'CONSENT'
  | 'SESSION'
  | 'ERROR'
  | 'PURGE';

export interface EventData {
  schema_version?: '1.1';
  event_id: string;
  device_id?: string;
  profile_id: string;
  session_id: string;
  episode_id?: string | null;
  seq: number;
  ts: string;
  origin: 'device' | 'server';
  node: EventNode;
  action: string;
  input_hash?: string;
  output: Record<string, any>;
  latency_ms?: number;
  network_mode: 'ONLINE' | 'WEAK' | 'OFFLINE';
  agreement?: string | null;
  confirm_threshold?: 1 | 2;
  mastery_before?: number;
  mastery_after?: number;
  engine_version: string;
  pack_hash: string;
}

/**
 * Computes canonical JSON string (sorted keys recursively, no whitespace).
 */
export function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalJson(item)).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k]));
  return '{' + pairs.join(',') + '}';
}

/**
 * First 12 hex chars of SHA-256 over canonical JSON.
 */
export function computeInputHash(rawInput: any): string {
  const canon = canonicalJson(rawInput);
  const hash = crypto.createHash('sha256').update(canon, 'utf8').digest('hex');
  return hash.substring(0, 12);
}

/**
 * Builds a validated EventData structure with input_hash computed if missing.
 */
export function buildEvent(data: EventData, rawInputForHash?: any): EventData {
  const hash =
    data.input_hash ??
    (rawInputForHash !== undefined
      ? computeInputHash(rawInputForHash)
      : computeInputHash({ action: data.action, node: data.node }));

  return {
    schema_version: '1.1',
    event_id: data.event_id,
    device_id: data.device_id,
    profile_id: data.profile_id,
    session_id: data.session_id,
    episode_id: data.episode_id ?? null,
    seq: data.seq,
    ts: data.ts,
    origin: data.origin,
    node: data.node,
    action: data.action,
    input_hash: hash,
    output: data.output,
    latency_ms: data.latency_ms ?? 0,
    network_mode: data.network_mode,
    agreement: data.agreement ?? null,
    confirm_threshold: data.confirm_threshold,
    mastery_before: data.mastery_before,
    mastery_after: data.mastery_after,
    engine_version: data.engine_version,
    pack_hash: data.pack_hash,
  };
}
