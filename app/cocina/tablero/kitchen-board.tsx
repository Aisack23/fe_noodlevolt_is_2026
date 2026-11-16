"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell, Clock3, LogOut, RefreshCw } from "lucide-react";
import { CocinaTarjetaPedido } from "@/components/business/CocinaTarjetaPedido";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { Skeleton } from "@/components/ui/Skeleton";
import type { KitchenNextStatus, KitchenOrder } from "@/lib/api/kitchen";
import { logout } from "@/app/actions/auth";
import { advanceKitchenOrder, refreshKitchenOrders } from "./actions";

type KitchenBoardProps = {
  initialOrders: KitchenOrder[];
  initialError?: string;
  userName?: string;
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-SV", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/El_Salvador",
  }).format(date);
}

function LoadingBoard() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="rounded-card border border-border bg-white p-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="mt-4 h-5 w-2/3" />
          <Skeleton className="mt-8 h-24 w-full" />
          <Skeleton className="mt-4 h-11 w-full" />
        </div>
      ))}
    </div>
  );
}

export function KitchenBoard({ initialOrders, initialError, userName }: KitchenBoardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState(initialError ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    const result = await refreshKitchenOrders();
    if (result.ok) {
      setOrders(result.orders);
      setError(null);
      setUpdatedAt(new Date());
    } else {
      setError(result.message);
    }
    if (showLoading) setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function transition(orderId: string, status: KitchenNextStatus) {
    if (busyOrderId) return;
    setBusyOrderId(orderId);
    setError(null);
    const result = await advanceKitchenOrder(orderId, status);
    if (result.ok) {
      setOrders((current) => current.map((order) => (order.id === orderId ? result.order : order)));
      setUpdatedAt(new Date());
    } else {
      setError(result.message);
    }
    setBusyOrderId(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex min-h-[68px] flex-wrap items-center gap-x-5 gap-y-3 bg-brown px-4 py-3 text-white md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-control bg-white">
            <Image src="/brand/Logo/Mascota.jpeg" alt="NoodleVolt" fill sizes="44px" className="object-contain" />
          </div>
          <p className="font-display text-h3 font-bold uppercase leading-none">Cocina</p>
          <span className="text-sm font-semibold">· Sucursal asignada</span>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
          <span aria-live="polite" className="inline-flex items-center gap-2 whitespace-nowrap text-white/90">
            <RefreshCw aria-hidden className="size-4" /> Se actualiza cada 5 s · {formatTime(updatedAt)}
          </span>
          <span className="inline-flex items-center gap-2 whitespace-nowrap font-semibold">
            <Bell aria-hidden className="size-5" /> {userName ?? "Cocina"}
          </span>
          <form action={logout}>
            <button type="submit" aria-label="Cerrar sesión" className="inline-flex size-11 items-center justify-center rounded-control outline-none hover:bg-white/10 focus-visible:shadow-focus">
              <LogOut aria-hidden className="size-5" />
            </button>
          </form>
        </div>
      </header>

      <main className="px-4 py-6 md:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-h2 font-bold uppercase text-brown">Pedidos activos</h1>
            <p className="mt-1 text-sm text-text-secondary">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"} · del más antiguo al más reciente</p>
          </div>
          <Link href="/menu" className="inline-flex min-h-11 items-center justify-center rounded-control border-2 border-orange px-6 py-3 text-base font-semibold text-brown outline-none hover:bg-orange/16 focus-visible:shadow-focus">Ver menú</Link>
        </div>

        {error && (
          <Alerta tono="danger" className="mb-5">
            {error}
          </Alerta>
        )}
        {isLoading ? (
          <LoadingBoard />
        ) : orders.length > 0 ? (
          <section aria-label="Pedidos activos" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {orders.map((order) => <CocinaTarjetaPedido key={order.id} order={order} busy={busyOrderId === order.id} onTransition={transition} />)}
          </section>
        ) : (
          <EstadoVacio titulo="No hay pedidos pendientes" mensaje="Los pedidos nuevos aparecen aquí en máximo 5 segundos." />
        )}

        {error && orders.length === 0 && (
          <div className="mt-4 flex justify-center"><Button variant="secondary" onClick={() => void refresh(true)}><Clock3 aria-hidden className="size-5" />Reintentar</Button></div>
        )}
      </main>
    </div>
  );
}

export function KitchenAccessDenied() {
  return <div className="min-h-screen bg-background"><AccesoDenegado href="/menu" /></div>;
}
