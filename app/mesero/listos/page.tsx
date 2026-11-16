import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { PersonalShell } from "@/components/ui/PersonalShell";
import { KitchenApiError, getReadyKitchenOrders, type KitchenOrder } from "@/lib/api/kitchen";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";
import { ListosBoard } from "./listos-board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Listos para entregar" };

function AccessDenied() {
  return (
    <div className="min-h-screen bg-background">
      <AccesoDenegado href="/menu" />
    </div>
  );
}

export default async function ListosPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) redirect("/login");
  if (user.rol !== "WAITER") return <AccessDenied />;

  let initialOrders: KitchenOrder[] = [];
  let initialError: string | undefined;
  try {
    initialOrders = await getReadyKitchenOrders(token);
  } catch (error) {
    if (error instanceof KitchenApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof KitchenApiError && error.status === 403) return <AccessDenied />;
    initialError = "No se pudo completar la operación. Intenta de nuevo";
  }

  return (
    <PersonalShell rol="WAITER" sucursal="Sucursal asignada" usuario={user}>
      <ListosBoard initialOrders={initialOrders} initialError={initialError} />
    </PersonalShell>
  );
}