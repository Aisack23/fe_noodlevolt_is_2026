import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBranches } from "@/lib/api/branches";
import { getSessionUser } from "@/lib/session";
import { ReservarMesaClient } from "./reservar-mesa-client";
import { isClientRole } from "@/lib/auth/roles";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { BotonReintentar } from "@/components/ui/BotonReintentar";

export const metadata: Metadata = {
  title: "Reservar mesa · NoodleVolt",
  description: "Elige sucursal, fecha, hora y personas. Cada reservación dura 90 minutos.",
};

type ReservasPageProps = {
  searchParams: Promise<{ sucursal?: string | string[] }>;
};

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  const { sucursal } = await searchParams;
  const user = await getSessionUser();

  if (!user) {
    const params = typeof sucursal === "string" ? new URLSearchParams({ sucursal }) : null;
    const returnTo = params ? `/reservas?${params}` : "/reservas";
    redirect(`/login?${new URLSearchParams({ returnTo })}`);
  }

  if (!isClientRole(user.rol)) {
    return <AccesoDenegado href="/" />;
  }

  const branches = await getBranches().catch(() => null);
  if (!branches) {
    return (
      <main className="mx-auto flex w-full max-w-[1232px] flex-col items-start gap-4 px-4 py-6">
        <h1 className="font-display text-h1 font-bold uppercase text-brown">Reservar mesa</h1>
        <Alerta>No se pudieron cargar las sucursales. Intenta de nuevo.</Alerta>
        <BotonReintentar />
      </main>
    );
  }

  return (
    <main className="flex-1">
      <ReservarMesaClient
        branches={branches}
        initialBranchId={branches.find((branch) => branch.id === sucursal)?.id}
        user={user}
      />
    </main>
  );
}
