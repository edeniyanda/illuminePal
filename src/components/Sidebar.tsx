import React from "react";
import {
  HomeIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export type TabType = "home" | "reminders" | "exercises" | "analytics" | "settings";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Dashboard", icon: HomeIcon },
  { id: "reminders", label: "Reminders", icon: ClockIcon },
  { id: "exercises", label: "Eye Exercises", icon: EyeIcon },
  { id: "analytics", label: "Analytics", icon: ChartBarIcon },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-20 bg-white/80 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 shadow-sm backdrop-blur-md transition-all z-20">
      {/* App Logo Icon */}
      <div className="mb-8 flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/30">
        <EyeIcon className="w-7 h-7" />
      </div>

      {/* Navigation Buttons */}
      <nav className="flex flex-col space-y-4 w-full px-3">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              title={label}
              className={`relative flex items-center justify-center w-full h-12 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <Icon className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />

              {/* Tooltip on Hover */}
              <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}