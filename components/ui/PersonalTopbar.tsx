"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, MapPin, User } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/cn";

type PersonalTopbarProps = {
  sucursalActual?: string;
  usuario?: {
    nombre?: string;
    email?: string;
    rol?: string;
    sucursal?: string;
  };
};

export function PersonalTopbar({
  sucursalActual,
  usuario,
}: PersonalTopbarProps) {
  const { logout } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Determinar la sucursal de forma dinámica priorizando la prop o el usuario
  const sucursalFinal = sucursalActual || usuario?.sucursal || "NoodleVolt Centro";

  // Generar las iniciales del usuario dinámicamente
  const nombreUsuario = usuario?.nombre || "Personal NoodleVolt";
  const inicial = nombreUsuario.trim().charAt(0).toUpperCase() || usuario?.email?.trim().charAt(0).toUpperCase();

  // Traducción amigable de los roles del backend para la interfaz
  const rolTexto = 
    usuario?.rol === "BRANCH_ADMIN" ? "Gerente de Sucursal" :
    usuario?.rol === "GENERAL_MANAGER" ? "Gerente General" :
    usuario?.rol === "GERENTE" ? "Gerente" :
    usuario?.rol || "Personal";

  useEffect(() => {
    const cerrarAlHacerClicFuera = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    };
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuAbierto(false);
      }
    };

    if (menuAbierto) {
      document.addEventListener("mousedown", cerrarAlHacerClicFuera);
      document.addEventListener("keydown", cerrarConEscape);
    }

    return () => {
      document.removeEventListener("mousedown", cerrarAlHacerClicFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [menuAbierto]);

  return (
    <header className="relative z-50 flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-white px-6">
      {/* Sucursal dinámica según la sesión actual */}
      <div className="flex items-center gap-2 rounded-full border border-border bg-cream/30 px-4 py-2 text-base">
        <MapPin aria-hidden className="size-5 shrink-0 text-crimson" />
        <span className="text-text-secondary">Sucursal:</span>
        <span className="font-semibold text-brown">{sucursalFinal}</span>
      </div>

      {/* Menú de usuario, consistente con el navbar de cliente. */}
      <div ref={menuRef} className="relative flex items-center gap-3">
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="text-right text-base font-semibold text-brown">{nombreUsuario}</span>
          <span className="text-right text-sm text-text-secondary">{rolTexto}</span>
        </div>
        <button
          type="button"
          aria-label="Menú de perfil"
          aria-expanded={menuAbierto}
          aria-haspopup="menu"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          className={cn(
            "flex size-11 items-center justify-center rounded-full border-2 border-brown bg-cream font-display text-base font-bold text-brown outline-none transition-colors",
            "hover:border-crimson hover:text-crimson focus-visible:shadow-focus",
            menuAbierto && "border-crimson ring-2 ring-crimson/20",
          )}
        >
          {inicial ? <span>{inicial}</span> : <User aria-hidden className="size-5" />}
        </button>
        {menuAbierto && (
          <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 rounded-card border-2 border-brown bg-white p-2 shadow-lg">
            <div className="border-b border-border/80 px-3 py-2">
              <p className="truncate text-sm font-semibold text-brown">{nombreUsuario}</p>
              {usuario?.email && <p className="mt-0.5 truncate text-xs text-text-secondary">{usuario.email}</p>}
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setMenuAbierto(false);
                  void logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:shadow-focus"
              >
                <LogOut aria-hidden className="size-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
