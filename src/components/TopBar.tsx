import { useTheme } from "../context/ThemeContext";
import { useTimer } from "../context/TimerContext";
import {
  SunIcon,
  MoonIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
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
  const { isDark, toggleTheme } = useTheme();
  const {
    timeRemaining,
    timerStatus,
    soundEnabled,
    toggleTimer,
    triggerBreakNow,
    setSoundEnabled,
  } = useTimer();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <header className="px-6 py-3.5 bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between transition-colors select-none">
      <div>
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          {tabTitles[activeTab]}
        </h1>
      </div>

      <div className="flex items-center gap-3">
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

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900/60 transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <SunIcon className="w-4 h-4 text-amber-400" />
          ) : (
            <MoonIcon className="w-4 h-4 text-zinc-600" />
          )}
        </button>
      </div>
    </header>
  );
}
