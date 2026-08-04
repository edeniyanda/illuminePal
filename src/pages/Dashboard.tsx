import React from "react";
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
  CheckCircleIcon,
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
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl p-8 shadow-xl shadow-blue-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-md">
              <FireIcon className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>{streakDays} Day Eye Care Streak</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Keep Your Eyes Fresh & Sharp!</h2>
            <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
              Follow the <span className="font-bold underline decoration-amber-300">20-20-20 rule</span>: Every 20 minutes, look at an object 20 feet away for 20 seconds.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl text-center min-w-[110px]">
              <span className="text-3xl font-black">{totalBreaksToday}</span>
              <span className="block text-xs text-blue-100 mt-1">Breaks Today</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-4 rounded-2xl text-center min-w-[110px]">
              <span className="text-3xl font-black">{streakDays}</span>
              <span className="block text-xs text-blue-100 mt-1">Days Streak</span>
            </div>
          </div>
        </div>

        {/* Decorative Ambient Shapes */}
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Main Focus & Timer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Big Interactive Timer Ring */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            <ClockIcon className="w-4 h-4 text-blue-500" />
            <span>20-20-20 Session Timer</span>
          </div>

          {/* Progress Ring */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="105"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="128"
                cy="128"
                r="105"
                stroke="url(#timer-grad)"
                strokeWidth="12"
                strokeDasharray={660}
                strokeDashoffset={660 - (660 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timer-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tight text-slate-800 dark:text-white font-mono">
                {formattedTime}
              </span>
              <span className="text-xs font-semibold text-slate-400 capitalize mt-2 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${timerStatus === "running" ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`}></span>
                Status: {timerStatus}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold shadow-lg transition-all transform active:scale-95 ${
                timerStatus === "running"
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/25"
              }`}
            >
              {timerStatus === "running" ? (
                <>
                  <PauseIcon className="w-5 h-5" />
                  <span>Pause Focus</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-5 h-5" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-2xl transition-all"
              title="Reset Timer"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>

            <button
              onClick={triggerBreakNow}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-5 py-3 rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Take Break Now</span>
            </button>
          </div>
        </div>

        {/* Right Column: Quick Feature Cards */}
        <div className="space-y-6 flex flex-col justify-between">
          <FeatureCard
            title="Break Schedules"
            subtitle="Custom timers & strict break enforcement"
            icon={ClockIcon}
            badge="Configurable"
            buttonText="Configure"
            onClick={() => onNavigate("reminders")}
          />

          <FeatureCard
            title="Guided Exercises"
            subtitle="5 interactive visual eye exercises"
            icon={EyeIcon}
            badge="Interactive"
            buttonText="Start Workout"
            onClick={() => onNavigate("exercises")}
          />

          <FeatureCard
            title="Care Analytics"
            subtitle="View screen time & completion logs"
            icon={ChartBarIcon}
            badge="Stats"
            buttonText="View Reports"
            onClick={() => onNavigate("analytics")}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  subtitle,
  icon: Icon,
  badge,
  buttonText,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  badge: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {badge}
        </span>
      </div>

      <button
        onClick={onClick}
        className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
      >
        <span>{buttonText}</span>
        <CheckCircleIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}