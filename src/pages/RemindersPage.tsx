import { useTimer } from "../context/TimerContext";
import {
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

export default function RemindersPage() {
  const {
    focusMinutes,
    restSeconds,
    soundEnabled,
    strictMode,
    setSoundEnabled,
    setStrictMode,
    updateTimerConfig,
    triggerBreakNow,
  } = useTimer();

  const presets = [
    { title: "20-20-20 Rule", focus: 20, rest: 20, desc: "Standard recommended eye rest protocol" },
    { title: "Pomodoro Eye Care", focus: 25, rest: 300, desc: "25 min focus with 5 min break" },
    { title: "Deep Work Focus", focus: 50, rest: 600, desc: "50 min focus with 10 min break" },
  ];

  return (
    <div className="p-8 w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <ClockIcon className="w-7 h-7 text-blue-500" />
          <span>Break Schedules & Reminders</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Customize your break frequencies, strict enforcement modes, and sound alerts.
        </p>
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {presets.map((preset) => {
          const isSelected = focusMinutes === preset.focus && restSeconds === preset.rest;
          return (
            <div
              key={preset.title}
              onClick={() => updateTimerConfig(preset.focus, preset.rest)}
              className={`p-6 rounded-3xl cursor-pointer border transition-all ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/25 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 hover:border-blue-400"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  Preset
                </span>
                {isSelected && <SparklesIcon className="w-5 h-5 text-amber-300" />}
              </div>
              <h3 className="font-bold text-lg mb-1">{preset.title}</h3>
              <p className={`text-xs mb-4 ${isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                {preset.desc}
              </p>
              <div className="font-mono text-sm font-semibold">
                {preset.focus}m Focus / {preset.rest >= 60 ? `${preset.rest / 60}m` : `${preset.rest}s`} Rest
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Configuration Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Custom Interval Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Focus Duration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Focus Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={focusMinutes}
              onChange={(e) => updateTimerConfig(Math.max(1, parseInt(e.target.value) || 20), restSeconds)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-3 rounded-2xl font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Rest Duration */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Rest Duration (Seconds)
            </label>
            <input
              type="number"
              min="5"
              max="1800"
              value={restSeconds}
              onChange={(e) => updateTimerConfig(focusMinutes, Math.max(5, parseInt(e.target.value) || 20))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-3 rounded-2xl font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 text-indigo-500" />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Strict Break Mode</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Prevents skipping or closing the break overlay until break timer completes.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <SpeakerWaveIcon className="w-6 h-6 text-blue-500" />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Audio Sound Chimes</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Play soothing audio tone chimes when break starts and completes.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={triggerBreakNow}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all"
          >
            <BellAlertIcon className="w-5 h-5" />
            <span>Test Break Notification</span>
          </button>
        </div>
      </div>
    </div>
  );
}
