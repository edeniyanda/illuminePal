import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css"; 

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4 text-blue-400">✨ Welcome to illuminePal</h1>

      <div className="flex gap-6 mb-6">
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img src="/vite.svg" className="w-16 h-16 hover:scale-110 transition" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank" rel="noopener noreferrer">
          <img src="/tauri.svg" className="w-16 h-16 hover:scale-110 transition" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="w-16 h-16 hover:scale-110 transition" alt="React logo" />
        </a>
      </div>

      <p className="mb-6 text-gray-300 text-sm">
        Click on the logos to learn more.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
        className="flex flex-col sm:flex-row gap-3 items-center"
      >
        <input
          type="text"
          placeholder="Enter your name..."
          className="px-4 py-2 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 transition text-white"
        >
          Greet
        </button>
      </form>

      {greetMsg && (
        <p className="mt-6 text-green-400 font-medium text-lg">{greetMsg}</p>
      )}
    </main>
  );
}

export default App;
