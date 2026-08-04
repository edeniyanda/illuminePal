import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import type { AppSettings } from "../types/settings";

export default function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    invoke<AppSettings>("load_settings").then(setSettings);
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    await invoke("save_settings", { newSettings: settings });
    setSaving(false);
  }

  if (!settings) {
    return <p className="text-gray-400">Loading settings...</p>;
  }

  return (
    <div className="bg-slate-800 p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4 text-white">Settings</h2>

      <label className="block mb-3 text-sm text-white">
        Short Break (minutes)
        <input
          type="number"
          className="w-full mt-1 p-2 rounded bg-slate-700 text-white"
          value={settings.short_break_minutes}
          onChange={(e) =>
            setSettings({ ...settings, short_break_minutes: Number(e.target.value) })
          }
        />
      </label>

      <label className="block mb-3 text-sm text-white">
        Long Break (minutes)
        <input
          type="number"
          className="w-full mt-1 p-2 rounded bg-slate-700 text-white"
          value={settings.long_break_minutes}
          onChange={(e) =>
            setSettings({ ...settings, long_break_minutes: Number(e.target.value) })
          }
        />
      </label>

      <label className="flex items-center gap-2 mb-4 text-white">
        <input
          type="checkbox"
          checked={settings.notifications_enabled}
          onChange={(e) =>
            setSettings({ ...settings, notifications_enabled: e.target.checked })
          }
        />
        Enable Notifications
      </label>

      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
