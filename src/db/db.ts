import { PowerSyncDatabase } from "@powersync/web";
import { AppSchema, DailyStatsRecord, UserSettingsRecord, BreakLogRecord } from "./AppSchema";

/**
 * Optikur Local SQLite Database Engine
 * Zero-latency local storage with user-partitioned database files,
 * cloud hydration, unsynced record tracking, and secure logout teardown.
 */

export interface CloudHydrationPayload {
  settings?: any;
  breakLogs?: any[];
  dailyStats?: any[];
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  public db: PowerSyncDatabase | null = null;
  private currentUserId: string | null = null;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Generates secure user-partitioned SQLite filename
   */
  private getDbFilename(userId?: string | null): string {
    if (userId) {
      // Secure user-partitioned database name
      const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
      return `optikur_user_${safeId}.db`;
    }
    return "optikur_guest.db";
  }

  /**
   * Initializes local SQLite database for specified user or guest
   */
  public async init(userId?: string | null): Promise<void> {
    const targetDbName = this.getDbFilename(userId);

    // If database is already initialized for the requested user, return
    if (this.db && this.currentUserId === (userId || null)) {
      return;
    }

    if (this.initPromise) {
      await this.initPromise;
      if (this.db && this.currentUserId === (userId || null)) {
        return;
      }
    }

    this.initPromise = (async () => {
      try {
        if (this.db) {
          try {
            await this.db.disconnect();
          } catch {
            // Ignore disconnect error on switch
          }
          this.db = null;
        }

        console.log(`[Optikur Local DB] Initializing local SQLite database: ${targetDbName}`);
        const powersync = new PowerSyncDatabase({
          schema: AppSchema,
          database: {
            dbFilename: targetDbName,
          },
        });

        // 3-second timeout guard so SQLite init never hangs callers indefinitely
        const initTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Local SQLite init timeout")), 3000)
        );

        await Promise.race([powersync.init(), initTimeout]);
        this.db = powersync;
        this.currentUserId = userId || null;
        console.log(`✅ [Optikur Local DB] Local SQLite initialized for: ${userId || "guest"}`);
      } catch (error) {
        console.warn(`[Optikur Local DB] Local SQLite init warning for ${targetDbName}:`, error);
      }
    })();

    return this.initPromise;
  }

  /**
   * Populates local SQLite database with cloud dataset downloaded during sign in hydration
   */
  public async populateCloudHydrationData(payload: CloudHydrationPayload, userId: string): Promise<void> {
    await this.init(userId);
    if (!this.db) return;

    try {
      const now = new Date().toISOString();

      // 1. Populate User Settings
      if (payload.settings) {
        const s = payload.settings;
        await this.db.execute(
          `INSERT INTO user_settings (id, user_id, focus_minutes, rest_seconds, sound_enabled, strict_mode, notifications_enabled, overlay_notifications_enabled, native_notifications_enabled, background_timer_enabled, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (user_id) DO UPDATE SET
             focus_minutes = EXCLUDED.focus_minutes,
             rest_seconds = EXCLUDED.rest_seconds,
             sound_enabled = EXCLUDED.sound_enabled,
             strict_mode = EXCLUDED.strict_mode,
             notifications_enabled = EXCLUDED.notifications_enabled,
             overlay_notifications_enabled = EXCLUDED.overlay_notifications_enabled,
             native_notifications_enabled = EXCLUDED.native_notifications_enabled,
             background_timer_enabled = EXCLUDED.background_timer_enabled,
             updated_at = EXCLUDED.updated_at`,
          [
            s.id || `settings_${userId}`,
            userId,
            s.focus_minutes || 20,
            s.rest_seconds || 20,
            s.sound_enabled ? 1 : 0,
            s.strict_mode ? 1 : 0,
            s.notifications_enabled ? 1 : 0,
            s.overlay_notifications_enabled ? 1 : 0,
            s.native_notifications_enabled ? 1 : 0,
            s.background_timer_enabled ? 1 : 0,
            s.updated_at || now,
          ]
        );
      }

      // 2. Populate Break Logs
      if (Array.isArray(payload.breakLogs) && payload.breakLogs.length > 0) {
        for (const log of payload.breakLogs) {
          await this.db.execute(
            `INSERT INTO break_logs (id, user_id, timestamp, duration_seconds, completed, break_type, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT (id) DO UPDATE SET
               completed = EXCLUDED.completed,
               duration_seconds = EXCLUDED.duration_seconds`,
            [
              log.id,
              userId,
              log.timestamp || now,
              log.duration_seconds || 20,
              log.completed ? 1 : 0,
              log.break_type || "short_break",
              log.created_at || now,
            ]
          );
        }
      }

      // 3. Populate Daily Stats
      if (Array.isArray(payload.dailyStats) && payload.dailyStats.length > 0) {
        for (const stat of payload.dailyStats) {
          await this.db.execute(
            `INSERT INTO daily_stats (id, user_id, date, breaks_completed, streak_days, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT (id) DO UPDATE SET
               breaks_completed = EXCLUDED.breaks_completed,
               streak_days = EXCLUDED.streak_days,
               updated_at = EXCLUDED.updated_at`,
            [
              stat.id || `stats_${userId}_${stat.date}`,
              userId,
              stat.date,
              stat.breaks_completed || 0,
              stat.streak_days || 1,
              stat.updated_at || now,
            ]
          );
        }
      }

      console.log(`📥 [Optikur Local DB] Cloud hydration dataset stored in local SQLite database.`);
    } catch (err) {
      console.error("[Optikur Local DB] Error populating cloud hydration data:", err);
    }
  }

  /**
   * Complete local database purge on logout
   * Deletes all SQLite table records and resets database connection to Guest Mode
   */
  public async purgeLocalDatabase(userId?: string | null): Promise<void> {
    try {
      await this.init(userId);
      if (this.db) {
        await this.db.execute(`DELETE FROM break_logs`);
        await this.db.execute(`DELETE FROM daily_stats`);
        await this.db.execute(`DELETE FROM user_settings`);
        console.log(`🗑️ [Optikur Local DB] Purged all local SQLite table records for: ${userId || "guest"}`);
      }
    } catch (err) {
      console.warn("[Optikur Local DB] Purge local database warning:", err);
    } finally {
      this.currentUserId = null;
      // Re-initialize clean guest database
      await this.init(null).catch(() => {});
    }
  }

  /**
   * Checks if there are pending unsynced local records or if device is offline
   */
  public async hasPendingSync(): Promise<boolean> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return true;
    }
    if (this.db) {
      try {
        const status = (this.db as any).currentStatus;
        if (status?.uploading || status?.connecting || status?.hasUnsyncedData) {
          return true;
        }
      } catch {
        // Status property fallback
      }
    }
    return false;
  }

  // --- Break Log Operations ---
  public async logBreak(
    durationSeconds: number,
    completed: boolean,
    breakType: "short_break" | "long_break" | "exercise" = "short_break",
    userId?: string | null
  ): Promise<void> {
    await this.init(userId);
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
        console.error("[Optikur Local DB] Failed to log break locally:", err);
      }
    }
  }

  // --- Daily Stats Operations ---
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
        const id = "stats_" + (userId || "guest") + "_" + dateStr;
        await this.db.execute(
          `INSERT INTO daily_stats (id, user_id, date, breaks_completed, streak_days, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, userId || null, dateStr, 1, 1, nowISO]
        );
      }
    } catch (err) {
      console.error("[Optikur Local DB] Failed to update daily stats locally:", err);
    }
  }

  public async getBreaksToday(dateStr: string, userId?: string | null): Promise<number> {
    await this.init(userId);
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
    await this.init(userId);
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

  // --- Settings Operations ---
  public async getSettings(userId?: string | null): Promise<UserSettingsRecord | null> {
    await this.init(userId);
    if (!this.db) return null;
    try {
      const row = await this.db.get<UserSettingsRecord>(
        `SELECT * FROM user_settings WHERE user_id = ? OR (user_id IS NULL AND ? IS NULL) LIMIT 1`,
        [userId || null, userId || null]
      );
      return row || null;
    } catch {
      return null;
    }
  }

  public async saveSettings(settings: Partial<UserSettingsRecord>, userId?: string | null): Promise<void> {
    await this.init(userId);
    if (!this.db) return;
    try {
      const existing = await this.getSettings(userId);
      const nowISO = new Date().toISOString();
      const id = existing?.id || "settings_" + (userId || "guest");

      if (existing) {
        await this.db.execute(
          `UPDATE user_settings SET
             focus_minutes = ?,
             rest_seconds = ?,
             sound_enabled = ?,
             strict_mode = ?,
             notifications_enabled = ?,
             overlay_notifications_enabled = ?,
             native_notifications_enabled = ?,
             background_timer_enabled = ?,
             updated_at = ?
           WHERE id = ?`,
          [
            settings.focus_minutes ?? existing.focus_minutes,
            settings.rest_seconds ?? existing.rest_seconds,
            settings.sound_enabled ?? existing.sound_enabled,
            settings.strict_mode ?? existing.strict_mode,
            settings.notifications_enabled ?? existing.notifications_enabled,
            settings.overlay_notifications_enabled ?? existing.overlay_notifications_enabled,
            settings.native_notifications_enabled ?? existing.native_notifications_enabled,
            settings.background_timer_enabled ?? existing.background_timer_enabled,
            nowISO,
            id,
          ]
        );
      } else {
        await this.db.execute(
          `INSERT INTO user_settings (id, user_id, focus_minutes, rest_seconds, sound_enabled, strict_mode, notifications_enabled, overlay_notifications_enabled, native_notifications_enabled, background_timer_enabled, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            userId || null,
            settings.focus_minutes ?? 20,
            settings.rest_seconds ?? 20,
            settings.sound_enabled ?? 1,
            settings.strict_mode ?? 0,
            settings.notifications_enabled ?? 1,
            settings.overlay_notifications_enabled ?? 1,
            settings.native_notifications_enabled ?? 1,
            settings.background_timer_enabled ?? 1,
            nowISO,
          ]
        );
      }
      console.log(`[Optikur Local DB] Local settings saved for: ${userId || "guest"}`);
    } catch (err) {
      console.error("[Optikur Local DB] Failed to save settings locally:", err);
    }
  }

  /**
   * Reads all guest records for account migration
   */
  public async getGuestDataForMigration(): Promise<{
    breakLogs: BreakLogRecord[];
    dailyStats: DailyStatsRecord[];
    settings: UserSettingsRecord | null;
  }> {
    await this.init(null);
    if (!this.db) {
      return { breakLogs: [], dailyStats: [], settings: null };
    }

    try {
      const logs = await this.db.getAll<BreakLogRecord>(
        `SELECT * FROM break_logs WHERE user_id IS NULL OR user_id = 'guest'`
      );
      const stats = await this.db.getAll<DailyStatsRecord>(
        `SELECT * FROM daily_stats WHERE user_id IS NULL OR user_id = 'guest'`
      );
      const settings = await this.db.get<UserSettingsRecord>(
        `SELECT * FROM user_settings WHERE user_id IS NULL OR user_id = 'guest' LIMIT 1`
      );

      return {
        breakLogs: logs || [],
        dailyStats: stats || [],
        settings: settings || null,
      };
    } catch {
      return { breakLogs: [], dailyStats: [], settings: null };
    }
  }
}

export const dbManager = DatabaseManager.getInstance();
