"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "tappath-user";

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "admin@tappath.com": {
    password: "admin1234",
    user: { id: "admin-1", email: "admin@tappath.com", name: "Admin", role: "admin" },
  },
  "user@tappath.com": {
    password: "user1234",
    user: { id: "user-1", email: "user@tappath.com", name: "Demo User", role: "user" },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const key = email.trim().toLowerCase();
    const entry = DEMO_USERS[key];
    if (!entry || entry.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    persist(entry.user);
    return { ok: true };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    const key = email.trim().toLowerCase();
    if (DEMO_USERS[key]) {
      return { ok: false, error: "An account with this email already exists." };
    }
    if (password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: key,
      name: name.trim() || "User",
      role: "user",
    };
    persist(newUser);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    persist(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin: user?.role === "admin",
    }),
    [user, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAuthOptional() {
  return useContext(AuthContext);
}
