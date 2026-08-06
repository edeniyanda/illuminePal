import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  EyeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CloudIcon,
  UserIcon,
  ArrowRightIcon,
  WifiIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const ONBOARDING_KEY = "optikur_has_onboarded";

export default function WelcomeScreen() {
  const { openAuthModal, user } = useAuth();
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [showGuestWarning, setShowGuestWarning] = useState<boolean>(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const checkOnboardingState = () => {
    const hasOnboarded = localStorage.getItem(ONBOARDING_KEY);
    const hasUser = localStorage.getItem("optikur_auth_user");

    if (!hasOnboarded && !hasUser && !user) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  };

  useEffect(() => {
    checkOnboardingState();

    // Listen for custom trigger events (e.g. from Settings or reset button)
    const handleResetEvent = () => setShowWelcome(true);
    window.addEventListener("optikur_show_welcome", handleResetEvent);
    return () => window.removeEventListener("optikur_show_welcome", handleResetEvent);
  }, [user]);

  const handleSignInClick = () => {
    setOfflineNotice(null);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOfflineNotice("Internet connection required to sign in or create an account. Please connect to the internet or proceed in Guest Mode.");
      return;
    }
    // Complete onboarding and launch Auth modal
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
    openAuthModal();
  };

  const handleConfirmGuest = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
    setShowGuestWarning(false);
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 dark:bg-black/85 backdrop-blur-2xl transition-all animate-in fade-in duration-300">
      {/* Subtle Background Glow */}
      <div className="absolute w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />

      {/* Main Glassmorphic Welcome Card */}
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-zinc-900 dark:text-zinc-100 overflow-hidden">
        
        {/* Main View */}
        {!showGuestWarning ? (
          <div className="space-y-6">
            {/* Header with Standing-Out Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Eye Icon with Distinct Standing-Out Sky-500 Color */}
              <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white p-3 shadow-lg shadow-sky-500/25 flex items-center justify-center">
                <EyeIcon className="w-9 h-9 stroke-[2.2]" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-xs font-semibold text-sky-600 dark:text-sky-400 mb-2">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>Welcome to Optikur</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Precision Desktop Eye Care
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
                  Protect your eyesight using scientifically backed 20-20-20 breaks, guided exercises, and habit analytics.
                </p>
              </div>
            </div>

            {/* Offline Alert Banner */}
            {offlineNotice && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5 animate-in slide-in-from-top-2">
                <WifiIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Internet Connection Required</span>
                  <span>{offlineNotice}</span>
                </div>
                <button onClick={() => setOfflineNotice(null)} className="text-amber-500 hover:text-amber-700">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <FeatureTile
                icon={EyeIcon}
                title="20-20-20 Break Timer"
                description="Automated reminders to look 20 feet away for 20 seconds every 20 minutes."
                iconColor="text-sky-500"
              />
              <FeatureTile
                icon={SparklesIcon}
                title="Guided Eye Stretch"
                description="Interactive exercise routines to relax ciliary muscles and decrease strain."
                iconColor="text-sky-500"
              />
              <FeatureTile
                icon={ShieldCheckIcon}
                title="Local SQLite Speed"
                description="Zero latency persistence. Your data works 100% offline out of the box."
                iconColor="text-sky-500"
              />
              <FeatureTile
                icon={CloudIcon}
                title="Neon + PowerSync"
                description="Seamless background cloud synchronization across all your desktop devices."
                iconColor="text-sky-500"
              />
            </div>

            {/* Primary Action Buttons - Clean Solid Theme */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button
                onClick={handleSignInClick}
                className="w-full sm:flex-1 py-3.5 px-5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-2xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Sign In or Create Account</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setOfflineNotice(null);
                  setShowGuestWarning(true);
                }}
                className="w-full sm:w-auto py-3.5 px-5 bg-zinc-200/70 dark:bg-zinc-800/70 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-2xl transition-all flex items-center justify-center gap-1.5 border border-zinc-300/60 dark:border-zinc-700/60 cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-zinc-500" />
                <span>Continue as Guest</span>
              </button>
            </div>
          </div>
        ) : (
          /* Guest Confirmation Warning Screen */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Guest Mode Notice
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                Please review the terms of using Optikur without a registered account.
              </p>
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Local Storage:</strong> Your break sessions and timer preferences will save locally to SQLite on this device.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>No Cloud Backup:</strong> Data will not be synced to Neon Postgres cloud database. If this device is wiped, history cannot be recovered.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Limited Multi-Device Access:</strong> Guest progress will remain isolated to this machine until you choose to Sign In later.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleConfirmGuest}
                className="w-full sm:flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>I Understand, Proceed as Guest</span>
              </button>
              <button
                onClick={() => setShowGuestWarning(false)}
                className="w-full sm:w-auto py-3 px-4 bg-zinc-200/60 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  description,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
}) {
  return (
    <div className="p-3.5 bg-zinc-100/60 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl flex items-start gap-3">
      <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div>
        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">{description}</p>
      </div>
    </div>
  );
}
