"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, Star } from "lucide-react";
import { formatPoints, isLoyaltyBalance } from "@/lib/api/loyalty";
import { Skeleton } from "@/components/ui/Skeleton";

type Estado =
  | { tipo: "cargando" }
  | { tipo: "exito"; points: number }
  | { tipo: "error" }
  | { tipo: "oculto" };

/**
 * Chip de saldo de la barra del cliente (FE-07). Consulta GET /api/loyalty/me al montar
 * y en cada cambio de ruta, para mostrar el saldo acreditado por el servidor después de
 * un pago aprobado. Nunca suma puntos en el cliente.
 */
export function SaldoPuntos() {
  const pathname = usePathname();
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });

  useEffect(() => {
    let cancelado = false;

    async function consultar() {
      try {
        const res = await fetch("/api/loyalty/me", { cache: "no-store" });
        if (cancelado) return;
        if (res.status === 401 || res.status === 403) {
          setEstado({ tipo: "oculto" });
          return;
        }
        const data: unknown = res.ok ? await res.json() : null;
        if (cancelado) return;
        setEstado(isLoyaltyBalance(data) ? { tipo: "exito", points: data.points } : { tipo: "error" });
      } catch {
        if (!cancelado) setEstado({ tipo: "error" });
      }
    }

    void consultar();
    return () => {
      cancelado = true;
    };
  }, [pathname]);

  if (estado.tipo === "oculto") return null;

  if (estado.tipo === "cargando") {
    return (
      <span role="status" aria-label="Cargando saldo de puntos">
        <Skeleton className="h-7 w-24 rounded-full" />
      </span>
    );
  }

  if (estado.tipo === "error") {
    // El aviso informa sin bloquear la barra (frame «Saldo de puntos / Error»).
    return (
      <span
        role="status"
        title="No se pudo consultar tu saldo de puntos"
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-info/12 px-2 text-sm text-info"
      >
        <Info aria-hidden className="size-6" />
        Sin saldo
      </span>
    );
  }

  return (
    <Link
      href="/perfil/puntos"
      aria-label={`Saldo de puntos: ${formatPoints(estado.points)}. Ver mis puntos`}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-cream px-2.5 py-2 text-sm font-semibold whitespace-nowrap text-brown md:gap-2 md:px-3 md:text-base outline-none hover:bg-cream/70 focus-visible:shadow-focus"
    >
      <Star aria-hidden className="size-5 fill-gold text-gold" />
      {formatPoints(estado.points)}
    </Link>
  );
}
