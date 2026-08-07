import { Router, Response } from "express";
import { query } from "../db.js";
import { authenticateToken, AuthenticatedRequest } from "../auth.js";

const router = Router();

const boolToInt = (val: any) => (val ? 1 : 0);

/**
 * GET /api/sync/hydrate
 * Downloads all cloud user data from Neon PostgreSQL to populate the local SQLite database
 */
router.get("/hydrate", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // 1. Fetch User Settings
    const settingsRes = await query("SELECT * FROM user_settings WHERE user_id = $1", [userId]);
    const settings = settingsRes.rows[0] || null;

    // 2. Fetch Break Logs
    const breakLogsRes = await query(
      "SELECT id, user_id, timestamp, duration_seconds, completed, break_type, created_at FROM break_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 500",
      [userId]
    );
    const breakLogs = breakLogsRes.rows;

    // 3. Fetch Daily Stats
    const dailyStatsRes = await query(
      "SELECT id, user_id, date, breaks_completed, streak_days, updated_at FROM daily_stats WHERE user_id = $1 ORDER BY date DESC LIMIT 100",
      [userId]
    );
    const dailyStats = dailyStatsRes.rows;

    console.log(`📥 [Cloud Hydrate] Downloaded user data for: ${req.user?.email} (${breakLogs.length} breaks, ${dailyStats.length} daily stats)`);

    return res.json({
      settings,
      breakLogs,
      dailyStats,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [Hydrate Error]:", error);
    return res.status(500).json({ error: "Failed to hydrate user data from cloud." });
  }
});

/**
 * POST /api/sync/upload
 * Uploads local SQLite delta changes to Neon PostgreSQL using Last-Write-Wins (LWW)
 */
router.post("/upload", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { settings, breakLogs, dailyStats } = req.body;
    let syncedCount = 0;

    // 1. Sync User Settings
    if (settings) {
      const existing = await query("SELECT user_id FROM user_settings WHERE user_id = $1", [userId]);
      if (existing.rowCount && existing.rowCount > 0) {
        await query(
          `UPDATE user_settings SET
             focus_minutes = $1,
             rest_seconds = $2,
             sound_enabled = $3,
             strict_mode = $4,
             notifications_enabled = $5,
             overlay_notifications_enabled = $6,
             native_notifications_enabled = $7,
             background_timer_enabled = $8,
             updated_at = NOW()
           WHERE user_id = $9`,
          [
            settings.focus_minutes || 20,
            settings.rest_seconds || 20,
            boolToInt(settings.sound_enabled ?? true),
            boolToInt(settings.strict_mode ?? false),
            boolToInt(settings.notifications_enabled ?? true),
            boolToInt(settings.overlay_notifications_enabled ?? true),
            boolToInt(settings.native_notifications_enabled ?? true),
            boolToInt(settings.background_timer_enabled ?? true),
            userId,
          ]
        );
      } else {
        const settingsId = settings.id || "settings_" + userId;
        await query(
          `INSERT INTO user_settings (id, user_id, focus_minutes, rest_seconds, sound_enabled, strict_mode, notifications_enabled, overlay_notifications_enabled, native_notifications_enabled, background_timer_enabled, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [
            settingsId,
            userId,
            settings.focus_minutes || 20,
            settings.rest_seconds || 20,
            boolToInt(settings.sound_enabled ?? true),
            boolToInt(settings.strict_mode ?? false),
            boolToInt(settings.notifications_enabled ?? true),
            boolToInt(settings.overlay_notifications_enabled ?? true),
            boolToInt(settings.native_notifications_enabled ?? true),
            boolToInt(settings.background_timer_enabled ?? true),
          ]
        );
      }
      syncedCount++;
    }

    // 2. Sync Break Logs
    if (Array.isArray(breakLogs) && breakLogs.length > 0) {
      for (const item of breakLogs) {
        const existing = await query("SELECT id FROM break_logs WHERE id = $1", [item.id]);
        if (existing.rowCount && existing.rowCount > 0) {
          await query(
            `UPDATE break_logs SET
               duration_seconds = $1,
               completed = $2,
               break_type = $3
             WHERE id = $4`,
            [
              item.duration_seconds || 20,
              boolToInt(item.completed ?? true),
              item.break_type || "short_break",
              item.id,
            ]
          );
        } else {
          await query(
            `INSERT INTO break_logs (id, user_id, timestamp, duration_seconds, completed, break_type, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              item.id,
              userId,
              item.timestamp || new Date().toISOString(),
              item.duration_seconds || 20,
              boolToInt(item.completed ?? true),
              item.break_type || "short_break",
              item.created_at || new Date().toISOString(),
            ]
          );
        }
        syncedCount++;
      }
    }

    // 3. Sync Daily Stats
    if (Array.isArray(dailyStats) && dailyStats.length > 0) {
      for (const item of dailyStats) {
        const statId = item.id || `stats_${userId}_${item.date}`;
        const existing = await query("SELECT id FROM daily_stats WHERE user_id = $1 AND date = $2", [userId, item.date]);
        if (existing.rowCount && existing.rowCount > 0) {
          await query(
            `UPDATE daily_stats SET
               breaks_completed = $1,
               streak_days = $2,
               updated_at = NOW()
             WHERE user_id = $3 AND date = $4`,
            [
              item.breaks_completed || 0,
              item.streak_days || 1,
              userId,
              item.date,
            ]
          );
        } else {
          await query(
            `INSERT INTO daily_stats (id, user_id, date, breaks_completed, streak_days, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              statId,
              userId,
              item.date,
              item.breaks_completed || 0,
              item.streak_days || 1,
            ]
          );
        }
        syncedCount++;
      }
    }

    console.log(`📤 [Cloud Sync Upload] Synced ${syncedCount} records for: ${req.user?.email}`);

    return res.json({
      status: "synced",
      syncedCount,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ [Upload Error]:", error);
    return res.status(500).json({ error: "Failed to upload local changes to cloud." });
  }
});

/**
 * POST /api/sync/migrate-guest
 * Bulk migrates local Guest SQLite data to the newly created user account on Neon PostgreSQL
 */
router.post("/migrate-guest", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { guestBreakLogs, guestDailyStats, guestSettings } = req.body;
    let migratedCount = 0;

    // 1. Migrate Guest Settings
    if (guestSettings) {
      const existing = await query("SELECT user_id FROM user_settings WHERE user_id = $1", [userId]);
      if (!existing.rowCount || existing.rowCount === 0) {
        const settingsId = guestSettings.id || "settings_" + userId;
        await query(
          `INSERT INTO user_settings (id, user_id, focus_minutes, rest_seconds, sound_enabled, strict_mode, notifications_enabled, overlay_notifications_enabled, native_notifications_enabled, background_timer_enabled, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [
            settingsId,
            userId,
            guestSettings.focus_minutes || 20,
            guestSettings.rest_seconds || 20,
            boolToInt(guestSettings.sound_enabled ?? true),
            boolToInt(guestSettings.strict_mode ?? false),
            boolToInt(guestSettings.notifications_enabled ?? true),
            boolToInt(guestSettings.overlay_notifications_enabled ?? true),
            boolToInt(guestSettings.native_notifications_enabled ?? true),
            boolToInt(guestSettings.background_timer_enabled ?? true),
          ]
        );
      }
      migratedCount++;
    }

    // 2. Migrate Guest Break Logs
    if (Array.isArray(guestBreakLogs) && guestBreakLogs.length > 0) {
      for (const item of guestBreakLogs) {
        const existing = await query("SELECT id FROM break_logs WHERE id = $1", [item.id]);
        if (!existing.rowCount || existing.rowCount === 0) {
          await query(
            `INSERT INTO break_logs (id, user_id, timestamp, duration_seconds, completed, break_type, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              item.id,
              userId,
              item.timestamp || new Date().toISOString(),
              item.duration_seconds || 20,
              boolToInt(item.completed ?? true),
              item.break_type || "short_break",
              item.created_at || new Date().toISOString(),
            ]
          );
          migratedCount++;
        }
      }
    }

    // 3. Migrate Guest Daily Stats
    if (Array.isArray(guestDailyStats) && guestDailyStats.length > 0) {
      for (const item of guestDailyStats) {
        const statId = item.id || `stats_${userId}_${item.date}`;
        const existing = await query("SELECT id, breaks_completed FROM daily_stats WHERE user_id = $1 AND date = $2", [userId, item.date]);
        if (existing.rowCount && existing.rowCount > 0) {
          const currentBreaks = existing.rows[0].breaks_completed || 0;
          const mergedBreaks = Math.max(currentBreaks, item.breaks_completed || 0);
          await query(
            `UPDATE daily_stats SET breaks_completed = $1, updated_at = NOW() WHERE user_id = $2 AND date = $3`,
            [mergedBreaks, userId, item.date]
          );
        } else {
          await query(
            `INSERT INTO daily_stats (id, user_id, date, breaks_completed, streak_days, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              statId,
              userId,
              item.date,
              item.breaks_completed || 0,
              item.streak_days || 1,
            ]
          );
        }
        migratedCount++;
      }
    }

    console.log(`🔄 [Guest Migration Success] Bulk migrated ${migratedCount} guest records to user: ${req.user?.email}`);

    return res.json({
      status: "migrated",
      migratedCount,
      message: "Guest data migrated successfully to your cloud account.",
    });
  } catch (error) {
    console.error("❌ [Guest Migration Error]:", error);
    return res.status(500).json({ error: "Failed to migrate guest data." });
  }
});

export default router;
