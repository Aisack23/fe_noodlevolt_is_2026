import { MapPin, User } from "lucide-react";

type PersonalTopbarProps = {
  sucursal: string;
  usuario: { nombre: string; rol: string };
};

export function PersonalTopbar({ sucursal, usuario }: PersonalTopbarProps) {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <p className="flex items-center gap-2 text-base">
        <MapPin aria-hidden className="size-5 text-crimson" />
        <span className="text-text-secondary">Sucursal:</span>
        <span className="font-semibold text-brown">{sucursal}</span>
      </p>

      <div className="flex items-center gap-3">
        <div
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-cream text-brown"
        >
          <User className="size-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-brown">{usuario.nombre}</span>
          <span className="text-sm text-text-secondary">{usuario.rol}</span>
        </div>
      </div>
    </header>
  );
}