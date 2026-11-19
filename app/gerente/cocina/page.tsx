import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { getKitchenSupervision } from "@/lib/api/kitchen";
import { getSession, getSessionUser } from "@/lib/session";

export const metadata = { title: "Tablero de cocina · Gerencia" };

export default async function SupervisionPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token) redirect("/login");
  if (user?.rol !== "BRANCH_ADMIN" || !user.branchId) return <AccesoDenegado href="/menu" />;
  const orders = await getKitchenSupervision(token);

  return (
    <main className="space-y-5 px-4 py-6 md:px-8">
      <h1 className="font-display text-h2 font-bold text-brown">Tablero de cocina</h1>
      {orders.length === 0 ? (
        <EstadoVacio titulo="No hay pedidos en cocina" mensaje="Aquí aparecerán los pedidos pendientes y en preparación." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <li key={order.id} className="space-y-3 rounded-card border border-border bg-white p-4">
              <h2 className="font-semibold text-brown">Pedido {order.orderNumber ?? order.id.slice(0, 8)}</h2>
              <p className="text-sm text-text-secondary">{order.status === "PENDING" ? "Pendiente" : "En preparación"}</p>
              <ul className="space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>{item.quantity} × {item.name}{item.note ? ` · ${item.note}` : ""}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
