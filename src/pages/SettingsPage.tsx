import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useTimer } from "../context/TimerContext";
import { useTheme } from "../context/ThemeContext";
import type { AppSettings } from "../types/settings";
import {
  AdjustmentsHorizontalIcon,
  CheckIcon,
  SpeakerWaveIcon,
  ShieldCheckIcon,
  MoonIcon,
  SunIcon,
  ComputerDesktopIcon,
  BellIcon,
  WindowIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const {
    focusMinutes,
    updateTimerConfig,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    overlayNotificationsEnabled,
    setOverlayNotificationsEnabled,
    nativeNotificationsEnabled,
    setNativeNotificationsEnabled,
    backgroundTimerEnabled,
    setBackgroundTimerEnabled,
    addToast,
  } = useTimer();

  const { themeMode, setThemeMode, isDark } = useTheme();

  const [settings, setSettings] = useState<AppSettings>({
    short_break_minutes: focusMinutes,
    long_break_minutes: 15,
    notifications_enabled: notificationsEnabled,
    overlay_notifications_enabled: overlayNotificationsEnabled,
    native_notifications_enabled: nativeNotificationsEnabled,
    background_timer_enabled: backgroundTimerEnabled,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    invoke<AppSettings>("load_settings")
      .then((loaded) => {
        if (loaded) {
          setSettings(loaded);
        }
      })
      .catch(() => {
        // Browser fallback
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await invoke("save_settings", { newSettings: settings });
      updateTimerConfig(settings.short_break_minutes, 20);
      setNotificationsEnabled(settings.notifications_enabled);
      setOverlayNotificationsEnabled(settings.overlay_notifications_enabled);
      setNativeNotificationsEnabled(settings.native_notifications_enabled);
      setBackgroundTimerEnabled(settings.background_timer_enabled);

      setSavedSuccess(true);
      addToast("Settings Persisted", "Your notification & schedule preferences were saved.", "success");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      updateTimerConfig(settings.short_break_minutes, 20);
      setNotificationsEnabled(settings.notifications_enabled);
      setOverlayNotificationsEnabled(settings.overlay_notifications_enabled);
      setNativeNotificationsEnabled(settings.native_notifications_enabled);
      setBackgroundTimerEnabled(settings.background_timer_enabled);

      setSavedSuccess(true);
      addToast("Settings Updated", "Preferences applied successfully.", "success");
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-zinc-500" />
          <span>Settings</span>
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Notification preferences, background execution, and break rules.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Section: Intervals */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Break Durations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Short Break Interval (Minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.short_break_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, short_break_minutes: Math.max(1, parseInt(e.target.value) || 20) })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400 block">Long Break Interval (Minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.long_break_minutes}
                onChange={(e) =>
                  setSettings({ ...settings, long_break_minutes: Math.max(1, parseInt(e.target.value) || 15) })
                }
                className="w-full bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Section: Notification Customization */}
        <div className="space-y-3 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Notification Customization
          </h3>

          <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
            {/* Master Notification Switch */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <BellIcon className="w-4 h-4 text-sky-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Master Notification System</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Enable or disable all notification triggers</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {/* In-App Toast Overlay Switch */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Square2StackIcon className="w-4 h-4 text-indigo-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">In-App Overlay Toasts</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Show clean floating notification toasts in top-right screen area</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!settings.notifications_enabled}
                checked={settings.notifications_enabled && settings.overlay_notifications_enabled}
                onChange={(e) => setSettings({ ...settings, overlay_notifications_enabled: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Native OS Notification Switch */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Desktop OS Native Notifications</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Trigger Windows / macOS native desktop notification toasts</p>
                </div>
              </div>
              <input
                type="checkbox"
                disabled={!settings.notifications_enabled}
                checked={settings.notifications_enabled && settings.native_notifications_enabled}
                onChange={(e) => setSettings({ ...settings, native_notifications_enabled: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Background & System Tray Switch */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <WindowIcon className="w-4 h-4 text-amber-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Background & System Tray Execution</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Keep timer running and trigger notifications when window is closed to system tray</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.background_timer_enabled}
                onChange={(e) => setSettings({ ...settings, background_timer_enabled: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {/* Sound Audio Chimes */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <SpeakerWaveIcon className="w-4 h-4 text-sky-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Audio Sound Chimes</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Play Web Audio tones on break start and completion</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {/* Theme Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                {isDark ? <MoonIcon className="w-4 h-4 text-amber-400" /> : <SunIcon className="w-4 h-4 text-zinc-500" />}
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Interface Theme</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Active mode: <span className="capitalize font-medium text-zinc-800 dark:text-zinc-200">{isDark ? "Dark" : "Light"}</span> ({themeMode})
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
                <OptionButton
                  active={themeMode === "light"}
                  onClick={() => setThemeMode("light")}
                  label="Light"
                  icon={SunIcon}
                />
                <OptionButton
                  active={themeMode === "dark"}
                  onClick={() => setThemeMode("dark")}
                  label="Dark"
                  icon={MoonIcon}
                />
                <OptionButton
                  active={themeMode === "system"}
                  onClick={() => setThemeMode("system")}
                  label="System"
                  icon={ComputerDesktopIcon}
                />
              </div>
            </div>

            {/* Onboarding & Reset Trigger */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-sky-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">View Welcome Screen Again</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Re-trigger the initial onboarding welcome screen</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("optikur_has_onboarded");
                  window.dispatchEvent(new Event("optikur_show_welcome"));
                  addToast("Welcome Screen Triggered", "Onboarding screen displayed.", "info");
                }}
                className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Launch Welcome Screen
              </button>
            </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
              <CheckIcon className="w-4 h-4" /> Preferences saved successfully
            </span>
          ) : (
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Persisted locally and synced with Rust backend.</span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 font-semibold shadow-xs"
          : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
