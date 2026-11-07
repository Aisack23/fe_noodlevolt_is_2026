import Link from "next/link";
import { Ban } from "lucide-react";
import { cn } from "@/lib/cn";

type AccesoDenegadoProps = {
  // La pantalla de inicio depende del rol (FE-35). Ajustar cuando exista.
  href?: string;
  className?: string;
};

export function AccesoDenegado({ href = "/", className }: AccesoDenegadoProps) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center gap-3 px-4 py-12 text-center", className)}
    >
      <div className="flex size-24 items-center justify-center rounded-card bg-background">
        <Ban aria-hidden className="size-10 text-danger" />
      </div>
      <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
        Acceso denegado
      </h2>
      <p className="max-w-sm text-sm text-text-secondary">
        Tu cuenta no tiene permiso para ver esta pantalla.
      </p>
      <Link
        href={href}
        className="mt-2 inline-flex min-h-11 items-center justify-center rounded-control bg-crimson px-6 py-3 text-base font-semibold text-white outline-none hover:bg-crimson-hover focus-visible:shadow-focus"
      >
        Volver al inicio
      </Link>
    </div>
  );
}