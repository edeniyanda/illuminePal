import { useState, useEffect } from "react";
import { EyeIcon, PlayIcon, PauseIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { audioService } from "../utils/audio";

interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  instructions: string;
  type: "figure8" | "blinking" | "depth" | "sweeps";
}

const exercises: Exercise[] = [
  {
    id: "figure8",
    name: "Figure-8 Smooth Eye Trace",
    duration: 30,
    description: "Follow the moving target with your eyes without moving your head.",
    instructions: "Keep your neck still. Smoothly follow the glowing dot as it traces a figure 8.",
    type: "figure8",
  },
  {
    id: "blinking",
    name: "20-Second Rapid Blink Pacer",
    duration: 20,
    description: "Blink deeply whenever the ring pulses to rehydrate dry eyes.",
    instructions: "Blink naturally every time the circle expands and closes gently.",
    type: "blinking",
  },
  {
    id: "depth",
    name: "Focus Depth Shift",
    duration: 30,
    description: "Alternate your gaze focus between near and far objects.",
    instructions: "Focus on the target when it enlarges (near), then look out the window when it shrinks (far).",
    type: "depth",
  },
  {
    id: "sweeps",
    name: "Horizontal & Vertical Sweeps",
    duration: 30,
    description: "Stretch your eye muscles by following full-range perimeter motions.",
    instructions: "Track the ball as it moves smoothly across the screen boundaries.",
    type: "sweeps",
  },
];

export default function ExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(exercises[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(selectedExercise.duration);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setTimeLeft(selectedExercise.duration);
  }, [selectedExercise]);

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
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <EyeIcon className="w-7 h-7 text-indigo-500" />
            <span>Guided Eye Workouts</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Interactive visual exercises to relieve strain, lubricate eyes, and improve focus flexibility.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Workouts Completed Today: {completedCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Exercise Selector List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Select Workout</h3>
          {exercises.map((ex) => {
            const isSelected = selectedExercise.id === ex.id;
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedExercise(ex)}
                className={`p-5 rounded-2xl cursor-pointer border transition-all ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white hover:border-blue-400"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-sm">{ex.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isSelected ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                    {ex.duration}s
                  </span>
                </div>
                <p className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                  {ex.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Interactive Canvas Screen */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between min-h-[460px] text-white relative overflow-hidden">
          {/* Header */}
          <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest block">Active Exercise</span>
              <h3 className="text-lg font-bold">{selectedExercise.name}</h3>
            </div>
            <span className="text-2xl font-mono font-black text-amber-400">{timeLeft}s</span>
          </div>

          {/* Canvas Animation Screen */}
          <div className="relative w-full h-64 flex items-center justify-center my-6">
            {selectedExercise.type === "figure8" && (
              <Figure8Animation isPlaying={isPlaying} />
            )}
            {selectedExercise.type === "blinking" && (
              <BlinkingAnimation isPlaying={isPlaying} />
            )}
            {selectedExercise.type === "depth" && (
              <DepthAnimation isPlaying={isPlaying} />
            )}
            {selectedExercise.type === "sweeps" && (
              <SweepsAnimation isPlaying={isPlaying} />
            )}
          </div>

          {/* Instructions & Controls */}
          <div className="w-full space-y-4 pt-4 border-t border-slate-800/80 flex flex-col items-center">
            <p className="text-xs text-slate-400 text-center max-w-md">
              💡 {selectedExercise.instructions}
            </p>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95"
            >
              {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
              <span>{isPlaying ? "Pause Routine" : "Start Routine"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animation Components
function Figure8Animation({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="w-64 h-32 opacity-30 stroke-blue-500" fill="none" strokeWidth="2">
        <path d="M 32,64 C 32,20 96,20 128,64 C 160,108 224,108 224,64 C 224,20 160,20 128,64 C 96,108 32,108 32,64 Z" />
      </svg>

      <div
        className={`absolute w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-300 shadow-lg shadow-blue-500/80 border-2 border-white ${
          isPlaying ? "animate-figure8" : ""
        }`}
      ></div>
    </div>
  );
}

function BlinkingAnimation({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-36 h-36 rounded-full border-4 border-blue-500/40 flex items-center justify-center transition-all ${
          isPlaying ? "animate-ping opacity-75" : ""
        }`}
      ></div>
      <div className="absolute w-24 h-24 rounded-full bg-blue-600/80 backdrop-blur-md flex flex-col items-center justify-center">
        <EyeIcon className="w-8 h-8 text-white animate-pulse" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 mt-1">Blink Now</span>
      </div>
    </div>
  );
}

function DepthAnimation({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div
        className={`rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-2xl transition-all duration-1000 ${
          isPlaying ? "animate-pulse-depth" : "w-16 h-16"
        }`}
      ></div>
    </div>
  );
}

function SweepsAnimation({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="relative w-full h-full border border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden">
      <div
        className={`absolute w-6 h-6 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 ${
          isPlaying ? "animate-sweep-motion" : ""
        }`}
      ></div>
    </div>
  );
}
