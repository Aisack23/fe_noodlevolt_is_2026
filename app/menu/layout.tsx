import type { ReactNode } from "react";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { FooterCliente } from "@/components/ui/FooterCliente";
import { NavbarCliente } from "@/components/ui/NavbarCliente";
import { getSessionUser } from "@/lib/session";

export default async function MenuLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarCliente estaAutenticado={Boolean(user)} usuario={user} />
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
      <div className="hidden md:block">
        <FooterCliente />
      </div>
      <BottomTabBar />
    </div>
  );
}