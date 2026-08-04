import { useTimer } from "../context/TimerContext";
import { EyeIcon, SparklesIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function BreakOverlay() {
  const {
    isBreakOverlayOpen,
    timeRemaining,
    restSeconds,
    strictMode,
    skipBreak,
    completeBreak,
  } = useTimer();

  if (!isBreakOverlayOpen) return null;

  const progressPercent = Math.max(0, Math.min(100, ((restSeconds - timeRemaining) / restSeconds) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-2xl text-white p-6 transition-all duration-300 animate-fade-in select-none">
      {!strictMode && (
        <button
          onClick={skipBreak}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-zinc-900/60 hover:bg-zinc-800/80 rounded-full transition-colors"
          title="Skip break"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      )}

      {/* Main Glass Card */}
      <div className="flex flex-col items-center text-center max-w-sm w-full bg-zinc-900/70 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-medium">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Eye Rest Break</span>
        </div>

        {/* Minimal Breathing Ring */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="66"
              stroke="currentColor"
              strokeWidth="5"
              className="text-zinc-800"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="66"
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={415}
              strokeDashoffset={415 - (415 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="text-sky-400 transition-all duration-1000 ease-linear"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <EyeIcon className="w-6 h-6 text-sky-400 mb-1 animate-pulse" />
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {timeRemaining}s
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Look 20 feet away</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Relax your eye muscles by focusing on a distant object across the room or out a window.
          </p>
        </div>

        <button
          onClick={completeBreak}
          className="flex items-center justify-center gap-2 w-full bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-2.5 px-4 rounded-xl text-xs transition-colors shadow-xs"
        >
          <CheckIcon className="w-4 h-4" />
          <span>I've Rested My Eyes</span>
        </button>

        {strictMode && (
          <p className="text-[10px] text-zinc-500">
            🔒 Strict mode active. Complete timer to resume.
          </p>
        )}
      </div>
    </div>
  );
}
