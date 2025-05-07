import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";

export default function TopBar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 shadow">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">✨ illuminePal</h1>
      <button onClick={toggleTheme} className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
        {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        {isDark ? "Light" : "Dark"} Mode
      </button>
    </div>
  );
}
