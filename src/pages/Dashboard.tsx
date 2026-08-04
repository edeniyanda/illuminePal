import { useTimer } from "../context/TimerContext";
import {
  FireIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  SparklesIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface DashboardProps {
  onNavigate: (tab: "home" | "reminders" | "exercises" | "analytics" | "settings") => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const {
    focusMinutes,
    timeRemaining,
    timerStatus,
    totalBreaksToday,
    streakDays,
    toggleTimer,
    resetTimer,
    triggerBreakNow,
  } = useTimer();

  const totalSeconds = focusMinutes * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - timeRemaining) / totalSeconds) * 100));

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Soft Hero Summary Card */}
      <div className="bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent border border-sky-500/15 dark:border-sky-400/10 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-medium">
            <FireIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{streakDays} Day Streak</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Protect your vision with the 20-20-20 rule
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-lg">
            Every 20 minutes, focus on an object 20 feet away for 20 seconds to ease eye strain.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <div className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 px-4 py-3 rounded-xl text-center min-w-[90px]">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalBreaksToday}</span>
            <span className="block text-[10px] text-zinc-400 font-medium">Breaks Today</span>
          </div>
          <div className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 px-4 py-3 rounded-xl text-center min-w-[90px]">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{streakDays}</span>
            <span className="block text-[10px] text-zinc-400 font-medium">Days Active</span>
          </div>
        </div>
      </div>

      {/* Main Focus Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Card */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-4">
            <ClockIcon className="w-3.5 h-3.5 text-sky-500" />
            <span>Focus Session</span>
          </div>

          {/* Thin Minimalist SVG Ring */}
          <div className="relative w-52 h-52 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="104"
                cy="104"
                r="86"
                stroke="currentColor"
                strokeWidth="6"
                className="text-zinc-100 dark:text-zinc-800/80"
                fill="transparent"
              />
              <circle
                cx="104"
                cy="104"
                r="86"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={540}
                strokeDashoffset={540 - (540 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="text-sky-500 transition-all duration-1000 ease-linear"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono tracking-tight">
                {formattedTime}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium capitalize mt-1 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${timerStatus === "running" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                {timerStatus}
              </span>
            </div>
          </div>

          {/* Quiet Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={toggleTimer}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium px-4 py-2 rounded-xl text-xs transition-colors shadow-xs"
            >
              {timerStatus === "running" ? (
                <>
                  <PauseIcon className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-3.5 h-3.5" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors"
              title="Reset Timer"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>

            <button
              onClick={triggerBreakNow}
              className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-medium px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Rest Now</span>
            </button>
          </div>
        </div>

        {/* Feature Tiles */}
        <div className="space-y-4 flex flex-col justify-between">
          <MinimalTile
            title="Break Schedules"
            subtitle="Custom timers & rules"
            icon={ClockIcon}
            onClick={() => onNavigate("reminders")}
          />

          <MinimalTile
            title="Guided Exercises"
            subtitle="Visual eye relaxation"
            icon={EyeIcon}
            onClick={() => onNavigate("exercises")}
          />

          <MinimalTile
            title="Care Analytics"
            subtitle="View rest metrics"
            icon={ChartBarIcon}
            onClick={() => onNavigate("analytics")}
          />
        </div>
      </div>
    </div>
  );
}

function MinimalTile({
  title,
  subtitle,
  icon: Icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 p-4 rounded-2xl cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group shadow-xs"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{title}</h3>
          <p className="text-[11px] text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <ChevronRightIcon className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
    </div>
  );
}