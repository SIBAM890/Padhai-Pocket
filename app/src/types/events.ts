export type NetworkMode = 'ONLINE' | 'WEAK' | 'OFFLINE';
export type SyncStatus = 'PENDING' | 'ACKED' | 'ERROR' | 'REJECTED';

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

export interface PadhaiEvent {
  schema_version: '1.1';
  event_id: string; // UUID v4 format conforming to shared/event.schema.json & openapi.yaml
  device_id?: string;
  profile_id: string;
  session_id?: string;
  episode_id?: string | null;
  seq: number;
  ts: string;
  origin: 'device' | 'server';
  node: EventNode;
  action: string;
  input_hash: string;
  output: Record<string, unknown>;
  latency_ms?: number;
  network_mode: NetworkMode;
  agreement?: string | null;
  confirm_threshold?: 1 | 2;
  mastery_before?: number;
  mastery_after?: number;
  engine_version: string;
  pack_hash: string;
}

export interface StoredEvent extends PadhaiEvent {
  sync_status: SyncStatus;
  retry_count: number;
  next_retry_at: number;
}
