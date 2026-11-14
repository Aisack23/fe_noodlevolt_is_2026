import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { getSession, getSessionUser } from "@/lib/session";
import { ComandaFlow } from "./comanda-flow";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nueva comanda" };

export default async function ComandaPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) redirect("/login");

  if (user.rol !== "WAITER") {
    return (
      <div className="min-h-screen bg-background">
        <AccesoDenegado href="/menu" />
      </div>
    );
  }

  return (
    <PersonalShell rol="WAITER" sucursal="Sucursal asignada" usuario={user}>
      <ComandaFlow />
    </PersonalShell>
  );
}