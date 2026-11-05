import type { ReactNode } from "react";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { FooterCliente } from "@/components/ui/FooterCliente";

export default function MenuLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 pb-20 md:pb-0">{children}</div>
      <div className="hidden md:block">
        <FooterCliente />
      </div>
      <BottomTabBar />
    </div>
  );
}