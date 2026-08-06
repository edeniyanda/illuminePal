import { PowerSyncDatabase } from "@powersync/web";
import { AppSchema, DailyStatsRecord } from "./AppSchema";
import { PowerSyncConnector } from "./PowerSyncConnector";

/**
 * Local-First Database Manager for Optikur
 * Handles zero-latency SQLite persistence for guest & authenticated users.
 * Integrates background synchronization with Neon Postgres + PowerSync.
 */

export class DatabaseManager {
  private static instance: DatabaseManager;
  public db: PowerSyncDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private connector: PowerSyncConnector | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const powersync = new PowerSyncDatabase({
          schema: AppSchema,
          database: {
            dbFilename: "optikur_local.db",
          },
        });

        // 3-second timeout guard so SQLite init never hangs callers indefinitely
        const initTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("PowerSync init timeout")), 3000)
        );

        await Promise.race([powersync.init(), initTimeout]);
        this.db = powersync;
        console.log("[Optikur DB] SQLite Database initialized successfully.");
      } catch (error) {
        console.warn("[Optikur DB] PowerSync SQLite initialization warning (using local fallback state):", error);
      }
    })();

    return this.initPromise;
  }

  /**
   * Connects to PowerSync cloud sync streaming using secure JWT credentials
   */
  public async connectSync(userId?: string | null): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;
      if (!this.connector) {
        this.connector = new PowerSyncConnector(userId);
      }
      await this.db.connect(this.connector);
      console.log(`[Optikur DB] Cloud sync stream connected for user ${userId || "guest"}.`);
    } catch (err) {
      console.warn("[Optikur DB] Cloud sync connection warning (operating in local-first offline mode):", err);
    }
  }

  /**
   * Disconnects the sync stream gracefully upon sign out
   */
  public async disconnectSync(): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.disconnect();
      this.connector = null;
      console.log("[Optikur DB] Cloud sync stream disconnected.");
    } catch (err) {
      console.warn("[Optikur DB] Disconnect error:", err);
    }
  }

  /**
   * Seamlessly migrates Guest Mode SQLite records (user_id IS NULL)
   * to the newly signed up or logged in user's account ID.
   */
  public async migrateGuestDataToUser(newUserId: string): Promise<void> {
    try {
      await this.init();
      if (!this.db) return;
      await this.db.execute(
        `UPDATE break_logs SET user_id = ? WHERE user_id IS NULL OR user_id = 'guest'`,
        [newUserId]
      );
      await this.db.execute(
        `UPDATE daily_stats SET user_id = ? WHERE user_id IS NULL OR user_id = 'guest'`,
        [newUserId]
      );
      await this.db.execute(
        `UPDATE user_settings SET user_id = ? WHERE user_id IS NULL OR user_id = 'guest'`,
        [newUserId]
      );
      console.log(`[Optikur DB] Migrated Guest SQLite records to user: ${newUserId}`);
    } catch (err) {
      console.warn("[Optikur DB] Guest data migration warning:", err);
    }
  }

  // --- Break Log Operations ---
  public async logBreak(
    durationSeconds: number,
    completed: boolean,
    breakType: "short_break" | "long_break" | "exercise" = "short_break",
    userId?: string | null
  ): Promise<void> {
    await this.init();
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const nowISO = new Date().toISOString();
    const todayStr = nowISO.split("T")[0];

    if (this.db) {
      try {
        await this.db.execute(
          `INSERT INTO break_logs (id, user_id, timestamp, duration_seconds, completed, break_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, userId || null, nowISO, durationSeconds, completed ? 1 : 0, breakType, nowISO]
        );
        if (completed) {
          await this.incrementDailyStats(todayStr, userId);
        }
      } catch (err) {
        console.error("[Optikur DB] Failed to log break:", err);
      }
    }
  }

  // --- Daily Stats & Streak Operations ---
  public async incrementDailyStats(dateStr: string, userId?: string | null): Promise<void> {
    if (!this.db) return;
    try {
      const existing = await this.db.get<DailyStatsRecord>(
        `SELECT * FROM daily_stats WHERE date = ? AND (user_id = ? OR user_id IS NULL) LIMIT 1`,
        [dateStr, userId || null]
      );

      const nowISO = new Date().toISOString();
      if (existing) {
        await this.db.execute(
          `UPDATE daily_stats SET breaks_completed = breaks_completed + 1, updated_at = ? WHERE id = ?`,
          [nowISO, existing.id]
        );
      } else {
        const id = "stats_" + dateStr;
        await this.db.execute(
          `INSERT INTO daily_stats (id, user_id, date, breaks_completed, streak_days, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, userId || null, dateStr, 1, 1, nowISO]
        );
      }
    } catch (err) {
      console.error("[Optikur DB] Failed to update daily stats:", err);
    }
  }

  public async getBreaksToday(dateStr: string, userId?: string | null): Promise<number> {
    await this.init();
    if (!this.db) return 0;
    try {
      const row = await this.db.get<DailyStatsRecord>(
        `SELECT breaks_completed FROM daily_stats WHERE date = ? AND (user_id = ? OR (user_id IS NULL AND ? IS NULL)) LIMIT 1`,
        [dateStr, userId || null, userId || null]
      );
      return row ? row.breaks_completed : 0;
    } catch {
      return 0;
    }
  }

  public async getWeeklyStats(userId?: string | null): Promise<{ day: string; breaks: number }[]> {
    await this.init();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result: { day: string; breaks: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = i === 0 ? "Today" : daysOfWeek[d.getDay()];

      let breaks = 0;
      if (this.db) {
        try {
          const row = await this.db.get<DailyStatsRecord>(
            `SELECT breaks_completed FROM daily_stats WHERE date = ? AND (user_id = ? OR (user_id IS NULL AND ? IS NULL)) LIMIT 1`,
            [dateStr, userId || null, userId || null]
          );
          if (row) breaks = row.breaks_completed;
        } catch {
          // Fallback to 0 if table not ready
        }
      }
      result.push({ day: dayLabel, breaks });
    }

    return result;
  }
}

export const dbManager = DatabaseManager.getInstance();
