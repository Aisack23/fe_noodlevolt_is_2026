import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { getBranches, getMyBranch, BranchApiError, type Branch } from "@/lib/api/branches";
import { canAccessBranchAdministration, isBranchAdministrationRole } from "@/lib/auth/roles";
import { getSession, getSessionUser } from "@/lib/session";
import { BranchesManagement } from "./branches-management";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sucursales" };

export default async function SucursalesPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) {
    redirect("/login");
  }
  if (!canAccessBranchAdministration(user.rol)) {
    return <AccesoDenegado href="/menu" />;
  }

  let branches: Branch[];
  const isGeneral = user.rol === "GENERAL_MANAGER";
  try {
    if (isGeneral) branches = await getBranches(token);
    else {
      const assigned = await getMyBranch(token);
      branches = assigned ? [assigned] : [];
    }
  } catch (error) {
    if (error instanceof BranchApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  const role = isBranchAdministrationRole(user.rol) ? user.rol : "BRANCH_ADMIN";
  const branchName = isGeneral ? "Todas las sucursales" : branches[0]?.name ?? "Sin sucursal asignada";

  return (
    <PersonalShell rol={role} sucursal={branchName} usuario={user}>
      <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-h2 font-bold uppercase text-brown">Sucursal</h1>
          <p className="text-sm text-text-secondary">{isGeneral ? "Consulta el estado de las sucursales." : "Consulta y administra el estado de tu sucursal asignada."}</p>
        </div>
        <BranchesManagement
          branches={branches}
          canWrite={!isGeneral}
          mensajeVacio={isGeneral ? "No hay sucursales registradas." : "No tienes una sucursal asignada a tu cuenta."}
        />
      </main>
    </PersonalShell>
  );
}
