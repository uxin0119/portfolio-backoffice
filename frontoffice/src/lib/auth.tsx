"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";

export type Member = {
  id: number;
  loginId: string;
  name: string;
  token: string;
  email?: string | null;
  phone?: string | null;
  postcode?: string | null;
  address?: string | null;
  addressDetail?: string | null;
};

export type SignupData = {
  loginId: string;
  password: string;
  name?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  address?: string;
  addressDetail?: string;
};

type AuthCtx = {
  member: Member | null;
  signup: (data: SignupData) => Promise<void>;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fo_auth");
      if (saved) setMember(JSON.parse(saved) as Member);
    } catch {}
  }, []);

  function persist(m: Member | null) {
    setMember(m);
    try {
      if (m) localStorage.setItem("fo_auth", JSON.stringify(m));
      else localStorage.removeItem("fo_auth");
    } catch {}
  }

  const signup: AuthCtx["signup"] = async (data) => {
    const m = await api<Member>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
    persist(m);
  };

  const login: AuthCtx["login"] = async (loginId, password) => {
    const m = await api<Member>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ loginId, password }),
    });
    persist(m);
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ member, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
