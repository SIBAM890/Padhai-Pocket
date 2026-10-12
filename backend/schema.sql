-- =====================================================================
-- Padhai Pocket - Postgres (Supabase) Database Schema
-- Follows PRD v4.0 §7.3
--
-- Security rules:
-- 1. ENABLE ROW LEVEL SECURITY on all four tables
-- 2. NO policies (Supabase REST default blocked, service-role key only)
-- 3. UNIQUE (profile_id, seq) on events
-- 4. token_hash stored, NEVER the raw token
-- =====================================================================

CREATE TABLE IF NOT EXISTS events (
  event_id UUID PRIMARY KEY,
  schema_version TEXT NOT NULL,
  device_id TEXT,
  profile_id TEXT NOT NULL,
  session_id UUID,
  episode_id UUID,
  seq INT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  origin TEXT NOT NULL,
  node TEXT NOT NULL,
  action TEXT NOT NULL,
  input_hash TEXT,
  output JSONB NOT NULL,
  latency_ms INT DEFAULT 0,
  network_mode TEXT NOT NULL,
  agreement TEXT,
  confirm_threshold INT,
  mastery_before REAL,
  mastery_after REAL,
  engine_version TEXT,
  pack_hash TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (profile_id, seq)
);

CREATE TABLE IF NOT EXISTS devices (
  device_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS registration_codes (
  code_hash TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS purge_log (
  profile_hash TEXT NOT NULL,
  purged_at TIMESTAMPTZ DEFAULT now(),
  event_count INT NOT NULL
);

-- Row Level Security: ENABLE ON ALL FOUR TABLES
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE purge_log ENABLE ROW LEVEL SECURITY;

-- Notice: NO POLICIES ADDED.
-- Without policies, all requests through Supabase anon key are denied by default.
