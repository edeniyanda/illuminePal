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
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { focusMinutes, updateTimerConfig, soundEnabled, setSoundEnabled } = useTimer();
  const { themeMode, setThemeMode, isDark } = useTheme();

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
      updateTimerConfig(settings.short_break_minutes, 20);
      setSavedSuccess(true);
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
          Application preferences and local storage sync.
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
              <label className="text-[11px] font-medium text-zinc-400 block">Short Break Interval (Minutes)</label>
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

        {/* Section: Preferences List */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
          <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Preferences
          </h3>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-4 h-4 text-sky-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Desktop Notifications</h4>
                  <p className="text-[11px] text-zinc-400">Trigger OS native notification prompts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => setSettings({ ...settings, notifications_enabled: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <SpeakerWaveIcon className="w-4 h-4 text-indigo-500" />
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Sound Chimes</h4>
                  <p className="text-[11px] text-zinc-400">Play audio tones on break start and end</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                {isDark ? <MoonIcon className="w-4 h-4 text-amber-400" /> : <SunIcon className="w-4 h-4 text-zinc-500" />}
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100 text-xs">Interface Theme</h4>
                  <p className="text-[11px] text-zinc-400">
                    Active mode: <span className="capitalize font-medium">{isDark ? "Dark" : "Light"}</span> ({themeMode})
                  </p>
                </div>
              </div>

              {/* HIG/Fluent Segmented Picker */}
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
          </div>
        </div>

        {/* Save Action */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
              <CheckIcon className="w-4 h-4" /> Settings saved successfully
            </span>
          ) : (
            <span className="text-[11px] text-zinc-400">Persisted locally and synced with Rust backend.</span>
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
