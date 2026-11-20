import Link from "next/link";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { getInventory } from "@/lib/api/inventory";
import { getSession, getSessionUser } from "@/lib/session";
import { PurchaseForm } from "./purchase-form";

export const metadata = { title: "Nueva entrada de compra" };

export default async function NewPurchasePage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token) redirect("/login");
  if (user?.rol !== "BRANCH_ADMIN" || !user.branchId) return <AccesoDenegado href="/menu" />;
  const ingredients = await getInventory(token);
  return (
    <main className="max-w-5xl space-y-5 px-4 py-6 md:px-8">
      <Link href="/gerente/compras" className="font-semibold text-crimson">Volver a compras</Link>
      <h1 className="font-display text-h2 font-bold text-brown">Nueva entrada de compra</h1>
      {ingredients.length ? <PurchaseForm ingredients={ingredients} /> :
        <Alerta tono="warning">Registra insumos activos en la sucursal para recibir una compra.</Alerta>}
    </main>
  );
}
