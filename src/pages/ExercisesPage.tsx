import { useState, useEffect } from "react";
import { EyeIcon, PlayIcon, PauseIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { audioService } from "../utils/audio";

interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  instructions: string;
  type: "figure8" | "blinking" | "depth" | "sweeps";
}

const exercises: Exercise[] = [
  {
    id: "figure8",
    name: "Figure-8 Smooth Eye Trace",
    duration: 30,
    description: "Follow the target without moving your head.",
    instructions: "Follow the glowing dot as it traces a figure-8 loop.",
    type: "figure8",
  },
  {
    id: "blinking",
    name: "20-Second Rapid Blink Pacer",
    duration: 20,
    description: "Blink deeply to rehydrate dry eyes.",
    instructions: "Blink naturally each time the ring expands and shrinks.",
    type: "blinking",
  },
  {
    id: "depth",
    name: "Focus Depth Shift",
    duration: 30,
    description: "Alternate gaze between near and far points.",
    instructions: "Focus near when circle grows, look far out the window when it shrinks.",
    type: "depth",
  },
  {
    id: "sweeps",
    name: "Horizontal & Vertical Sweeps",
    duration: 30,
    description: "Stretch eye muscles with full range movement.",
    instructions: "Track the target as it sweeps smoothly across screen edges.",
    type: "sweeps",
  },
];

export default function ExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(exercises[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedExercise.duration);
  const [completedCount, setCompletedCount] = useState(0);

  // Reset exercise state when routine changes
  useEffect(() => {
    setIsPlaying(false);
    setTimeLeft(selectedExercise.duration);
  }, [selectedExercise]);

  // Page visibility API: Suspend animations & intervals when tab/window is hidden to save CPU/GPU RAM
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Main countdown timer loop with automatic cleanup
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          setCompletedCount((c) => c + 1);
          audioService.playBreakComplete();
          return selectedExercise.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, selectedExercise]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <EyeIcon className="w-5 h-5 text-indigo-500" />
            <span>Eye Exercises</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Guided visual routines to relieve eye strain and improve muscle focus.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 font-medium select-none">
          <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
          <span>Completed: {completedCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise List */}
        <div className="space-y-2">
          {exercises.map((ex) => {
            const isSelected = selectedExercise.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className={`p-3.5 rounded-xl cursor-pointer border transition-all select-none ${
                  isSelected
                    ? "bg-sky-500/10 border-sky-500/50 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "bg-white dark:bg-zinc-900/80 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-xs">{ex.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-400">{ex.duration}s</span>
                </div>
                <p className="text-[11px] text-zinc-400">{ex.description}</p>
              </div>
            );
          })}
        </div>

        {/* Visual Animation Screen */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between min-h-[380px] text-white relative">
          <div className="w-full flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider block">Routine</span>
              <h3 className="text-sm font-semibold">{selectedExercise.name}</h3>
            </div>
            <span className="text-xl font-mono font-bold text-sky-400">{timeLeft}s</span>
          </div>

          <div className="relative w-full h-48 flex items-center justify-center my-4 overflow-hidden">
            {selectedExercise.type === "figure8" && (
              <div className="relative w-full h-full flex items-center justify-center">
                <svg className="w-52 h-24 opacity-25 stroke-sky-400" fill="none" strokeWidth="2">
                  <path d="M 26,48 C 26,16 78,16 104,48 C 130,80 182,80 182,48 C 182,16 130,16 104,48 C 78,80 26,80 26,48 Z" />
                </svg>
                <div className={`absolute w-5 h-5 rounded-full bg-sky-400 shadow-md shadow-sky-400/80 ${isPlaying ? "animate-figure8" : ""}`}></div>
              </div>
            )}

            {selectedExercise.type === "blinking" && (
              <div className="relative flex items-center justify-center">
                <div className={`w-28 h-28 rounded-full border-2 border-sky-400/40 flex items-center justify-center ${isPlaying ? "animate-ping opacity-75" : ""}`}></div>
                <div className="absolute w-20 h-20 rounded-full bg-sky-500/80 backdrop-blur-md flex flex-col items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-white animate-pulse" />
                  <span className="text-[9px] uppercase font-semibold text-sky-100 mt-0.5">Blink</span>
                </div>
              </div>
            )}

            {selectedExercise.type === "depth" && (
              <div className="relative flex items-center justify-center w-full h-full">
                <div className={`rounded-full bg-sky-400 shadow-lg ${isPlaying ? "animate-pulse-depth" : "w-10 h-10"}`}></div>
              </div>
            )}

            {selectedExercise.type === "sweeps" && (
              <div className="relative w-full h-full border border-zinc-800 rounded-xl flex items-center justify-center overflow-hidden">
                <div className={`absolute w-5 h-5 rounded-full bg-amber-400 shadow-md ${isPlaying ? "animate-sweep-motion" : ""}`}></div>
              </div>
            )}
          </div>

          <div className="w-full space-y-3 pt-3 border-t border-zinc-800/80 flex flex-col items-center">
            <p className="text-[11px] text-zinc-400 text-center max-w-sm">
              💡 {selectedExercise.instructions}
            </p>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-2 px-6 rounded-xl text-xs transition-colors"
            >
              {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
              <span>{isPlaying ? "Pause Routine" : "Start Routine"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
