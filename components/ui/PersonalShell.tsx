import Link from "next/link";
import type { ReactNode } from "react";
import { PersonalSidebar, type RolPersonal } from "./PersonalSidebar";
import { PersonalTopbar } from "./PersonalTopbar";
import type { SafeSessionUser } from "@/lib/session";

type PersonalShellProps = {
  rol: RolPersonal;
  sucursal: string;
  usuario: SafeSessionUser;

  children: ReactNode;
};

export function PersonalShell({ rol, sucursal, usuario, children }: PersonalShellProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <PersonalSidebar rol={rol} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PersonalTopbar sucursalActual={sucursal} usuario={usuario} />
        {rol === "WAITER" && (
          <nav aria-label="Operación de salón" className="flex gap-4 border-b border-border px-4 py-3 text-sm font-semibold text-crimson md:hidden">
            <Link href="/mesero/comanda">Nueva comanda</Link>
            <Link href="/mesero/listos">Listos para entregar</Link>
          </nav>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
