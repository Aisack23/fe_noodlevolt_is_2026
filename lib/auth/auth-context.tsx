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
import { checkAuth, renewSession, logout as logoutAction } from "@/app/actions/auth";

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
  const [prevInitialUser, setPrevInitialUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();
  const pathname = usePathname();

  // Sincroniza si initialUser cambia desde un Server Component durante el renderizado (sin useEffect)
  if (prevInitialUser !== initialUser) {
    setPrevInitialUser(initialUser);
    setUser(initialUser);
  }

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

  // Al navegar entre rutas, verificar si la sesión sigue activa o ha expirado en segundo plano
  useEffect(() => {
    let montado = true;

    // Si no estamos en rutas de autenticación, verificar vigencia en segundo plano
    if (pathname !== "/login" && pathname !== "/registro") {
      checkAuth()
        .then((currentUser) => {
          if (montado) {
            setUser(currentUser);
          }
        })
        .catch(() => {
          if (montado) {
            setUser(null);
          }
        });
    }

    return () => {
      montado = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!user?.expiresAt) return;
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (expiresAt: number, delay = Math.max(0, expiresAt - Date.now() - 45_000)) => {
      timer = setTimeout(async () => {
        try {
          const nextExpiry = await (navigator.locks
            ? navigator.locks.request("noodlevolt-session", () => renewSession())
            : renewSession());
          if (mounted && nextExpiry) schedule(nextExpiry);
        } catch {
          if (mounted && Date.now() + 5000 < expiresAt) schedule(expiresAt, 5000);
        }
      }, delay);
    };
    schedule(user.expiresAt);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [user?.expiresAt]);

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

