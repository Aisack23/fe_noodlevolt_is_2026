import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { getBranches, getMyBranch } from "@/lib/api/branches";
import { canAccessBranchAdministration } from "@/lib/auth/roles";
import { getSession, getSessionUser } from "@/lib/session";
import { ReservacionesClient } from "./reservaciones-client";
import { getBranchReservationsAction } from "./actions";

export const metadata: Metadata = { title: "Reservaciones · Gerencia NoodleVolt" };

export default async function ReservacionesPage({
  searchParams,
}: { searchParams: Promise<{ sucursal?: string }> }) {
  const [token, user, { sucursal }] = await Promise.all([getSession(), getSessionUser(), searchParams]);
  if (!token || !user) redirect("/login");
  if (!canAccessBranchAdministration(user.rol)) return <AccesoDenegado href="/menu" />;

  const isGeneral = user.rol === "GENERAL_MANAGER";
  const [branches, assigned] = await Promise.all([
    isGeneral ? getBranches(token) : [],
    isGeneral ? null : getMyBranch(token),
  ]);
  const active = branches.filter((branch) => branch.isActive);
  const branch = isGeneral ? active.find((row) => row.id === sucursal) ?? active[0] : assigned;

  if (!branch) {
    return (
      <main className="space-y-4 px-4 py-6 md:px-8">
        <h1 className="font-display text-h2 font-bold text-brown">Reservaciones</h1>
        <Alerta tono="warning">No hay una sucursal disponible para consultar reservaciones.</Alerta>
      </main>
    );
  }

  const date = new Intl.DateTimeFormat("en-CA", { timeZone: branch.timeZone }).format(new Date());
  return (
    <main className="flex-1">
      <ReservacionesClient
        key={branch.id}
        branchId={branch.id}
        timeZone={branch.timeZone}
        branches={active.map(({ id, name }) => ({ id, name }))}
        initialDate={date}
        initialResult={await getBranchReservationsAction(branch.id, date)}
      />
    </main>
  );
}
