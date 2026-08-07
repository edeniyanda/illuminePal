import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useTimer } from "../context/TimerContext";
import { useAuth } from "../context/AuthContext";
import { dbManager } from "../db/db";
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CloudIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { TabType } from "./Sidebar";

interface TopBarProps {
  activeTab: TabType;
}

const tabTitles: Record<TabType, string> = {
  home: "Dashboard",
  reminders: "Schedules & Rules",
  exercises: "Eye Exercises",
  analytics: "Care Analytics",
  settings: "Settings",
};

export default function TopBar({ activeTab }: TopBarProps) {
  const { themeMode, setThemeMode } = useTheme();
  const { authState, user, openAuthModal, requestSignOut } = useAuth();
  const {
    timeRemaining,
    timerStatus,
    soundEnabled,
    toggleTimer,
    triggerBreakNow,
    setSoundEnabled,
  } = useTimer();

  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "offline">("synced");

  // Track online/offline status and PowerSync sync state reactively
  useEffect(() => {
    const handleOnline = () => setSyncStatus("synced");
    const handleOffline = () => setSyncStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Periodic lightweight sync state check
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        setSyncStatus("offline");
      } else if (dbManager.db?.currentStatus?.connecting) {
        setSyncStatus("syncing");
      } else {
        setSyncStatus("synced");
      }
    }, 3000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <header className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-950/80 border-b border-zinc-200/60 dark:border-zinc-800/60 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between transition-colors select-none">
      <div>
        <h1 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {tabTitles[activeTab]}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Cloud Sync Indicator (when Authenticated) */}
        {authState === "authenticated" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 rounded-full text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
            {syncStatus === "synced" && (
              <>
                <CloudIcon className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-sky-600 dark:text-sky-400 font-semibold">Synced</span>
              </>
            )}
            {syncStatus === "syncing" && (
              <>
                <ArrowPathIcon className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Syncing...</span>
              </>
            )}
            {syncStatus === "offline" && (
              <>
                <CloudIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Offline Mode</span>
              </>
            )}
          </div>
        )}

        {/* Auth Status Pill / Profile Badge */}
        {authState === "authenticated" && user ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("optikur:open-profile"))}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 transition-all shadow-xs cursor-pointer"
              title={`Signed in as ${user.email} (Click to manage profile)`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <div className="w-4 h-4 rounded-full bg-sky-500 text-[9px] font-bold text-white flex items-center justify-center uppercase">
                {user.name?.[0] || user.email[0]}
              </div>
              <span className="max-w-[90px] truncate">{user.name}</span>
            </button>
            <button
              onClick={requestSignOut}
              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-zinc-200/60 dark:hover:bg-zinc-900/60 transition-colors"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded-full text-[11px] font-semibold text-sky-600 dark:text-sky-400 transition-all shadow-xs cursor-pointer"
            title="Guest Mode active. Click to sign in or create an account."
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            <UserIcon className="w-3.5 h-3.5" />
            <span>Guest (Sign In)</span>
          </button>
        )}

        {/* Minimalist Timer Segment */}
        <div className="flex items-center gap-2 bg-zinc-200/50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 px-3 py-1 rounded-full text-xs font-medium">
          <button
            onClick={toggleTimer}
            className="text-zinc-600 dark:text-zinc-300 hover:text-sky-500 transition-colors"
            title={timerStatus === "running" ? "Pause" : "Start"}
          >
            {timerStatus === "running" ? (
              <PauseIcon className="w-3.5 h-3.5" />
            ) : (
              <PlayIcon className="w-3.5 h-3.5" />
            )}
          </button>
          <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium min-w-[42px] text-center">
            {formattedTime}
          </span>
          <button
            onClick={triggerBreakNow}
            className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 ml-1"
          >
            <SparklesIcon className="w-3 h-3" />
            <span>Rest</span>
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900/60 transition-colors"
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? (
            <SpeakerWaveIcon className="w-4 h-4 text-sky-500" />
          ) : (
            <SpeakerXMarkIcon className="w-4 h-4" />
          )}
        </button>

        {/* Native Segmented Theme Control */}
        <div className="flex items-center bg-zinc-200/60 dark:bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60">
          <ThemeSegmentButton
            active={themeMode === "light"}
            onClick={() => setThemeMode("light")}
            title="Light Theme"
            icon={SunIcon}
          />
          <ThemeSegmentButton
            active={themeMode === "dark"}
            onClick={() => setThemeMode("dark")}
            title="Dark Theme"
            icon={MoonIcon}
          />
          <ThemeSegmentButton
            active={themeMode === "system"}
            onClick={() => setThemeMode("system")}
            title="System Default Theme"
            icon={ComputerDesktopIcon}
          />
        </div>
      </div>
    </header>
  );
}

function ThemeSegmentButton({
  active,
  onClick,
  title,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1 rounded-md transition-all ${
        active
          ? "bg-white dark:bg-zinc-800 text-sky-600 dark:text-sky-400 shadow-xs font-semibold"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
