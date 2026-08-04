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
    { day: "Mon", breaks: 12 },
    { day: "Tue", breaks: 15 },
    { day: "Wed", breaks: 10 },
    { day: "Thu", breaks: 14 },
    { day: "Fri", breaks: 16 },
    { day: "Sat", breaks: 8 },
    { day: "Today", breaks: totalBreaksToday },
  ];

  const maxBreaks = 18;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-sky-500" />
          <span>Care Analytics</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Overview of completed breaks and weekly rest consistency.
        </p>
      </div>

      {/* Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Breaks Today"
          value={totalBreaksToday.toString()}
          subtext="Target: 14 breaks"
          icon={CheckCircleIcon}
          color="text-emerald-500"
        />
        <StatTile
          label="Habit Streak"
          value={`${streakDays} Days`}
          subtext="Consecutive days active"
          icon={FireIcon}
          color="text-amber-500"
        />
        <StatTile
          label="Rest Compliance"
          value="94%"
          subtext="+6% vs last week"
          icon={SparklesIcon}
          color="text-sky-500"
        />
        <StatTile
          label="Strain Prevented"
          value="45 Mins"
          subtext="Based on 20-20-20 rule"
          icon={ShieldCheckIcon}
          color="text-indigo-500"
        />
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Weekly Activity
            </h3>
            <p className="text-[11px] text-zinc-400">Breaks completed per day</p>
          </div>
        </div>

        {/* Minimal Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2 border-b border-zinc-100 dark:border-zinc-800/60">
          {weeklyData.map((item) => {
            const heightPercent = Math.min(100, (item.breaks / maxBreaks) * 100);
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] font-mono font-medium text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.breaks}
                </span>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-t-lg h-32 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-sky-500 rounded-t-lg transition-all duration-500 group-hover:bg-sky-400"
                  ></div>
                </div>
                <span className="text-[11px] font-medium text-zinc-400">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ergonomic Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-900 text-white rounded-2xl p-5 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-semibold uppercase tracking-wider">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>Ergonomics</span>
          </div>
          <h4 className="font-semibold text-sm">Monitor Position</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Keep your display 20 to 24 inches from your eyes with the top of the monitor aligned near eye level.
          </p>
        </div>

        <div className="bg-zinc-900 text-white rounded-2xl p-5 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-1.5 text-sky-400 text-[11px] font-semibold uppercase tracking-wider">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Lighting</span>
          </div>
          <h4 className="font-semibold text-sm">Ambient Contrast</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Ensure room lighting matches screen brightness to reduce ciliary muscle fatigue during prolonged sessions.
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
    <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 p-4 rounded-2xl shadow-xs flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-mono">{value}</span>
        <span className="block text-[10px] text-zinc-400 mt-0.5">{subtext}</span>
      </div>
    </div>
  );
}
