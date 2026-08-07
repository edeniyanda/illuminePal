import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { syncManager } from "../services/SyncManager";
import {
  ExclamationTriangleIcon,
  CloudIcon,
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function LogoutModal() {
  const { isLogoutModalOpen, logoutReason, user, confirmSignOut, cancelSignOut } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isLogoutModalOpen) return null;

  const isSynced = logoutReason === "synced";
  const isOffline = logoutReason === "offline";

  const handleSyncAndRecheck = async () => {
    setIsSyncing(true);
    try {
      await syncManager.triggerSync();
    } catch {
      // Ignore sync error
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-200 select-none">
      {/* Ambient Glow */}
      <div
        className={`absolute w-72 h-72 rounded-full blur-3xl -top-10 -left-10 pointer-events-none transition-colors ${
          isSynced ? "bg-emerald-500/10" : "bg-amber-500/10"
        }`}
      />

      {/* Floating Glassmorphic Container (Apple HIG / Fluent Style) */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-900 dark:text-zinc-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={cancelSignOut}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          title="Cancel"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl p-2.5 shadow-md flex items-center justify-center border ${
              isSynced
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
            }`}
          >
            {isSynced ? (
              <CheckCircleIcon className="w-7 h-7 stroke-[2]" />
            ) : (
              <ExclamationTriangleIcon className="w-7 h-7 stroke-[2]" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isSynced ? "Confirm Log Out" : "Unsynced Data Warning"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {user ? `Account: ${user.email}` : "Please review your session state"}
            </p>
          </div>
        </div>

        {/* Status Card Banner */}
        {isSynced ? (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheckIcon className="w-4.5 h-4.5 shrink-0" />
              <span>Cloud Sync Verified (100% Synced)</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              All your break logs, daily statistics, and settings are safely saved in the cloud.
            </p>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
              Are you sure you want to log out? Your local SQLite database will be cleared from this device.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
              <CloudIcon className="w-4.5 h-4.5 shrink-0" />
              <span>
                {isOffline ? "No Internet Connection Detected" : "Unsynced Local Data Detected"}
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Logging out will remove your authentication session and local database. Any unsynced local data will be lost.
            </p>
            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
              We strongly advise you to reconnect to the internet and ensure your data finishes syncing before logging out.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isSynced ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={cancelSignOut}
              className="w-full sm:flex-1 py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => confirmSignOut(true)}
              className="w-full sm:flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Yes, Log Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleSyncAndRecheck}
                disabled={isSyncing}
                className="w-full sm:flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Now & Re-check"}</span>
              </button>

              <button
                type="button"
                onClick={() => confirmSignOut(true)}
                className="w-full sm:flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Force Log Out</span>
              </button>
            </div>

            <button
              type="button"
              onClick={cancelSignOut}
              className="w-full py-2 px-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-medium rounded-xl transition-all text-center cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
