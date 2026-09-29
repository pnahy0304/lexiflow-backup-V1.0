-- ============================================================
-- Migration 0002: Catch-up Mode & Streak Freeze System
-- ============================================================

CREATE TABLE IF NOT EXISTS user_streak_freezes (
    uid                 TEXT PRIMARY KEY,
    available_freezes   INTEGER NOT NULL DEFAULT 0,
    last_granted_at     TEXT NOT NULL DEFAULT '',
    used_count          INTEGER NOT NULL DEFAULT 0,
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_streak_freezes_uid ON user_streak_freezes(uid);
