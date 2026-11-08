import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { getBranches, BranchApiError, type Branch } from "@/lib/api/branches";
import { canAccessBranchAdministration, isBranchAdministrationRole } from "@/lib/auth/roles";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";
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
  try {
    branches = await getBranches(token);
  } catch (error) {
    if (error instanceof BranchApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    throw error;
  }

  const role = isBranchAdministrationRole(user.rol) ? user.rol : "BRANCH_ADMIN";
  const branchName = role === "GENERAL_MANAGER" ? "Todas las sucursales" : "Sucursal asignada";

  return (
    <PersonalShell rol={role} sucursal={branchName} usuario={user}>
      <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-h2 font-bold uppercase text-brown">Sucursales</h1>
          <p className="text-sm text-text-secondary">Consulta y administra el estado de las sucursales.</p>
        </div>
        <BranchesManagement branches={branches} />
      </main>
    </PersonalShell>
  );
}
