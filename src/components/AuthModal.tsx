import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  XMarkIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  CloudIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, authState, authError } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "signin") {
      await signIn(email, password);
    } else {
      await signUp(email, password, name);
    }
  };

  const isLoading = authState === "authenticating";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 dark:bg-black/75 backdrop-blur-md transition-all animate-in fade-in duration-200">
      {/* Subtle Background Glow */}
      <div className="absolute w-72 h-72 bg-sky-500/10 rounded-full blur-3xl -top-10 -left-10 pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-900 dark:text-zinc-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60 transition-colors disabled:opacity-40"
          title="Close Modal"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal Header Badge with Standing-Out Icon */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white p-2.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
            <CloudIcon className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {tab === "signin" ? "Sign in to Optikur" : "Create Account"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Sync eye-care stats across all your devices seamlessly.
            </p>
          </div>
        </div>

        {/* Segmented Auth Mode Switcher */}
        <div className="flex items-center p-1 bg-zinc-200/50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 mb-6">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === "signin"
                ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === "signup"
                ? "bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-xs font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            New Account
          </button>
        </div>

        {/* Error Notification */}
        {authError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 absolute left-3 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="Alex Rivers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <EnvelopeIcon className="w-4 h-4 absolute left-3 text-zinc-400" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <LockClosedIcon className="w-4 h-4 absolute left-3 text-zinc-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Solid Theme Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{tab === "signin" ? "Sign In to Sync" : "Create Account"}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Offline & Guest Footer Options */}
        <div className="mt-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
            <span>Local SQLite Active</span>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>Continue as Guest</span>
            <SparklesIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
