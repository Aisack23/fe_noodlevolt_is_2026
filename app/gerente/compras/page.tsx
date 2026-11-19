import Link from "next/link";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { getPurchases } from "@/lib/api/purchases";
import { getSession, getSessionUser } from "@/lib/session";

export const metadata = { title: "Compras" };

export default async function PurchasesPage({ searchParams }: { searchParams: Promise<{ pagina?: string }> }) {
  const [token, user, { pagina }] = await Promise.all([getSession(), getSessionUser(), searchParams]);
  if (!token) redirect("/login");
  if (user?.rol !== "BRANCH_ADMIN" || !user.branchId) return <AccesoDenegado href="/menu" />;
  const parsed = Number(pagina ?? 1);
  const page = Number.isInteger(parsed) && parsed >= 1 && parsed <= 1_000_000 ? parsed : 1;
  const result = await getPurchases(token, page);
  const date = new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeZone: "America/El_Salvador" });
  const money = new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD", maximumFractionDigits: 4 });

  return (
    <main className="space-y-5 px-4 py-6 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-h2 font-bold text-brown">Compras</h1>
        <Link href="/gerente/compras/nueva" className="rounded-control bg-crimson px-4 py-3 font-semibold text-white">Nueva entrada</Link>
      </div>
      {result.items.length === 0 ? (
        <EstadoVacio titulo="No hay compras en esta página" mensaje="El historial muestra las entradas registradas en tu sucursal." />
      ) : (
        <ul className="space-y-3">
          {result.items.map((item) => (
            <li key={item.id} className="rounded-card border border-border bg-white p-4">
              <details>
                <summary className="cursor-pointer font-semibold text-brown">
                  {item.supplier} · {item.invoiceNumber ?? "Sin factura"} · {date.format(new Date(item.purchasedAt))}
                </summary>
                <ul className="mt-3 space-y-2">
                  {item.details.map((line) => (
                    <li key={line.id}>{line.ingredientName} · {line.quantity} {line.unit} · {money.format(Number(line.unitCost))} por unidad</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      )}
      {(page > 1 || page * result.limit < result.total) && (
        <nav aria-label="Páginas de compras" className="flex gap-4 font-semibold text-crimson">
          {page > 1 && <Link href={`?pagina=${page - 1}`}>Anterior</Link>}
          {page * result.limit < result.total && <Link href={`?pagina=${page + 1}`}>Siguiente</Link>}
        </nav>
      )}
    </main>
  );
}
