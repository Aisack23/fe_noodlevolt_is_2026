import type { ReactNode } from "react";
import { PersonalSidebar, type RolPersonal } from "./PersonalSidebar";
import { PersonalTopbar } from "./PersonalTopbar";

type PersonalShellProps = {
  rol: RolPersonal;
  sucursal: string;
  usuario: { nombre: string; rol: string };
  children: ReactNode;
};

export function PersonalShell({ rol, sucursal, usuario, children }: PersonalShellProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <PersonalSidebar rol={rol} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PersonalTopbar sucursal={sucursal} usuario={usuario} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}