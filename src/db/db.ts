import { PowerSyncDatabase } from "@powersync/web";
import { AppSchema, DailyStatsRecord } from "./AppSchema";

/**
 * Local-First Database Manager for Optikur
 * Handles zero-latency SQLite persistence for guest & authenticated users.
 * Degrades gracefully if database initialization takes time.
 */

export class DatabaseManager {
  private static instance: DatabaseManager;
  public db: PowerSyncDatabase | null = null;
  private initPromise: Promise<void> | null = null;

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

        await powersync.init();
        this.db = powersync;
        console.log("[Optikur DB] SQLite Database initialized successfully.");
      } catch (error) {
        console.warn("[Optikur DB] PowerSync SQLite initialization warning (using local fallback state):", error);
      }
    })();

    return this.initPromise;
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
        `SELECT breaks_completed FROM daily_stats WHERE date = ? AND (user_id = ? OR user_id IS NULL) LIMIT 1`,
        [dateStr, userId || null]
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
            `SELECT breaks_completed FROM daily_stats WHERE date = ? AND (user_id = ? OR user_id IS NULL) LIMIT 1`,
            [dateStr, userId || null]
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
