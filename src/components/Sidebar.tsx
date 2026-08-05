import {
  Square2StackIcon,
  ClockIcon,
  EyeIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

export type TabType = "home" | "reminders" | "exercises" | "analytics" | "settings";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Dashboard", icon: Square2StackIcon },
  { id: "reminders", label: "Schedules", icon: ClockIcon },
  { id: "exercises", label: "Exercises", icon: EyeIcon },
  { id: "analytics", label: "Analytics", icon: ChartBarIcon },
  { id: "settings", label: "Settings", icon: AdjustmentsHorizontalIcon },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-18 md:w-60 bg-zinc-50/80 dark:bg-zinc-950/80 border-r border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between p-3.5 backdrop-blur-xl transition-all z-20 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <EyeIcon className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Optikur
            </span>
            <span className="block text-[10px] text-zinc-400 font-medium">Precision Eye Care</span>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
                title={label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-500" : ""}`} />
                <span className="hidden md:inline truncate">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer minimal info */}
      <div className="hidden md:block px-3 py-2 border-t border-zinc-200/40 dark:border-zinc-800/40">
        <span className="text-[10px] text-zinc-400 font-medium block">Version 1.0.0</span>
      </div>
    </aside>
  );
}