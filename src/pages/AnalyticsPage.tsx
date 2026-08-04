import React from "react";
import { useTimer } from "../context/TimerContext";
import {
  ChartBarIcon,
  CheckCircleIcon,
  FireIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function AnalyticsPage() {
  const { totalBreaksToday, streakDays } = useTimer();

  const weeklyData = [
    { day: "Mon", breaks: 12, target: 12 },
    { day: "Tue", breaks: 15, target: 15 },
    { day: "Wed", breaks: 10, target: 14 },
    { day: "Thu", breaks: 14, target: 14 },
    { day: "Fri", breaks: 16, target: 16 },
    { day: "Sat", breaks: 8, target: 8 },
    { day: "Today", breaks: totalBreaksToday, target: 14 },
  ];

  const maxBreaks = 18;

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <ChartBarIcon className="w-7 h-7 text-blue-500" />
          <span>Eye Care Analytics & Metrics</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track your daily break compliance, streak milestones, and digital fatigue protection stats.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatTile
          label="Breaks Completed Today"
          value={totalBreaksToday.toString()}
          subtext="Target: 14 breaks"
          icon={CheckCircleIcon}
          color="text-emerald-500"
        />
        <StatTile
          label="Active Habit Streak"
          value={`${streakDays} Days`}
          subtext="Consistent eye protection"
          icon={FireIcon}
          color="text-amber-500"
        />
        <StatTile
          label="Rest Compliance Rate"
          value="94%"
          subtext="+6% vs last week"
          icon={SparklesIcon}
          color="text-blue-500"
        />
        <StatTile
          label="Est. Eye Strain Prevented"
          value="45 Mins"
          subtext="Based on 20-20-20 rule"
          icon={ShieldCheckIcon}
          color="text-indigo-500"
        />
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Weekly Break Completion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Breaks taken per day over the past 7 days</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span> Completed
            </span>
          </div>
        </div>

        {/* Bar Chart Container */}
        <div className="h-56 flex items-end justify-between gap-4 pt-8 px-4 border-b border-slate-100 dark:border-slate-800">
          {weeklyData.map((item) => {
            const heightPercent = Math.min(100, (item.breaks / maxBreaks) * 100);
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.breaks}
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-2xl h-40 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-2xl transition-all duration-700 group-hover:brightness-110"
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wellness Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 border border-indigo-800/50 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <ClockIcon className="w-4 h-4" />
            <span>Ergonomics Tip</span>
          </div>
          <h4 className="font-bold text-lg">Monitor Distance & Angle</h4>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Position your computer monitor 20 to 24 inches away from your eyes. The top of the screen should be at or slightly below eye level.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-6 border border-blue-800/50 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <SparklesIcon className="w-4 h-4" />
            <span>Hydration & Lighting</span>
          </div>
          <h4 className="font-bold text-lg">Reduce Glare & Room Contrast</h4>
          <p className="text-xs text-blue-200 leading-relaxed">
            Match ambient lighting to your screen brightness. Avoid working in dark rooms with high display glare to prevent ciliary muscle spasm.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</span>
        <span className="block text-xs text-slate-400 mt-1 font-medium">{subtext}</span>
      </div>
    </div>
  );
}
