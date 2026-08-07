import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function ProfileModal() {
  const { user, requestSignOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "password">("details");

  // Profile details state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  // Expose global open helper or listen to custom event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("optikur:open-profile", handleOpen);
    return () => window.removeEventListener("optikur:open-profile", handleOpen);
  }, []);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsError(null);
    setDetailsSuccess(null);

    const token = localStorage.getItem("optikur_jwt_token");
    if (!token) {
      setDetailsError("Session expired. Please sign in again.");
      return;
    }

    setDetailsSaving(true);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");
      const res = await fetch(`${apiUrl}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDetailsError(data.error || "Failed to update profile.");
      } else {
        setDetailsSuccess("Profile details updated successfully.");
        // Update user in localStorage
        const updatedUser = { ...user, name: data.user.name, email: data.user.email };
        localStorage.setItem("optikur_auth_user", JSON.stringify(updatedUser));
      }
    } catch {
      setDetailsError("Unable to connect to server. Please try again.");
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    const token = localStorage.getItem("optikur_jwt_token");
    if (!token) {
      setPasswordError("Session expired. Please sign in again.");
      return;
    }

    setPasswordSaving(true);
    try {
      const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");
      const res = await fetch(`${apiUrl}/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
      } else {
        setPasswordSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Unable to connect to server. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 dark:bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-zinc-900 dark:text-zinc-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-lg uppercase shadow-xs">
            {user.name?.[0] || user.email[0]}
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Account Profile
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Segmented Navigation Bar (Apple HIG / Fluent Style) */}
        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl mb-6 border border-zinc-200/60 dark:border-zinc-800/60">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "details"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Info</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "password"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <KeyIcon className="w-3.5 h-3.5" />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {detailsError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                <span>{detailsError}</span>
              </div>
            )}
            {detailsSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{detailsSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={detailsSaving}
                className="flex-1 py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {detailsSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  requestSignOut();
                }}
                className="py-2 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Sign Out"
              >
                <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </form>
        )}

        {/* Security / Password Tab */}
        {activeTab === "password" && (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {passwordSaving ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
