"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { SafeSessionUser } from "@/lib/session";
import { checkAuth, logout as logoutAction } from "@/app/actions/auth";

type AuthContextType = {
  user: SafeSessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  initialUser?: SafeSessionUser | null;
};

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [user, setUser] = useState<SafeSessionUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();
  const pathname = usePathname();

  // Sincroniza si initialUser cambia desde un Server Component o hidratación SSR
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = await checkAuth();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Al navegar entre rutas, verificar si la sesión sigue activa o ha expirado
  useEffect(() => {
    // Si no estamos en rutas de autenticación, verificar vigencia en segundo plano
    if (pathname !== "/login" && pathname !== "/registro") {
      refreshSession();
    }
  }, [pathname, refreshSession]);

  const logout = useCallback(async () => {
    startTransition(async () => {
      setUser(null);
      await logoutAction();
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

