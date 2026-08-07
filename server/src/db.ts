import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const rawDbUrl = process.env.DATABASE_URL;
const connectionString = rawDbUrl
  ?.replace(/[\?&]channel_binding=[^&]*/g, "")
  ?.replace(/[\?&]sslmode=[^&]*/g, "");
export const isPlaceholder = !connectionString || connectionString.includes("user:password@ep-sample");

if (isPlaceholder) {
  console.warn("⚠️ [Optikur Server Warning]: DATABASE_URL is set to a placeholder in server/.env.");
  console.warn("💡 [Optikur Dev DB]: Operating in local in-memory database mode for dev server.");
  console.warn("To use live Neon Postgres, update DATABASE_URL in server/.env with your Neon connection string.");
}

export const pool = new Pool({
  connectionString: isPlaceholder ? undefined : connectionString,
  ssl: isPlaceholder
    ? undefined
    : {
        rejectUnauthorized: false,
      },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
});

pool.on("error", (err) => {
  console.warn("[Optikur DB Pool] Handled idle backend client connection reset:", err.message);
});

export interface LocalUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalSettings {
  user_id: string;
  focus_minutes: number;
  rest_seconds: number;
  sound_enabled: boolean;
  strict_mode: boolean;
  notifications_enabled: boolean;
  overlay_notifications_enabled: boolean;
  native_notifications_enabled: boolean;
  background_timer_enabled: boolean;
  updated_at: string;
}

export interface LocalBreakLog {
  id: string;
  user_id: string;
  timestamp: string;
  duration_seconds: number;
  completed: boolean;
  break_type: string;
  created_at: string;
  updated_at: string;
}

export interface LocalDailyStats {
  id: string;
  user_id: string;
  date: string;
  breaks_completed: number;
  streak_days: number;
  updated_at: string;
}

// In-Memory Dev Store Fallback
export const devStore = {
  users: new Map<string, LocalUser>(), // key: email (lowercased)
  usersById: new Map<string, LocalUser>(),
  settings: new Map<string, LocalSettings>(), // key: user_id
  breakLogs: new Map<string, LocalBreakLog[]>(), // key: user_id -> Array
  dailyStats: new Map<string, LocalDailyStats[]>(), // key: user_id -> Array
};

export function clearDevStore() {
  devStore.users.clear();
  devStore.usersById.clear();
  devStore.settings.clear();
  devStore.breakLogs.clear();
  devStore.dailyStats.clear();
  console.log("[Optikur Dev DB] Cleared in-memory dev database store.");
}

export async function query(text: string, params?: any[]) {
  if (isPlaceholder) {
    // In-memory simulator for local dev execution without Neon URL
    return handleDevQuery(text, params);
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[SQL Query] executed in ${duration}ms | rows: ${res.rowCount}`);
    return res;
  } catch (err: any) {
    console.warn(`[Optikur DB] Pool query warning (${err.message}). Retrying on dedicated Neon client...`);
    const client = new pkg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      console.log(`[SQL Query Dedicated] executed in ${duration}ms | rows: ${res.rowCount}`);
      return res;
    } finally {
      await client.end().catch(() => {});
    }
  }
}

function handleDevQuery(text: string, params?: any[]) {
  const clean = text.trim().toLowerCase();

  // 1. Settings Queries (check before users because user_settings contains user)
  if (clean.includes("from user_settings where user_id =")) {
    const uid = params?.[0]?.toString();
    const s = uid ? devStore.settings.get(uid) : undefined;
    return { rowCount: s ? 1 : 0, rows: s ? [s] : [] };
  }

  if (clean.includes("insert into user_settings") || clean.includes("update user_settings")) {
    const uid = params?.[0]?.toString() || "";
    const existing = devStore.settings.get(uid) || {
      user_id: uid,
      focus_minutes: 20,
      rest_seconds: 20,
      sound_enabled: true,
      strict_mode: false,
      notifications_enabled: true,
      overlay_notifications_enabled: true,
      native_notifications_enabled: true,
      background_timer_enabled: true,
      updated_at: new Date().toISOString(),
    };
    devStore.settings.set(uid, existing);
    return { rowCount: 1, rows: [existing] };
  }

  // 2. Users Queries
  if (clean.includes("from users where email =")) {
    const email = params?.[0]?.toString().toLowerCase();
    const u = email ? devStore.users.get(email) : undefined;
    return { rowCount: u ? 1 : 0, rows: u ? [u] : [] };
  }

  if (clean.includes("from users where id =")) {
    const id = params?.[0]?.toString();
    const u = id ? devStore.usersById.get(id) : undefined;
    return { rowCount: u ? 1 : 0, rows: u ? [u] : [] };
  }

  if (clean.includes("insert into users")) {
    const email = params?.[0]?.toString().toLowerCase() || "";
    const password_hash = params?.[1]?.toString() || "";
    const full_name = params?.[2]?.toString() || email.split("@")[0];
    const id = "usr_local_" + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    const u: LocalUser = { id, email, password_hash, full_name, created_at: now, updated_at: now };
    devStore.users.set(email, u);
    devStore.usersById.set(id, u);

    // Initialize default settings
    devStore.settings.set(id, {
      user_id: id,
      focus_minutes: 20,
      rest_seconds: 20,
      sound_enabled: true,
      strict_mode: false,
      notifications_enabled: true,
      overlay_notifications_enabled: true,
      native_notifications_enabled: true,
      background_timer_enabled: true,
      updated_at: now,
    });

    return { rowCount: 1, rows: [u] };
  }

  if (clean.includes("update users")) {
    const id = params?.[params.length - 1]?.toString(); // assuming WHERE id = $N is last
    const u = id ? devStore.usersById.get(id) : undefined;
    if (u) {
      if (clean.includes("full_name =")) u.full_name = params?.[0];
      if (clean.includes("email =")) {
        devStore.users.delete(u.email);
        u.email = params?.[0]?.toLowerCase();
        devStore.users.set(u.email, u);
      }
      if (clean.includes("password_hash =")) u.password_hash = params?.[0];
      u.updated_at = new Date().toISOString();
      return { rowCount: 1, rows: [u] };
    }
    return { rowCount: 0, rows: [] };
  }

  // 3. Break Logs Queries
  if (clean.includes("from break_logs where user_id =")) {
    const uid = params?.[0]?.toString() || "";
    const logs = devStore.breakLogs.get(uid) || [];
    return { rowCount: logs.length, rows: logs };
  }

  // 4. Daily Stats Queries
  if (clean.includes("from daily_stats where user_id =")) {
    const uid = params?.[0]?.toString() || "";
    const stats = devStore.dailyStats.get(uid) || [];
    return { rowCount: stats.length, rows: stats };
  }

  return { rowCount: 0, rows: [] };
}

/**
 * Initializes database tables on Neon Postgres automatically if connection is live
 */
export async function initDbTables(): Promise<void> {
  if (isPlaceholder) return;
  try {
    console.log("[Optikur Server] Auto-initializing Neon PostgreSQL table schemas...");
    await query(`
      CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      ALTER TABLE break_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

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
      CREATE INDEX IF NOT EXISTS idx_break_logs_user_timestamp ON break_logs(user_id, timestamp DESC);

      CREATE TABLE IF NOT EXISTS daily_stats (
          id VARCHAR(64) PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          breaks_completed INT DEFAULT 0,
          streak_days INT DEFAULT 0,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          CONSTRAINT unique_user_date UNIQUE(user_id, date)
      );
      CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
    `);
    console.log("✅ [Optikur Server] Neon PostgreSQL table schemas initialized successfully.");
  } catch (err) {
    console.error("❌ [Optikur Server] Table schema initialization warning:", err);
  }
}
