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
} from "@heroicons/react/24/solid";
import type { TabType } from "./Sidebar";

interface TopBarProps {
  activeTab: TabType;
}

const tabTitles: Record<TabType, string> = {
  home: "Dashboard & Live Focus",
  reminders: "Break Schedules & 20-20-20 Rules",
  exercises: "Guided Eye Workouts",
  analytics: "Eye Care & Usage Analytics",
  settings: "App Settings & Preferences",
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
    <header className="flex justify-between items-center px-8 py-4 bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md sticky top-0 z-10 transition-colors">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <span>✨ illuminePal</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {tabTitles[activeTab]}
        </p>
      </div>

      {/* Right Tools Bar */}
      <div className="flex items-center gap-4">
        {/* Live Timer Pill */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-full shadow-inner">
          <button
            onClick={toggleTimer}
            className="p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            title={timerStatus === "running" ? "Pause Timer" : "Start Timer"}
          >
            {timerStatus === "running" ? (
              <PauseIcon className="w-4 h-4" />
            ) : (
              <PlayIcon className="w-4 h-4 ml-0.5" />
            )}
          </button>
          <span className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-200 min-w-[48px] text-center">
            {formattedTime}
          </span>
          <button
            onClick={triggerBreakNow}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-full font-medium transition-all shadow-sm flex items-center gap-1"
          >
            <SparklesIcon className="w-3 h-3" />
            <span>Rest</span>
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title={soundEnabled ? "Mute Break Audio" : "Enable Break Audio"}
        >
          {soundEnabled ? (
            <SpeakerWaveIcon className="w-5 h-5 text-blue-500" />
          ) : (
            <SpeakerXMarkIcon className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
        >
          {isDark ? (
            <SunIcon className="w-4 h-4 text-amber-400" />
          ) : (
            <MoonIcon className="w-4 h-4 text-indigo-500" />
          )}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>
      </div>
    </header>
  );
}
