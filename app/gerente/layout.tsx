import type { ReactNode } from "react";
import { PersonalShell } from "@/components/ui/PersonalShell";

export default function GerenteLayout({ children }: { children: ReactNode }) {
  // SUPUESTO: datos provisionales tomados del Figma, hasta que exista la sesión
  // (nombre, rol y sucursal vendrán del token).
  return (
    <PersonalShell
      rol="GERENTE"
      sucursal="Santa Tecla"
      usuario={{ nombre: "Ana Martínez", rol: "Gerente" }}
    >
      {children}
    </PersonalShell>
  );
}