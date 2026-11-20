import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { isBranchAdministrationRole } from "@/lib/auth/roles";
import { getMyBranch } from "@/lib/api/branches";
import { getSession, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GerenteLayout({ children }: { children: ReactNode }) {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) redirect("/login");
  if (!isBranchAdministrationRole(user.rol)) return <AccesoDenegado href="/menu" />;

  const branch = user.rol === "BRANCH_ADMIN" ? await getMyBranch(token) : null;
  const name = user.rol === "GENERAL_MANAGER" ? "Todas las sucursales" : branch?.name ?? "Sin sucursal asignada";

  return (
    <PersonalShell rol={user.rol} sucursal={name} usuario={user}>
      {children}
    </PersonalShell>
  );
}
