import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type AuthState = "guest" | "authenticating" | "authenticated" | "offline";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>("guest");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Restore saved session on boot if available
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(LOCAL_USER_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setAuthState("authenticated");
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

  const signIn = useCallback(async (email: string, _password?: string) => {
    setAuthError(null);
    setAuthState("authenticating");

    // Simulate 1-second delay for smooth UI authentication flow (Step 2 Mock)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!email || !email.includes("@")) {
      setAuthError("Please enter a valid email address.");
      setAuthState("guest");
      return;
    }

    const mockUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      name: email.split("@")[0].replace(".", " "),
    };

    setUser(mockUser);
    setAuthState("authenticated");
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
  }, []);

  const signUp = useCallback(async (email: string, _password?: string, name?: string) => {
    setAuthError(null);
    setAuthState("authenticating");

    // Simulate 1-second delay for smooth UI authentication flow (Step 2 Mock)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!email || !email.includes("@")) {
      setAuthError("Please enter a valid email address.");
      setAuthState("guest");
      return;
    }

    const mockUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      name: name?.trim() || email.split("@")[0],
    };

    setUser(mockUser);
    setAuthState("authenticated");
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setAuthState("guest");
    localStorage.removeItem(LOCAL_USER_KEY);
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
