-- ============================================================
-- LexiFlow D1 Database Schema
-- Cloudflare D1 (SQLite-compatible)
-- ============================================================

-- Flashcards / Spaced Repetition
-- Mirrors the 'spaced_repetition' subcollection under users/{uid}
CREATE TABLE IF NOT EXISTS flashcards (
    id          TEXT PRIMARY KEY,
    uid         TEXT NOT NULL,
    word        TEXT NOT NULL,
    meaning     TEXT NOT NULL DEFAULT '',
    example     TEXT NOT NULL DEFAULT '',
    interval    INTEGER NOT NULL DEFAULT 0,
    ease_factor REAL NOT NULL DEFAULT 2.5,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_flashcards_uid ON flashcards(uid);
CREATE INDEX IF NOT EXISTS idx_flashcards_due ON flashcards(uid, next_review);

-- Search History
-- Mirrors the 'history' subcollection under users/{uid}
CREATE TABLE IF NOT EXISTS search_history (
    id          TEXT NOT NULL,
    uid         TEXT NOT NULL,
    word        TEXT NOT NULL,
    translation TEXT NOT NULL DEFAULT '',
    timestamp   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(uid, word)
);

CREATE INDEX IF NOT EXISTS idx_history_uid ON search_history(uid);
CREATE INDEX IF NOT EXISTS idx_history_uid_ts ON search_history(uid, timestamp DESC);

-- Bookmarks (favorite/starred words)
-- Mirrors the 'bookmarks' subcollection under users/{uid}
CREATE TABLE IF NOT EXISTS bookmarks (
    uid         TEXT NOT NULL,
    word        TEXT NOT NULL,
    translation TEXT NOT NULL DEFAULT '',
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (uid, word)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_uid ON bookmarks(uid);

-- Study Streak
-- Mirrors the 'stats/streak' document under users/{uid}
CREATE TABLE IF NOT EXISTS study_streaks (
    uid             TEXT PRIMARY KEY,
    current_streak  INTEGER NOT NULL DEFAULT 0,
    longest_streak  INTEGER NOT NULL DEFAULT 0,
    last_study_date TEXT NOT NULL DEFAULT (datetime('now'))
);

-- User Profiles (Public info, unique user_code, privacy settings)
CREATE TABLE IF NOT EXISTS users (
    uid                 TEXT PRIMARY KEY,
    email               TEXT NOT NULL,
    display_name        TEXT NOT NULL DEFAULT 'Học viên LexiFlow',
    avatar_url          TEXT NOT NULL DEFAULT '',
    user_code           TEXT UNIQUE NOT NULL, -- e.g. '#LEXI-8921'
    is_public_profile   INTEGER NOT NULL DEFAULT 0, -- 0: Friends only, 1: Public to all
    level               INTEGER NOT NULL DEFAULT 1,
    xp                  INTEGER NOT NULL DEFAULT 0,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now')),
    last_active_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Friendships & Friend Requests
CREATE TABLE IF NOT EXISTS friendships (
    id              TEXT PRIMARY KEY,
    requester_uid   TEXT NOT NULL,
    receiver_uid    TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'blocked'
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(requester_uid, receiver_uid)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_uid, status);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_uid, status);

-- Private Groups
CREATE TABLE IF NOT EXISTS groups (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    created_by_uid  TEXT NOT NULL,
    invite_code     TEXT UNIQUE NOT NULL, -- e.g. 'GRP-8921'
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);

CREATE TABLE IF NOT EXISTS group_members (
    group_id    TEXT NOT NULL,
    uid         TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'member'
    joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (group_id, uid)
);

CREATE INDEX IF NOT EXISTS idx_group_members_uid ON group_members(uid);

-- Shared Flashcard Decks (Importable)
CREATE TABLE IF NOT EXISTS shared_decks (
    id          TEXT PRIMARY KEY,
    owner_uid   TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    words_json  TEXT NOT NULL, -- JSON string array of vocab objects
    share_code  TEXT UNIQUE NOT NULL, -- e.g. 'DECK-4891'
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shared_decks_code ON shared_decks(share_code);

-- Social Nudges & Cheers
CREATE TABLE IF NOT EXISTS social_nudges (
    id            TEXT PRIMARY KEY,
    sender_uid    TEXT NOT NULL,
    receiver_uid  TEXT NOT NULL,
    type          TEXT NOT NULL, -- 'cheer' | 'nudge'
    message       TEXT NOT NULL DEFAULT '',
    is_read       INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_nudges_receiver ON social_nudges(receiver_uid, is_read);

-- XP Transactions (For Weekly Leaderboards without modifying lifetime XP)
CREATE TABLE IF NOT EXISTS xp_transactions (
    id          TEXT PRIMARY KEY,
    uid         TEXT NOT NULL,
    xp_amount   INTEGER NOT NULL,
    source      TEXT NOT NULL DEFAULT 'study',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_xp_tx_uid_date ON xp_transactions(uid, created_at);

-- User Imported Shared Decks Tracking (For Sync & Differential Updates)
CREATE TABLE IF NOT EXISTS user_imported_decks (
    uid             TEXT NOT NULL,
    share_code      TEXT NOT NULL,
    imported_count  INTEGER NOT NULL DEFAULT 0,
    last_synced_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (uid, share_code)
);

-- Append-Only Card Review Logs (Idempotent by review_id)
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

-- User Settings Sync Across Devices
CREATE TABLE IF NOT EXISTS user_settings (
    uid         TEXT NOT NULL,
    key         TEXT NOT NULL,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (uid, key)
);

CREATE INDEX IF NOT EXISTS idx_user_settings_uid ON user_settings(uid);

-- Streak Freeze & Catch-up Mode Tracking
CREATE TABLE IF NOT EXISTS user_streak_freezes (
    uid                 TEXT PRIMARY KEY,
    available_freezes   INTEGER NOT NULL DEFAULT 0,
    last_granted_at     TEXT NOT NULL DEFAULT '',
    used_count          INTEGER NOT NULL DEFAULT 0,
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_streak_freezes_uid ON user_streak_freezes(uid);




