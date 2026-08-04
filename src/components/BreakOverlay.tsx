import { useTimer } from "../context/TimerContext";
import { EyeIcon, SparklesIcon, CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl text-white p-6 transition-all duration-500 animate-fade-in">
      {!strictMode && (
        <button
          onClick={skipBreak}
          className="absolute top-6 right-6 flex items-center gap-1 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-4 py-2 rounded-full text-sm transition-all"
        >
          <XMarkIcon className="w-5 h-5" />
          <span>Skip Break</span>
        </button>
      )}

      {/* Main Glass Card */}
      <div className="flex flex-col items-center text-center max-w-lg w-full bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold uppercase tracking-wider mb-6">
          <SparklesIcon className="w-4 h-4 animate-spin-slow" />
          <span>20-20-20 Eye Care Session</span>
        </div>

        {/* Breathing Circle Container */}
        <div className="relative flex items-center justify-center w-48 h-48 mb-8">
          {/* Animated Glow Pulse */}
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-75 blur-xl"></div>

          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="url(#blue-gradient)"
              strokeWidth="8"
              strokeDasharray={502}
              strokeDashoffset={502 - (502 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Inner Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <EyeIcon className="w-8 h-8 text-blue-400 mb-1 animate-pulse" />
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {timeRemaining}s
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Remaining</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-white">Look Away into the Distance</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          Focus your gaze on an object at least <span className="text-blue-400 font-semibold">20 feet (6 meters)</span> away to relax your eye muscles and reduce digital fatigue.
        </p>

        {/* Action Button */}
        <button
          onClick={completeBreak}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
        >
          <CheckCircleIcon className="w-5 h-5" />
          <span>I've Rested My Eyes</span>
        </button>

        {strictMode && (
          <p className="text-xs text-slate-500 mt-4">
            🔒 Strict Mode is active. Complete your break to return to work.
          </p>
        )}
      </div>
    </div>
  );
}
