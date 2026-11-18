import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { getMyBranch, BranchApiError, type Branch } from "@/lib/api/branches";
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

  let myBranch: Branch | null = null;
  try {
    // Obtiene exclusivamente la sucursal asociada al usuario autenticado (GET /branches/me/branch)
    myBranch = await getMyBranch(token);
  } catch (error) {
    if (error instanceof BranchApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    throw error;
  }

  const branches: Branch[] = myBranch ? [myBranch] : [];
  const role = isBranchAdministrationRole(user.rol) ? user.rol : "BRANCH_ADMIN";
  const branchName = myBranch?.name ?? (role === "GENERAL_MANAGER" ? "Todas las sucursales" : "Sin sucursal asignada");

  return (
    <PersonalShell rol={role} sucursal={branchName} usuario={user}>
      <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-h2 font-bold uppercase text-brown">Sucursal</h1>
          <p className="text-sm text-text-secondary">Consulta y administra el estado de tu sucursal asignada.</p>
        </div>
        <BranchesManagement
          branches={branches}
          mensajeVacio="No tienes una sucursal asignada a tu cuenta."
        />
      </main>
    </PersonalShell>
  );
}
