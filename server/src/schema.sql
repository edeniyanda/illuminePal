-- ==========================================================
-- Optikur Backend Production Database Schema (Neon PostgreSQL)
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user email lookups during authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- 2. User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    focus_minutes INT DEFAULT 20,
    rest_seconds INT DEFAULT 20,
    sound_enabled BOOLEAN DEFAULT TRUE,
    strict_mode BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    overlay_notifications_enabled BOOLEAN DEFAULT TRUE,
    native_notifications_enabled BOOLEAN DEFAULT TRUE,
    background_timer_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Break Logs Table
CREATE TABLE IF NOT EXISTS break_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    duration_seconds INT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    break_type VARCHAR(32) NOT NULL DEFAULT 'short_break',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast history queries per user
CREATE INDEX IF NOT EXISTS idx_break_logs_user_timestamp ON break_logs(user_id, timestamp DESC);

-- 4. Daily Stats Table
CREATE TABLE IF NOT EXISTS daily_stats (
    id VARCHAR(64) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    breaks_completed INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Index for fast daily stats queries per user
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
