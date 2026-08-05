import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { audioService } from "../utils/audio";
import { requestNotificationPermission, sendNativeNotification } from "../utils/notification";
import type { AppSettings } from "../types/settings";
import ToastOverlay, { ToastMessage } from "../components/ToastOverlay";

export type TimerMode = "work" | "break";
export type TimerStatus = "idle" | "running" | "paused" | "break";

interface TimerContextType {
  focusMinutes: number;
  restSeconds: number;
  timeRemaining: number;
  timerStatus: TimerStatus;
  soundEnabled: boolean;
  strictMode: boolean;
  notificationsEnabled: boolean;
  overlayNotificationsEnabled: boolean;
  nativeNotificationsEnabled: boolean;
  backgroundTimerEnabled: boolean;
  totalBreaksToday: number;
  streakDays: number;
  isBreakOverlayOpen: boolean;
  toasts: ToastMessage[];
  toggleTimer: () => void;
  resetTimer: () => void;
  skipBreak: () => void;
  triggerBreakNow: () => void;
  completeBreak: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setStrictMode: (strict: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setOverlayNotificationsEnabled: (enabled: boolean) => void;
  setNativeNotificationsEnabled: (enabled: boolean) => void;
  setBackgroundTimerEnabled: (enabled: boolean) => void;
  updateTimerConfig: (focusMins: number, restSecs: number) => void;
  addToast: (title: string, message: string, type?: "break" | "info" | "success", actionLabel?: string, onAction?: () => void) => void;
  dismissToast: (id: string) => void;
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [overlayNotificationsEnabled, setOverlayNotificationsEnabled] = useState(true);
  const [nativeNotificationsEnabled, setNativeNotificationsEnabled] = useState(true);
  const [backgroundTimerEnabled, setBackgroundTimerEnabled] = useState(true);

  const [totalBreaksToday, setTotalBreaksToday] = useState(() => {
    const saved = localStorage.getItem("optikur_breaks_today") || localStorage.getItem("illumine_breaks_today");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [streakDays] = useState(() => {
    const saved = localStorage.getItem("optikur_streak_days") || localStorage.getItem("illumine_streak_days");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isBreakOverlayOpen, setIsBreakOverlayOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ref map to store active toast auto-dismiss timeouts to prevent memory leaks
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeoutId = toastTimeoutsRef.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((
    title: string,
    message: string,
    type: "break" | "info" | "success" = "info",
    actionLabel?: string,
    onAction?: () => void
  ) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    const newToast: ToastMessage = { id, title, message, type, actionLabel, onAction };
    
    setToasts((prev) => [...prev, newToast]);

    // Track timeout ID in ref map for zero-leak memory management
    const timeoutId = window.setTimeout(() => {
      dismissToast(id);
    }, 5000);

    toastTimeoutsRef.current.set(id, timeoutId);
  }, [dismissToast]);

  // Clean up all pending toast timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      toastTimeoutsRef.current.clear();
    };
  }, []);

  // Request native OS notification permissions on boot
  useEffect(() => {
    if (notificationsEnabled && nativeNotificationsEnabled) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled, nativeNotificationsEnabled]);

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
          if (typeof settings.notifications_enabled === "boolean") {
            setNotificationsEnabled(settings.notifications_enabled);
          }
          if (typeof settings.overlay_notifications_enabled === "boolean") {
            setOverlayNotificationsEnabled(settings.overlay_notifications_enabled);
          }
          if (typeof settings.native_notifications_enabled === "boolean") {
            setNativeNotificationsEnabled(settings.native_notifications_enabled);
          }
          if (typeof settings.background_timer_enabled === "boolean") {
            setBackgroundTimerEnabled(settings.background_timer_enabled);
          }
        }
      } catch {
        // Web browser environment
      }
    };
    loadSettings();
  }, []);

  // Update localStorage for breaks count
  useEffect(() => {
    localStorage.setItem("optikur_breaks_today", totalBreaksToday.toString());
    localStorage.setItem("optikur_streak_days", streakDays.toString());
  }, [totalBreaksToday, streakDays]);

  // Main countdown effect with zero-leak interval management
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

            // In-app Overlay Toast
            if (notificationsEnabled && overlayNotificationsEnabled) {
              addToast(
                "20-20-20 Eye Break",
                "Look 20 feet away for 20 seconds to protect your eyes.",
                "break"
              );
            }

            // Native Desktop OS Notification
            if (notificationsEnabled && nativeNotificationsEnabled) {
              sendNativeNotification(
                "Optikur — Eye Break Time",
                "Look away at an object 20 feet (6m) away for 20 seconds."
              );
            }

            setTimerStatus("break");
            setIsBreakOverlayOpen(true);
            return restSeconds;
          } else if (timerStatus === "break") {
            // Break timer finished!
            if (soundEnabled) {
              audioService.playBreakComplete();
            }

            if (notificationsEnabled && overlayNotificationsEnabled) {
              addToast(
                "Break Completed",
                "Great job resting your eyes! You can resume work.",
                "success"
              );
            }

            if (notificationsEnabled && nativeNotificationsEnabled) {
              sendNativeNotification(
                "Optikur — Break Complete",
                "Eye rest session complete. You can resume your work."
              );
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
  }, [
    timerStatus,
    focusMinutes,
    restSeconds,
    soundEnabled,
    notificationsEnabled,
    overlayNotificationsEnabled,
    nativeNotificationsEnabled,
    addToast,
  ]);

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
    if (notificationsEnabled && overlayNotificationsEnabled) {
      addToast(
        "Eye Break Triggered",
        "Look 20 feet away for 20 seconds.",
        "break"
      );
    }
    if (notificationsEnabled && nativeNotificationsEnabled) {
      sendNativeNotification("IlluminePal", "Time for a 20-second eye rest break!");
    }
    setTimerStatus("break");
    setTimeRemaining(restSeconds);
    setIsBreakOverlayOpen(true);
  }, [restSeconds, soundEnabled, notificationsEnabled, overlayNotificationsEnabled, nativeNotificationsEnabled, addToast]);

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
        notificationsEnabled,
        overlayNotificationsEnabled,
        nativeNotificationsEnabled,
        backgroundTimerEnabled,
        totalBreaksToday,
        streakDays,
        isBreakOverlayOpen,
        toasts,
        toggleTimer,
        resetTimer,
        skipBreak,
        triggerBreakNow,
        completeBreak,
        setSoundEnabled,
        setStrictMode,
        setNotificationsEnabled,
        setOverlayNotificationsEnabled,
        setNativeNotificationsEnabled,
        setBackgroundTimerEnabled,
        updateTimerConfig,
        addToast,
        dismissToast,
      }}
    >
      {children}
      {/* Toast Notification Banner System */}
      <ToastOverlay toasts={toasts} onDismiss={dismissToast} />
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
