import Link from "next/link";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { getLowStock } from "@/lib/api/purchases";
import { getSession, getSessionUser } from "@/lib/session";

export const metadata = { title: "Insumos por comprar" };
const quantity = new Intl.NumberFormat("es-SV", { maximumFractionDigits: 3 });

export default async function LowStockPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token) redirect("/login");
  if (user?.rol !== "BRANCH_ADMIN" || !user.branchId) return <AccesoDenegado href="/menu" />;
  const items = await getLowStock(token);

  return (
    <main className="space-y-5 px-4 py-6 md:px-8">
      <h1 className="font-display text-h2 font-bold text-brown">Insumos por comprar</h1>
      <Link href="/gerente/compras/nueva" className="inline-flex rounded-control bg-crimson px-4 py-3 font-semibold text-white">
        Registrar compra
      </Link>
      {items.length === 0 ? (
        <EstadoVacio titulo="Sin insumos por reponer" mensaje="Todos los insumos están sobre su mínimo." />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-white">
          <table className="w-full min-w-96 text-left">
            <thead className="bg-cream text-brown">
              <tr>{["Insumo", "Stock actual", "Mínimo", "Cantidad sugerida"].map((label) => <th key={label} scope="col" className="p-3">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <th scope="row" className="p-3 font-semibold">{item.name}</th>
                  <td className="p-3">{quantity.format(item.currentStock)} {item.unit}</td>
                  <td className="p-3">{quantity.format(item.minimumStock)} {item.unit}</td>
                  <td className="p-3">{quantity.format(Math.max(0, 2 * item.minimumStock - item.currentStock))} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
