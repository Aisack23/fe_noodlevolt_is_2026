import type { ReactNode } from "react";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GerenteLayout({ children }: { children: ReactNode }) {
  const user = (await getSessionUser()) as any;

  // Obtenemos el correo del usuario de la sesión actual
  const email = user?.email || "";

  // Asignamos la sucursal y el nombre basándonos estrictamente en el correo del Seed
  let sucursalNombre = "NoodleVolt Santa Tecla";
  let nombreUsuario = "Gerente Santa Tecla";

  if (email.includes("centro")) {
    sucursalNombre = "NoodleVolt Centro";
    nombreUsuario = "Gerente Centro";
  } else if (email.includes("branch_admin@example.com")) {
    sucursalNombre = "NoodleVolt Santa Tecla";
    nombreUsuario = "Gerente Santa Tecla";
  }

  return (
    <PersonalShell
      rol={user?.rol ?? "BRANCH_ADMIN"}
      sucursal={sucursalNombre}
      usuario={{
        nombre: nombreUsuario,
        rol: "Gerente de Sucursal",
      }}
    >
      {children}
    </PersonalShell>
  );
}