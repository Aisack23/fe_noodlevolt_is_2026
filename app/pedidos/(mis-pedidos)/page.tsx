import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import {
  canRateOrder,
  getBranchRating,
  getMyOrders,
  ORDER_STATUS_LABELS,
  ReviewApiError,
  type CustomerOrder,
  type OrderStatus,
} from "@/lib/api/reviews";
import { mapearEstadoPedidoABadge } from "@/lib/orders/types";
import { RatingStars } from "@/components/business/RatingStars";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis pedidos" };

type MisPedidosPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return value !== undefined && Object.hasOwn(ORDER_STATUS_LABELS, value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type RatingState =
  | { average: number | null; count: number }
  | { error: string };

function PedidoCard({ order, ratingState }: { order: CustomerOrder; ratingState: RatingState }) {
  return (
    <article className="flex flex-col gap-5 rounded-card border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-h3 font-bold uppercase text-brown">
            Pedido {order.orderNumber ?? order.id}
          </h2>
          <p className="text-sm font-semibold text-text-secondary">{order.branchName}</p>
          <p className="text-sm text-text-secondary">{formatDate(order.createdAt)}</p>
        </div>
        <BadgeEstado estado={mapearEstadoPedidoABadge(order.status)} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-text-secondary">Total</dt>
          <dd className="mt-1 font-semibold text-brown">${order.total}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">Calificación</dt>
          <dd className="mt-1 font-semibold text-brown">
            {order.review ? (
              <span className="flex flex-wrap items-center gap-2">
                <RatingStars value={order.review.rating} readOnly />
                <span>{order.review.rating} de 5</span>
              </span>
            ) : "Sin calificar"}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">Promedio de sucursal</dt>
          <dd className="mt-1 font-semibold text-brown">
            {"error" in ratingState
              ? <span className="text-danger">{ratingState.error}</span>
              : ratingState.average === null
                ? "Sin reseñas"
                : `${ratingState.average.toFixed(1)} de 5 (${ratingState.count})`}
          </dd>
        </div>
      </dl>
      {canRateOrder(order) && (
        <Link
          href={`/pedidos/${encodeURIComponent(order.id)}/resena`}
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-control bg-crimson px-5 py-2 text-sm font-semibold text-white outline-none hover:bg-crimson-hover focus-visible:shadow-focus"
        >
          Calificar
        </Link>
      )}
    </article>
  );
}

export default async function MisPedidosPage({ searchParams }: MisPedidosPageProps) {
  const params = await searchParams;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const status = isOrderStatus(rawStatus) ? rawStatus : undefined;
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);

  if (!token || !user) redirect("/login");
  if (user.rol !== "CLIENT") return <AccesoDenegado href="/menu" />;

  let orders: CustomerOrder[];
  try {
    orders = await getMyOrders(token, status);
  } catch (error) {
    if (error instanceof ReviewApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof ReviewApiError && error.status === 403) {
      return <AccesoDenegado href="/menu" />;
    }

    return (
      <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6 md:px-8">
        <PageHeading />
        <Alerta>
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar tus pedidos. Intenta de nuevo."}
        </Alerta>
        <Link
          href={status ? `/pedidos?status=${status}` : "/pedidos"}
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-control border-2 border-orange px-6 py-3 text-base font-semibold text-brown outline-none hover:border-orange-hover hover:bg-orange/16 focus-visible:shadow-focus"
        >
          Reintentar
        </Link>
      </main>
    );
  }

  const branchIds = [...new Set(orders.map((order) => order.branchId))];
  const ratingEntries = await Promise.all(branchIds.map(async (branchId) => {
    try {
      const rating = await getBranchRating(branchId);
      return [branchId, rating] as const;
    } catch (error) {
      const message = error instanceof ReviewApiError && error.status === 404
        ? "Sucursal no encontrada."
        : "No se pudo cargar el promedio.";
      return [branchId, { error: message }] as const;
    }
  }));
  const ratingsByBranch = new Map<string, RatingState>(ratingEntries);

  return (
    <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <PageHeading />

      <form action="/pedidos" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex w-full max-w-sm flex-col gap-2">
          <label htmlFor="status" className="text-sm font-semibold text-brown">
            Filtrar por estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="min-h-11 rounded-control border border-border bg-white px-3 text-base text-brown outline-none focus-visible:shadow-focus"
          >
            <option value="">Todos los pedidos</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <Button type="submit">Aplicar filtro</Button>
      </form>

      {orders.length === 0 ? (
        <EstadoVacio
          titulo={status ? "No hay pedidos con este estado" : "Todavía no tienes pedidos"}
          mensaje={status
            ? "Prueba con otro estado para consultar tus pedidos."
            : "Cuando realices un pedido, aparecerá aquí."}
        />
      ) : (
        <section aria-label="Lista de pedidos" className="grid gap-4 lg:grid-cols-2">
          {orders.map((order) => (
            <PedidoCard
              key={order.id}
              order={order}
              ratingState={ratingsByBranch.get(order.branchId) ?? { error: "No se pudo cargar el promedio." }}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function PageHeading() {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-display text-h2 font-bold uppercase text-brown">Mis pedidos</h1>
      <p className="text-sm text-text-secondary">Consulta el estado y el detalle de tus pedidos.</p>
    </header>
  );
}
