import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { dbManager } from "../db/db";
import { syncManager } from "../services/SyncManager";

export type AuthState = "guest" | "authenticating" | "authenticated" | "offline";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  token?: string;
}

interface AuthContextType {
  authState: AuthState;
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  authError: string | null;
  isLogoutModalOpen: boolean;
  logoutReason: "offline" | "unsynced" | null;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string, name?: string) => Promise<void>;
  requestSignOut: () => Promise<void>;
  confirmSignOut: (force?: boolean) => void;
  cancelSignOut: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "optikur_auth_user";

async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const configuredUrl = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");
  const fallbackUrl = configuredUrl.includes("localhost")
    ? "https://optikur-backend.onrender.com/api"
    : "http://localhost:4000/api";

  try {
    const res = await fetch(`${configuredUrl}${path}`, options);
    return res;
  } catch (primaryErr) {
    console.warn(`[Optikur Auth] Primary endpoint (${configuredUrl}${path}) unreachable, trying fallback (${fallbackUrl}${path})...`);
    return await fetch(`${fallbackUrl}${path}`, options);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>("guest");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [logoutReason, setLogoutReason] = useState<"offline" | "unsynced" | null>(null);

  // Restore saved session on boot & initialize local SQLite database
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      const token = localStorage.getItem("optikur_jwt_token");

      if (savedUser) {
        const parsed: UserProfile = JSON.parse(savedUser);
        console.log(`[Optikur Auth Session Restored]: ${parsed.email} (${parsed.id})`);
        setUser(parsed);
        setAuthState("authenticated");
        dbManager.init(parsed.id).catch(() => {});
        syncManager.startAutoSync();

        // Background token verification & cloud dataset hydration check
        if (token) {
          authFetch("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => {
              if (res.ok) {
                console.log("[Optikur Auth] Token verification confirmed with backend server.");
              }
            })
            .catch(() => {});
        }
      } else {
        dbManager.init(null).catch(() => {});
      }
    } catch (err) {
      console.warn("[Optikur Auth] Failed to restore session from localStorage:", err);
      dbManager.init(null).catch(() => {});
    }
  }, []);

  const openAuthModal = useCallback(() => {
    console.log("[Optikur Auth Modal Opened]");
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    if (authState !== "authenticating") {
      setIsAuthModalOpen(false);
      setAuthError(null);
    }
  }, [authState]);

  const signOut = useCallback(async () => {
    const currentUserId = user?.id;
    console.log("[Optikur Auth] Signing out current user & purging all local session data...");
    syncManager.stopAutoSync();

    setUser(null);
    setAuthState("guest");
    setAuthError(null);
    setIsAuthModalOpen(false);
    setIsLogoutModalOpen(false);
    setLogoutReason(null);

    // Thorough storage & session cleanup for clean user switching
    localStorage.clear();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }

    // Purge local user & guest SQLite database partitions completely
    await dbManager.purgeLocalDatabase(currentUserId);
    console.log("[Optikur Auth] Sign out completed cleanly. All local databases purged.");

    // Refresh application state completely so all React component memory states reset fresh
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, [user]);

  const requestSignOut = useCallback(async () => {
    if (!user) {
      signOut();
      return;
    }

    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
    const pendingSync = await dbManager.hasPendingSync();

    if (isOffline) {
      setLogoutReason("offline");
      setIsLogoutModalOpen(true);
    } else if (pendingSync) {
      setLogoutReason("unsynced");
      setIsLogoutModalOpen(true);
    } else {
      signOut();
    }
  }, [user, signOut]);

  const confirmSignOut = useCallback(
    (_force?: boolean) => {
      signOut();
    },
    [signOut]
  );

  const cancelSignOut = useCallback(() => {
    setIsLogoutModalOpen(false);
    setLogoutReason(null);
    if (user?.id) {
      dbManager.init(user.id).catch(() => {});
    }
  }, [user]);

  const signIn = useCallback(async (email: string, password?: string) => {
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    console.log(`[Optikur Auth] Initiating Sign In for: ${cleanEmail}`);
    setAuthState("authenticating");

    try {
      const res = await authFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.error || "Sign in failed. Please check your credentials.";
        console.warn(`[Optikur Auth Sign In Failed]: ${errorMsg}`);
        setAuthError(errorMsg);
        setAuthState("guest");
        return;
      }

      const authenticatedUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || cleanEmail.split("@")[0],
        token: data.token,
      };

      console.log(`✅ [Optikur Auth Sign In Success]: ${authenticatedUser.email} (${authenticatedUser.id})`);

      setUser(authenticatedUser);
      setAuthState("authenticated");
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authenticatedUser));
      if (data.token) {
        localStorage.setItem("optikur_jwt_token", data.token);
      }
      setIsAuthModalOpen(false);
      syncManager.startAutoSync();

      // Hydrate local SQLite database with cloud user data
      if (data.token) {
        authFetch("/sync/hydrate", {
          headers: { Authorization: `Bearer ${data.token}` },
        })
          .then(async (hydrateRes) => {
            if (hydrateRes.ok) {
              const hydrationPayload = await hydrateRes.json();
              await dbManager.populateCloudHydrationData(hydrationPayload, authenticatedUser.id);
            }
          })
          .catch((err) => {
            console.warn("[Optikur Auth] Cloud dataset hydration deferred:", err);
            dbManager.init(authenticatedUser.id).catch(() => {});
          });
      } else {
        dbManager.init(authenticatedUser.id).catch(() => {});
      }
    } catch (err: any) {
      console.error("❌ [Optikur Auth Sign In Error]:", err);
      setAuthError("Unable to connect to authentication server. Please check your connection.");
      setAuthState("guest");
    }
  }, []);

  const signUp = useCallback(async (email: string, password?: string, name?: string) => {
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    console.log(`[Optikur Auth] Initiating Account Creation for: ${cleanEmail}`);
    setAuthState("authenticating");

    try {
      const res = await authFetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password, name: name?.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.error || "Account creation failed. Please try again.";
        console.warn(`[Optikur Auth Sign Up Failed]: ${errorMsg}`);
        setAuthError(errorMsg);
        setAuthState("guest");
        return;
      }

      const newUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || name?.trim() || cleanEmail.split("@")[0],
        token: data.token,
      };

      console.log(`✅ [Optikur Auth Sign Up Success]: ${newUser.email} (${newUser.id})`);

      setUser(newUser);
      setAuthState("authenticated");
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      if (data.token) {
        localStorage.setItem("optikur_jwt_token", data.token);
      }
      setIsAuthModalOpen(false);

      if (data.token) {
        syncManager.migrateGuestToAccount(data.token, newUser.id).then(() => {
          syncManager.startAutoSync();
        });
      } else {
        dbManager.init(newUser.id).catch(() => {});
      }
    } catch (err: any) {
      console.error("❌ [Optikur Auth Sign Up Error]:", err);
      setAuthError("Unable to connect to authentication server. Please check your connection.");
      setAuthState("guest");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        isAuthModalOpen,
        authError,
        isLogoutModalOpen,
        logoutReason,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        requestSignOut,
        confirmSignOut,
        cancelSignOut,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
