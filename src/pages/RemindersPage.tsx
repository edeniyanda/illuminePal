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
    { title: "20-20-20 Rule", focus: 20, rest: 20, desc: "Standard eye rest interval" },
    { title: "Pomodoro Care", focus: 25, rest: 300, desc: "25m work / 5m break" },
    { title: "Deep Work Focus", focus: 50, rest: 600, desc: "50m work / 10m break" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-sky-500" />
          <span>Schedules & Rules</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Configure work durations, break frequencies, and strict enforcement.
        </p>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = focusMinutes === preset.focus && restSeconds === preset.rest;
          return (
            <div
              key={preset.title}
              onClick={() => updateTimerConfig(preset.focus, preset.rest)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                isSelected
                  ? "bg-sky-500/10 border-sky-500/50 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "bg-white dark:bg-zinc-900/80 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">{preset.title}</span>
                {isSelected && <SparklesIcon className="w-4 h-4 text-sky-500" />}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">{preset.desc}</p>
              <div className="font-mono text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                {preset.focus}m work / {preset.rest >= 60 ? `${preset.rest / 60}m` : `${preset.rest}s`} break
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Inputs */}
      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 shadow-xs space-y-5">
        <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Custom Intervals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Focus Duration (Minutes)</label>
            <input
              type="number"
              min="1"
              max="120"
              value={focusMinutes}
              onChange={(e) => updateTimerConfig(Math.max(1, parseInt(e.target.value) || 20), restSeconds)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Rest Duration (Seconds)</label>
            <input
              type="number"
              min="5"
              max="1800"
              value={restSeconds}
              onChange={(e) => updateTimerConfig(focusMinutes, Math.max(5, parseInt(e.target.value) || 20))}
              className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-4 h-4 text-indigo-500" />
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Strict Mode</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Disables skipping during break overlay</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={strictMode}
              onChange={(e) => setStrictMode(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
            <div className="flex items-center gap-3">
              <SpeakerWaveIcon className="w-4 h-4 text-sky-500" />
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Sound Alerts</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Audio chimes on break start and end</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={triggerBreakNow}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <BellAlertIcon className="w-3.5 h-3.5" />
            <span>Test Break Notification</span>
          </button>
        </div>
      </div>
    </div>
  );
}
