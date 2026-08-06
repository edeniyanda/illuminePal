import { useAuth } from "../context/AuthContext";
import {
  ExclamationTriangleIcon,
  CloudIcon,
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function LogoutModal() {
  const { isLogoutModalOpen, logoutReason, confirmSignOut, cancelSignOut } = useAuth();

  if (!isLogoutModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 dark:bg-black/75 backdrop-blur-md transition-all animate-in fade-in duration-200">
      {/* Subtle Warning Ambient Glow */}
      <div className="absolute w-72 h-72 bg-amber-500/10 rounded-full blur-3xl -top-10 -left-10 pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-900 dark:text-zinc-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={cancelSignOut}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors"
          title="Cancel"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal Header Badge */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 p-2.5 shadow-md flex items-center justify-center">
            <ExclamationTriangleIcon className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Unsynced Data & Database Removal Warning
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Please review your data sync status before logging out.
            </p>
          </div>
        </div>

        {/* Warning Card Banner */}
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
            <CloudIcon className="w-4 h-4 shrink-0" />
            <span>
              {logoutReason === "offline"
                ? "No Internet Connection Detected"
                : "Unsynced Data Detected"}
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Logging out will remove your authentication session and local SQLite database from this device. Any unsynced data will be lost.
          </p>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
            We advise you to reconnect to the internet and allow your data to finish syncing before logging out if you wish to preserve your latest changes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={cancelSignOut}
            className="w-full sm:flex-1 py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Reconnect & Sync</span>
          </button>

          <button
            type="button"
            onClick={() => confirmSignOut(true)}
            className="w-full sm:flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Log Out & Delete Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
