import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KitchenApiError, getKitchenOrders, type KitchenOrder } from "@/lib/api/kitchen";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";
import { KitchenAccessDenied, KitchenBoard } from "./kitchen-board";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tablero de cocina" };

export default async function KitchenBoardPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) redirect("/login");
  if (user.rol !== "COOK") return <KitchenAccessDenied />;

  let initialOrders: KitchenOrder[] = [];
  let initialError: string | undefined;
  try {
    initialOrders = await getKitchenOrders(token);
  } catch (error) {
    if (error instanceof KitchenApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof KitchenApiError && error.status === 403) return <KitchenAccessDenied />;
    initialError = "No se pudo completar la operación. Intenta de nuevo";
  }

  return <KitchenBoard initialOrders={initialOrders} initialError={initialError} userName={user.nombre} />;
}
