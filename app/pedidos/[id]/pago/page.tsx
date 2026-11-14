import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { getSession, getSessionUser } from "@/lib/session";
import { PagoSimuladoClient } from "./pago-simulado-client";

export const metadata: Metadata = {
  title: "Pagar pedido · NoodleVolt",
  description: "Simula el pago en línea de tu pedido en NoodleVolt.",
};

type PagoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PagoPage({ params }: PagoPageProps) {
  const { id: orderId } = await params;
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);

  if (!token || !user) {
    redirect(`/login?returnTo=${encodeURIComponent(`/pedidos/${orderId}/pago`)}`);
  }

  if (user.rol !== "CLIENT") {
    return <AccesoDenegado href="/menu" />;
  }

  return (
    <main className="flex-1">
      <PagoSimuladoClient orderId={orderId} />
    </main>
  );
}
