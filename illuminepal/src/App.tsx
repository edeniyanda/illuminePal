import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import SettingsForm from "./components/SettingsForm";
import "./App.css"; 
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="flex bg-slate-100 dark:bg-slate-900 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
