import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { getBranches } from "@/lib/api/branches";
import { getMyBranch } from "@/lib/api/branches";
import { canAccessBranchAdministration } from "@/lib/auth/roles";
import { getSession, getSessionUser } from "@/lib/session";
import { VentasClient } from "./ventas-client";

export const metadata: Metadata = {
  title: "Ventas por sucursal · Gerencia NoodleVolt",
  description: "Consulta el total de ventas pagadas y la cantidad de pagos registrados.",
};

export default async function VentasPage() {
  const token = await getSession();
  const user = await getSessionUser();

  if (!token || !user) {
    redirect("/login");
  }

  if (!canAccessBranchAdministration(user.rol)) {
    return (
      <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <AccesoDenegado href="/" />
      </main>
    );
  }

  const isGeneralManager = user.rol === "GENERAL_MANAGER";

  // Para BRANCH_ADMIN obtenemos su sucursal asignada
  if (!isGeneralManager) {
    const myBranch = await getMyBranch(token);

    if (!myBranch) {
      return (
        <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-h2 font-bold uppercase text-brown">
              Ventas por sucursal
            </h1>
          </div>
          <Alerta tono="warning">
            Tu cuenta no tiene una sucursal asignada. Contacta al administrador general.
          </Alerta>
        </main>
      );
    }

    return (
      <main className="flex-1">
        <VentasClient
          isGeneralManager={false}
          fixedBranchName={myBranch.name}
          branches={[]}
        />
      </main>
    );
  }

  // Para GENERAL_MANAGER cargamos todas las sucursales para el selector
  let branches: { id: string; name: string }[] = [];
  try {
    const all = await getBranches(token);
    branches = all.map((b) => ({ id: b.id, name: b.name }));
  } catch {
    // Continúa sin el selector si falla; el GM puede consultar sin filtro de sucursal
  }

  return (
    <main className="flex-1">
      <VentasClient
        isGeneralManager={true}
        fixedBranchName={null}
        branches={branches}
      />
    </main>
  );
}
