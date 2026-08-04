import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { audioService } from "../utils/audio";
import type { AppSettings } from "../types/settings";

export type TimerMode = "work" | "break";
export type TimerStatus = "idle" | "running" | "paused" | "break";

interface TimerContextType {
  focusMinutes: number;
  restSeconds: number;
  timeRemaining: number;
  timerStatus: TimerStatus;
  soundEnabled: boolean;
  strictMode: boolean;
  totalBreaksToday: number;
  streakDays: number;
  isBreakOverlayOpen: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipBreak: () => void;
  triggerBreakNow: () => void;
  completeBreak: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setStrictMode: (strict: boolean) => void;
  updateTimerConfig: (focusMins: number, restSecs: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const DEFAULT_FOCUS_MINUTES = 20;
const DEFAULT_REST_SECONDS = 20;

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_FOCUS_MINUTES);
  const [restSeconds, setRestSeconds] = useState(DEFAULT_REST_SECONDS);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [totalBreaksToday, setTotalBreaksToday] = useState(() => {
    const saved = localStorage.getItem("illumine_breaks_today");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streakDays] = useState(() => {
    const saved = localStorage.getItem("illumine_streak_days");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isBreakOverlayOpen, setIsBreakOverlayOpen] = useState(false);

  // Load initial settings from Tauri backend if available
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await invoke<AppSettings>("load_settings");
        if (settings) {
          if (settings.short_break_minutes) {
            setFocusMinutes(settings.short_break_minutes);
            setTimeRemaining(settings.short_break_minutes * 60);
          }
        }
      } catch {
        // Running in standard web browser environment
      }
    };
    loadSettings();
  }, []);

  // Update localStorage for breaks count
  useEffect(() => {
    localStorage.setItem("illumine_breaks_today", totalBreaksToday.toString());
    localStorage.setItem("illumine_streak_days", streakDays.toString());
  }, [totalBreaksToday, streakDays]);

  // Main countdown effect
  useEffect(() => {
    if (timerStatus !== "running" && timerStatus !== "break") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (timerStatus === "running") {
            // Work timer expired -> Trigger Break!
            if (soundEnabled) {
              audioService.playBreakStart();
            }
            setTimerStatus("break");
            setIsBreakOverlayOpen(true);
            return restSeconds;
          } else if (timerStatus === "break") {
            // Break timer finished!
            if (soundEnabled) {
              audioService.playBreakComplete();
            }
            setIsBreakOverlayOpen(false);
            setTimerStatus("running");
            setTotalBreaksToday((count) => count + 1);
            return focusMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStatus, focusMinutes, restSeconds, soundEnabled]);

  const toggleTimer = useCallback(() => {
    setTimerStatus((current) => {
      if (current === "running") return "paused";
      if (current === "idle" || current === "paused") return "running";
      return current;
    });
  }, []);

  const resetTimer = useCallback(() => {
    setTimerStatus("idle");
    setIsBreakOverlayOpen(false);
    setTimeRemaining(focusMinutes * 60);
  }, [focusMinutes]);

  const triggerBreakNow = useCallback(() => {
    if (soundEnabled) {
      audioService.playBreakStart();
    }
    setTimerStatus("break");
    setTimeRemaining(restSeconds);
    setIsBreakOverlayOpen(true);
  }, [restSeconds, soundEnabled]);

  const completeBreak = useCallback(() => {
    if (soundEnabled) {
      audioService.playBreakComplete();
    }
    setIsBreakOverlayOpen(false);
    setTimerStatus("running");
    setTotalBreaksToday((prev) => prev + 1);
    setTimeRemaining(focusMinutes * 60);
  }, [focusMinutes, soundEnabled]);

  const skipBreak = useCallback(() => {
    setIsBreakOverlayOpen(false);
    setTimerStatus("running");
    setTimeRemaining(focusMinutes * 60);
  }, [focusMinutes]);

  const updateTimerConfig = useCallback((newFocusMins: number, newRestSecs: number) => {
    setFocusMinutes(newFocusMins);
    setRestSeconds(newRestSecs);
    setTimerStatus("idle");
    setTimeRemaining(newFocusMins * 60);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        focusMinutes,
        restSeconds,
        timeRemaining,
        timerStatus,
        soundEnabled,
        strictMode,
        totalBreaksToday,
        streakDays,
        isBreakOverlayOpen,
        toggleTimer,
        resetTimer,
        skipBreak,
        triggerBreakNow,
        completeBreak,
        setSoundEnabled,
        setStrictMode,
        updateTimerConfig,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
