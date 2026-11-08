"use client";

import { MapPin } from "lucide-react";

type PersonalTopbarProps = {
  sucursalActual?: string;
  usuario?: {
    nombre?: string;
    rol?: string;
    sucursal?: string;
  };
};

export function PersonalTopbar({
  sucursalActual,
  usuario,
}: PersonalTopbarProps) {
  // Determinar la sucursal de forma dinámica priorizando la prop o el usuario
  const sucursalFinal = sucursalActual || usuario?.sucursal || "NoodleVolt Centro";

  // Generar las iniciales del usuario dinámicamente
  const nombreUsuario = usuario?.nombre || "Personal NoodleVolt";
  const iniciales = nombreUsuario
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Traducción amigable de los roles del backend para la interfaz
  const rolTexto = 
    usuario?.rol === "BRANCH_ADMIN" ? "Gerente de Sucursal" :
    usuario?.rol === "GENERAL_MANAGER" ? "Gerente General" :
    usuario?.rol === "GERENTE" ? "Gerente" :
    usuario?.rol || "Personal";

  return (
    <header className="relative z-50 flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-white px-6">
      {/* Sucursal dinámica según la sesión actual */}
      <div className="flex items-center gap-2 rounded-full border border-border bg-cream/30 px-4 py-2 text-base">
        <MapPin aria-hidden className="size-5 shrink-0 text-crimson" />
        <span className="text-text-secondary">Sucursal:</span>
        <span className="font-semibold text-brown">{sucursalFinal}</span>
      </div>

      {/* Información del Usuario Dinámica */}
      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-cream text-sm font-semibold text-brown"
        >
          {iniciales}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-brown">{nombreUsuario}</span>
          <span className="text-sm text-text-secondary">{rolTexto}</span>
        </div>
      </div>
    </header>
  );
}