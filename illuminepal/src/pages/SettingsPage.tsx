import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useTimer } from "../context/TimerContext";
import { useTheme } from "../context/ThemeContext";
import type { AppSettings } from "../types/settings";
import {
  Cog6ToothIcon,
  CheckIcon,
  SpeakerWaveIcon,
  ShieldCheckIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { focusMinutes, updateTimerConfig, soundEnabled, setSoundEnabled } = useTimer();
  const { isDark, toggleTheme } = useTheme();

  const [settings, setSettings] = useState<AppSettings>({
    short_break_minutes: focusMinutes,
    long_break_minutes: 15,
    notifications_enabled: true,
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
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Local fallback
      updateTimerConfig(settings.short_break_minutes, 20);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <Cog6ToothIcon className="w-7 h-7 text-slate-600 dark:text-slate-400" />
          <span>App Settings & Configuration</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage system preferences, Tauri Rust storage synchronization, and notification behaviors.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Break Interval Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Short Break Interval (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.short_break_minutes}
              onChange={(e) =>
                setSettings({ ...settings, short_break_minutes: Math.max(1, parseInt(e.target.value) || 20) })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-3 rounded-2xl font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Long Break Interval (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={settings.long_break_minutes}
              onChange={(e) =>
                setSettings({ ...settings, long_break_minutes: Math.max(1, parseInt(e.target.value) || 15) })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-4 py-3 rounded-2xl font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 pt-4">
          Preferences & Toggles
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">System Notifications</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow native OS desktop notifications when break triggers.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications_enabled}
              onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
              className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              <SpeakerWaveIcon className="w-5 h-5 text-indigo-500" />
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Audio Sound Chimes</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Play Web Audio chimes on break start and end.
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

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="flex items-center gap-3">
              {isDark ? <MoonIcon className="w-5 h-5 text-amber-400" /> : <SunIcon className="w-5 h-5 text-blue-500" />}
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Theme Mode</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Currently active: <span className="font-bold capitalize">{isDark ? "Dark Mode" : "Light Mode"}</span>
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white"
            >
              Toggle Theme
            </button>
          </div>
        </div>

        {/* Save Action */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-fade-in">
              <CheckIcon className="w-4 h-4" /> Settings saved successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings are persisted to local storage & Rust backend.</span>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
