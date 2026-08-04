import { useState } from "react";
import Sidebar, { TabType } from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";
import RemindersPage from "./pages/RemindersPage";
import ExercisesPage from "./pages/ExercisesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import BreakOverlay from "./components/BreakOverlay";
import { TimerProvider } from "./context/TimerContext";
import "./App.css";

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>("home");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-sky-500 selection:text-white transition-colors duration-300">
      {/* Interactive Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container Shell */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopBar activeTab={activeTab} />

        {/* Dedicated Main Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto pb-12">
          {activeTab === "home" && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === "reminders" && <RemindersPage />}
          {activeTab === "exercises" && <ExercisesPage />}
          {activeTab === "analytics" && <AnalyticsPage />}
          {activeTab === "settings" && <SettingsPage />}
        </main>
      </div>

      {/* Fullscreen Break Shield Modal Overlay */}
      <BreakOverlay />
    </div>
  );
}

export default function App() {
  return (
    <TimerProvider>
      <AppContent />
    </TimerProvider>
  );
}
