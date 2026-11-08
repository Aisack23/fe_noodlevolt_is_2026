import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RatingStars } from "@/components/business/RatingStars";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { ReviewSubmission } from "@/app/pedidos/ReviewSubmission";
import {
  getMyOrders,
  ReviewApiError,
  type CustomerOrder,
} from "@/lib/api/reviews";
import { mapearEstadoPedidoABadge } from "@/lib/orders/types";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calificar pedido" };

type ReviewPageProps = { params: Promise<{ id: string }> };

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-SV", { dateStyle: "medium" }).format(date);
}

export default async function ResenaPedidoPage({ params }: ReviewPageProps) {
  const [{ id }, token, user] = await Promise.all([
    params,
    getSession(),
    getSessionUser(),
  ]);
  if (!token || !user) redirect("/login");
  if (user.rol !== "CLIENT") return <AccesoDenegado href="/menu" />;

  let orders: CustomerOrder[];
  try {
    orders = await getMyOrders(token);
  } catch (error) {
    if (error instanceof ReviewApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof ReviewApiError && error.status === 403) {
      return <AccesoDenegado href="/menu" />;
    }
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-8">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">Calificar pedido</h1>
        <Alerta>{error instanceof Error ? error.message : "No se pudo cargar el pedido."}</Alerta>
      </main>
    );
  }

  const order = orders.find((item) => item.id === id);
  if (!order) notFound();

  const canReview = order.status === "DELIVERED" && order.review === null;
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-2">
        <Link href="/pedidos" className="w-fit text-sm font-semibold text-crimson underline underline-offset-4 focus-visible:shadow-focus">
          Volver a mis pedidos
        </Link>
        <h1 className="font-display text-h2 font-bold uppercase text-brown">Calificar pedido</h1>
      </div>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-white p-5 shadow-sm sm:p-6" aria-labelledby="order-summary-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="order-summary-title" className="font-display text-h3 font-bold uppercase text-brown">
              Pedido {order.orderNumber}
            </h2>
            <p className="mt-1 text-sm font-semibold text-text-secondary">{order.branchName}</p>
            <p className="mt-1 text-sm text-text-secondary">{formatDate(order.createdAt)}</p>
          </div>
          <BadgeEstado estado={mapearEstadoPedidoABadge(order.status)} />
        </div>

        {order.review ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <span className="text-sm font-semibold text-brown">Tu calificación</span>
            <RatingStars value={order.review.rating} readOnly />
            <span className="text-sm text-text-secondary">{order.review.rating} de 5</span>
          </div>
        ) : null}
      </section>

      {canReview ? (
        <section className="flex flex-col gap-4 rounded-card border border-border bg-white p-5 shadow-sm sm:p-6" aria-labelledby="review-form-title">
          <div className="space-y-1">
            <h2 id="review-form-title" className="font-display text-h3 font-bold uppercase text-brown">
              Tu reseña
            </h2>
            <p className="text-sm text-text-secondary">Comparte tu experiencia con esta sucursal.</p>
          </div>
          <ReviewSubmission orderId={order.id} />
        </section>
      ) : order.review ? (
        <Alerta tono="info">Este pedido ya fue calificado. La calificación se muestra en solo lectura.</Alerta>
      ) : (
        <Alerta tono="info">El pedido ya fue calificado o aún no está entregado; no se puede calificar todavía.</Alerta>
      )}
    </main>
  );
}
