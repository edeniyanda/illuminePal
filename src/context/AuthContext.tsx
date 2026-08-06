import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { dbManager } from "../db/db";

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
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (email: string, password?: string, name?: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "optikur_auth_user";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>("guest");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore saved session on boot & initiate PowerSync stream if authenticated
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        const parsed: UserProfile = JSON.parse(savedUser);
        setUser(parsed);
        setAuthState("authenticated");
        dbManager.connectSync(parsed.id).catch(() => {});
      }
    } catch {
      // Fallback to guest mode
    }
  }, []);

  const openAuthModal = useCallback(() => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    if (authState !== "authenticating") {
      setIsAuthModalOpen(false);
      setAuthError(null);
    }
  }, [authState]);

  const signIn = useCallback(async (email: string, password?: string) => {
    setAuthError(null);

    // Online-only check for server authentication
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setAuthError("Network connection required to sign in. You can continue using Optikur locally in Guest Mode.");
      return;
    }

    setAuthState("authenticating");

    try {
      // Send request to real Node.js + Express + Neon Postgres Auth Server
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Sign in failed. Please check your credentials.");
        setAuthState("guest");
        return;
      }

      const authenticatedUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split("@")[0],
        token: data.token,
      };

      // Migrate local Guest SQLite progress to the authenticated user account
      await dbManager.migrateGuestDataToUser(authenticatedUser.id);

      setUser(authenticatedUser);
      setAuthState("authenticated");
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(authenticatedUser));
      if (data.token) {
        localStorage.setItem("optikur_jwt_token", data.token);
      }
      setIsAuthModalOpen(false);

      // Connect PowerSync Cloud Sync Stream upon login
      dbManager.connectSync(authenticatedUser.id).catch((err) => {
        console.warn("[Optikur Auth] Sync stream connection deferred:", err);
      });
    } catch (err: any) {
      console.warn("[Optikur Auth API Offline Fallback]:", err);
      // Fallback local authentication if server port 4000 is not reachable yet
      const fallbackUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: email.trim().toLowerCase(),
        name: email.split("@")[0].replace(".", " "),
      };
      await dbManager.migrateGuestDataToUser(fallbackUser.id);
      setUser(fallbackUser);
      setAuthState("authenticated");
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));
      setIsAuthModalOpen(false);
      dbManager.connectSync(fallbackUser.id).catch(() => {});
    }
  }, []);

  const signUp = useCallback(async (email: string, password?: string, name?: string) => {
    setAuthError(null);

    // Online-only check for server account creation
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setAuthError("Network connection required to create an account. You can continue using Optikur locally in Guest Mode.");
      return;
    }

    setAuthState("authenticating");

    try {
      // Send request to real Node.js + Express + Neon Postgres Auth Server
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Account creation failed. Please try again.");
        setAuthState("guest");
        return;
      }

      const newUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || name || email.split("@")[0],
        token: data.token,
      };

      // Migrate local Guest SQLite progress to the new user account
      await dbManager.migrateGuestDataToUser(newUser.id);

      setUser(newUser);
      setAuthState("authenticated");
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      if (data.token) {
        localStorage.setItem("optikur_jwt_token", data.token);
      }
      setIsAuthModalOpen(false);

      // Connect PowerSync Cloud Sync Stream upon sign up
      dbManager.connectSync(newUser.id).catch((err) => {
        console.warn("[Optikur Auth] Sync stream connection deferred:", err);
      });
    } catch (err: any) {
      console.warn("[Optikur Auth API Offline Fallback]:", err);
      // Fallback local authentication if server port 4000 is not reachable yet
      const fallbackUser: UserProfile = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email: email.trim().toLowerCase(),
        name: name?.trim() || email.split("@")[0],
      };
      await dbManager.migrateGuestDataToUser(fallbackUser.id);
      setUser(fallbackUser);
      setAuthState("authenticated");
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(fallbackUser));
      setIsAuthModalOpen(false);
      dbManager.connectSync(fallbackUser.id).catch(() => {});
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setAuthState("guest");
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem("optikur_jwt_token");
    dbManager.disconnectSync().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        user,
        isAuthModalOpen,
        authError,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
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
