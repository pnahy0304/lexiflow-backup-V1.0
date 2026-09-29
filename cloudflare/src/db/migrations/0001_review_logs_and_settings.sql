-- ============================================================
-- Migration 0001: Append-Only Review Logs & User Settings Sync
-- ============================================================

-- Table for Append-Only Card Review Logs (Idempotent by review_id)
CREATE TABLE IF NOT EXISTS review_logs (
    review_id   TEXT PRIMARY KEY,
    uid         TEXT NOT NULL,
    card_id     TEXT NOT NULL,
    rating      INTEGER NOT NULL, -- 1: Again, 2: Hard, 3: Good, 4: Easy
    client_time TEXT NOT NULL,
    server_time TEXT NOT NULL DEFAULT (datetime('now')),
    device_id   TEXT NOT NULL DEFAULT 'unknown',
    is_undone   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_review_logs_uid_card ON review_logs(uid, card_id, server_time ASC);
CREATE INDEX IF NOT EXISTS idx_review_logs_uid_time ON review_logs(uid, server_time ASC);

-- Table for User Settings Sync Across Devices
CREATE TABLE IF NOT EXISTS user_settings (
    uid         TEXT NOT NULL,
    key         TEXT NOT NULL,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (uid, key)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_uid ON user_settings(uid);
