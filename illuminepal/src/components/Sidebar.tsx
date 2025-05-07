import {
    HomeIcon,
    Cog6ToothIcon,
    ClockIcon,
    EyeIcon,
    ChartBarIcon,
  } from "@heroicons/react/24/outline";
  
  const links = [
    { icon: HomeIcon, label: "Home" },
    { icon: ClockIcon, label: "Reminders" },
    { icon: EyeIcon, label: "Exercises" },
    { icon: ChartBarIcon, label: "Analytics" },
    { icon: Cog6ToothIcon, label: "Settings" },
  ];
  
  export default function Sidebar() {
    return (
      <div className="w-16 h-screen bg-white dark:bg-slate-900 flex flex-col items-center py-4 space-y-6 shadow-lg">
        {links.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="text-slate-600 dark:text-slate-300 hover:text-blue-500"
            title={label}
          >
            <Icon className="w-6 h-6" />
          </button>
        ))}
      </div>
    );
  }
  