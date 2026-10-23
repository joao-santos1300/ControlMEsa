"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, loadSession, saveSession } from "./api";
import type { Session } from "./types";

interface AuthContextValue {
  session: Session | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<Session>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // localStorage só existe no cliente: lê após a hidratação para não divergir do HTML do servidor
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(loadSession());
    setReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api<Session>("/session", { method: "POST", body: { email, password } });
    saveSession(result);
    setSession(result);
    return result;
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  return <AuthContext.Provider value={{ session, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}

export function homeFor(role: Session["role"]) {
  if (role === "ADMIN") return "/dashboard";
  if (role === "KITCHEN") return "/cozinha";
  return "/mesas";
}
