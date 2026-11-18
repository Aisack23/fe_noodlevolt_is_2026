import type { ReactNode } from "react";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { isBranchAdministrationRole } from "@/lib/auth/roles";
import { getMyBranch } from "@/lib/api/branches";
import { getSession, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GerenteLayout({ children }: { children: ReactNode }) {
  const token = await getSession();
  const user = await getSessionUser();

  // Obtener el nombre de la sucursal del usuario autenticado
  let sucursalNombre = "NoodleVolt";
  if (token) {
    try {
      const myBranch = await getMyBranch(token);
      if (myBranch) {
        sucursalNombre = myBranch.name;
      }
    } catch {
      // Si falla, se usa el nombre genérico
    }
  }

  // Para GENERAL_MANAGER sin sucursal asignada, mostramos "Todas las sucursales"
  if (user?.rol === "GENERAL_MANAGER" && sucursalNombre === "NoodleVolt") {
    sucursalNombre = "Todas las sucursales";
  }

  const nombreUsuario = user?.nombre || user?.email || "Personal NoodleVolt";

  return (
    <PersonalShell
      rol={isBranchAdministrationRole(user?.rol) ? user.rol : "BRANCH_ADMIN"}
      sucursal={sucursalNombre}
      usuario={{
        nombre: nombreUsuario,
        email: user?.email,
        rol: user?.rol,
      }}
    >
      {children}
    </PersonalShell>
  );
}
