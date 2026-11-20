import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EstadoVacioProps = {
  titulo: string;
  mensaje?: string;
  accion?: ReactNode;
  className?: string;
};

export function EstadoVacio({ titulo, mensaje, accion, className }: EstadoVacioProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-4 py-12 text-center", className)}>
      <div className="relative size-28">
        <Image
          src="/brand/Logo/Mascota.jpeg"
          alt=""
          fill
          sizes="112px"
          className="object-contain"
        />
      </div>
      <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
        {titulo}
      </h2>
      {mensaje && <p className="max-w-sm text-sm text-text-secondary">{mensaje}</p>}
      {accion && <div className="pt-2">{accion}</div>}
    </div>
  );
}