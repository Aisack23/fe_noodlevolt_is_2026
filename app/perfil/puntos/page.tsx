import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { formatPoints, getMyLoyalty, LoyaltyApiError } from "@/lib/api/loyalty";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis puntos" };

const EXPLICACION = "Acumula 1 punto por cada $1.00 pagado.";

export default async function MisPuntosPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);

  if (!token || !user) redirect("/login");
  if (user.rol !== "CLIENT") return <AccesoDenegado href="/menu" />;

  let points: number;
  try {
    // Siempre se consulta al servidor: el saldo se actualiza solo tras un pago aprobado.
    ({ points } = await getMyLoyalty(token));
  } catch (error) {
    if (error instanceof LoyaltyApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof LoyaltyApiError && error.status === 403) {
      return <AccesoDenegado href="/menu" />;
    }

    return (
      <Contenedor>
        <Titulo />
        <Alerta>
          <span className="block">No se pudo completar la operación. Intenta de nuevo</span>
          <span className="block text-sm font-normal">Intenta de nuevo en unos segundos.</span>
        </Alerta>
        <Link
          href="/perfil/puntos"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-control border-2 border-orange px-6 py-3 text-base font-semibold text-brown outline-none hover:border-orange-hover hover:bg-orange/16 focus-visible:shadow-focus md:w-fit"
        >
          Reintentar
        </Link>
      </Contenedor>
    );
  }

  return (
    <Contenedor>
      <Titulo />

      <section
        aria-labelledby="saldo-disponible"
        className="flex flex-col gap-1 rounded-card bg-cream p-4 md:px-6 md:py-2"
      >
        <p id="saldo-disponible" className="text-sm text-text-secondary">
          Saldo disponible
        </p>
        <p className="font-display text-h1 font-bold tracking-[0.01em] uppercase text-brown">
          {formatPoints(points)}
        </p>
        <p className="text-base text-brown md:pb-2">{EXPLICACION}</p>
      </section>

      {points === 0 && (
        <EstadoVacio
          titulo="Aún no tienes puntos"
          mensaje="Cuando pagues un pedido, tus puntos aparecerán aquí."
          className="py-10"
        />
      )}
    </Contenedor>
  );
}

function Contenedor({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-[752px] flex-col gap-4 px-4 py-6 md:py-10">
      {children}
    </main>
  );
}

function Titulo() {
  return (
    <h1 className="font-display text-h2 font-bold tracking-[0.01em] uppercase text-brown">
      Mis puntos
    </h1>
  );
}
