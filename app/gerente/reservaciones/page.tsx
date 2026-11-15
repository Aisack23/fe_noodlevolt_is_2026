import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { getMyBranch } from "@/lib/api/branches";
import { canAccessBranchAdministration } from "@/lib/auth/roles";
import { getSession, getSessionUser } from "@/lib/session";
import { ReservacionesClient } from "./reservaciones-client";
import { getBranchReservationsAction } from "./actions";

export const metadata: Metadata = {
  title: "Reservaciones · Gerencia NoodleVolt",
  description: "Consulta y cancela las reservaciones de tu sucursal.",
};

function getFechaActual(): string {
  return new Date().toISOString().split("T")[0];
}

export default async function ReservacionesPage() {
  const token = await getSession();
  const user = await getSessionUser();

  if (!token || !user) {
    redirect("/login");
  }

  // Comprobación estricta de autorización de rol de gerencia
  if (!canAccessBranchAdministration(user.rol)) {
    return (
      <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <AccesoDenegado href="/menu" />
      </main>
    );
  }

  // Obtener la sucursal asignada al gerente autenticado mediante GET /branches/me/branch
  const myBranch = await getMyBranch(token);

  if (!myBranch) {
    return (
      <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-h2 font-bold uppercase text-brown">
            Reservaciones
          </h1>
          <p className="text-sm text-text-secondary">
            Consulta y cancela las reservaciones de tu sucursal.
          </p>
        </div>
        <Alerta tono="warning">
          Tu cuenta no tiene una sucursal asignada para consultar reservaciones.
        </Alerta>
      </main>
    );
  }

  const branchId = myBranch.id;
  const fechaHoy = getFechaActual();

  const result = await getBranchReservationsAction(branchId, fechaHoy);

  const initialReservations = result.ok ? result.reservations : [];
  const totalMesas = result.ok ? result.totalMesas : 6;

  return (
    <main className="flex-1">
      <ReservacionesClient
        branchId={branchId}
        initialDate={fechaHoy}
        initialReservations={initialReservations}
        totalMesas={totalMesas}
      />
    </main>
  );
}
