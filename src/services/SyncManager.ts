import { dbManager } from "../db/db";

/**
 * Optikur Bi-Directional Sync & Data Migration Manager
 * Handles background delta synchronization between local SQLite and Neon PostgreSQL,
 * automatic network reconnect triggers, and seamless guest-to-account data migration.
 */

async function getApiUrl(): Promise<string> {
  const configuredUrl = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");
  return configuredUrl;
}

export class SyncManager {
  private static instance: SyncManager;
  private syncInProgress = false;
  private syncIntervalTimer: any = null;

  private constructor() {
    this.setupNetworkListeners();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Sets up automatic online network event listener for auto-syncing
   */
  private setupNetworkListeners() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        console.log("🌐 [SyncManager] Network reconnected online. Triggering background cloud sync...");
        this.triggerSync();
      });
    }
  }

  /**
   * Starts periodic background sync loop (every 60 seconds)
   */
  public startAutoSync(intervalMs = 60000) {
    this.stopAutoSync();
    console.log(`[SyncManager] Background auto-sync loop started (${intervalMs / 1000}s interval).`);
    this.syncIntervalTimer = setInterval(() => {
      this.triggerSync();
    }, intervalMs);
  }

  public stopAutoSync() {
    if (this.syncIntervalTimer) {
      clearInterval(this.syncIntervalTimer);
      this.syncIntervalTimer = null;
    }
  }

  /**
   * Triggers bi-directional delta synchronization between local SQLite and Neon PostgreSQL
   */
  public async triggerSync(): Promise<{ success: boolean; syncedCount?: number }> {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.log("[SyncManager] Device offline. Skipping cloud sync attempt.");
      return { success: false };
    }

    if (this.syncInProgress) {
      return { success: false };
    }

    const token = localStorage.getItem("optikur_jwt_token");
    if (!token) {
      return { success: false };
    }

    this.syncInProgress = true;
    try {
      // 1. Fetch current local settings and stats to sync
      const userSettings = await dbManager.getSettings();
      const todayStr = new Date().toISOString().split("T")[0];
      const todayBreaks = await dbManager.getBreaksToday(todayStr);

      const dailyStatsPayload = [
        {
          date: todayStr,
          breaks_completed: todayBreaks,
          streak_days: todayBreaks > 0 ? 1 : 0,
        },
      ];

      const apiUrl = await getApiUrl();
      const res = await fetch(`${apiUrl}/sync/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          settings: userSettings,
          dailyStats: dailyStatsPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Sync upload server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log(`✅ [SyncManager] Cloud delta sync upload completed. Server synced: ${data.syncedCount || 0} records.`);

      // 2. Fetch fresh hydration snapshot from cloud to apply any server updates
      const hydrateRes = await fetch(`${apiUrl}/sync/hydrate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (hydrateRes.ok) {
        const hydrateData = await hydrateRes.json();
        const savedUserStr = localStorage.getItem("optikur_auth_user");
        if (savedUserStr) {
          const user = JSON.parse(savedUserStr);
          await dbManager.populateCloudHydrationData(hydrateData, user.id);
        }
      }

      return { success: true, syncedCount: data.syncedCount || 0 };
    } catch (err) {
      console.warn("[SyncManager] Delta sync warning (operating in local-first offline mode):", err);
      return { success: false };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Executes seamless Guest-to-Account data migration
   */
  public async migrateGuestToAccount(token: string, userId: string): Promise<boolean> {
    try {
      console.log(`🔄 [SyncManager] Migrating guest SQLite records to cloud account (${userId})...`);

      // 1. Read guest local SQLite records
      const guestData = await dbManager.getGuestDataForMigration();

      if (!guestData.settings && guestData.breakLogs.length === 0 && guestData.dailyStats.length === 0) {
        console.log("[SyncManager] No guest data found to migrate.");
        return true;
      }

      const apiUrl = await getApiUrl();
      const res = await fetch(`${apiUrl}/sync/migrate-guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          guestSettings: guestData.settings,
          guestBreakLogs: guestData.breakLogs,
          guestDailyStats: guestData.dailyStats,
        }),
      });

      if (!res.ok) {
        throw new Error(`Guest migration HTTP ${res.status}`);
      }

      const result = await res.json();
      console.log(`✅ [SyncManager] Guest data migration succeeded! Bulk migrated ${result.migratedCount} records to Neon PostgreSQL.`);

      // 2. Initialize user database & populate with merged cloud hydration payload
      await dbManager.init(userId);

      const hydrateRes = await fetch(`${apiUrl}/sync/hydrate`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (hydrateRes.ok) {
        const hydratePayload = await hydrateRes.json();
        await dbManager.populateCloudHydrationData(hydratePayload, userId);
      }

      return true;
    } catch (err) {
      console.error("❌ [SyncManager] Guest migration error:", err);
      return false;
    }
  }
}

export const syncManager = SyncManager.getInstance();
