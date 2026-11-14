"use client";

import Image from "next/image";
import Link from "next/link";
import type { NotificationItem } from "@/lib/api/notifications";
import type { NotificationsStatus } from "@/lib/hooks/useNotifications";
import { formatRelativeTime } from "@/lib/format-relative-time";

type Props = {
  items: NotificationItem[];
  status: NotificationsStatus;
  onRetry: () => void;
};

export default function NotificacionesContenido({ items, status, onRetry }: Props) {
  if (status === "loading") {
    return (
      <div className="animate-pulse" aria-busy="true" aria-label="Cargando notificaciones">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-border py-4 last:border-b-0">
            <div className="h-4 w-3/5 rounded-full bg-cream" />
            <div className="mt-2 h-3 w-4/5 rounded-full bg-cream" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" className="-mx-6 -mb-4 space-y-3 bg-danger/10 p-5">
        <p className="text-sm text-danger">
          No se pudo completar la operación. Intenta de nuevo
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-control border-2 border-orange px-4 py-2.5 font-semibold text-brown transition-colors hover:bg-cream"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div role="alert" className="space-y-2 py-6 text-center">
        <p className="text-sm text-text-secondary">
          Tu sesión no es válida o expiró. Inicia sesión de nuevo para ver tus notificaciones.
        </p>
        <Link href="/login" className="font-semibold text-crimson hover:text-crimson-hover">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex flex-col items-center px-2 pb-6 pt-2 text-center">
        <div className="mb-4 flex h-[120px] w-[120px] items-center justify-center rounded-card bg-background">
          <Image
            src="/brand/Logo/Mascota.jpeg"
            alt=""
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
        <h3 className="mb-2 font-display text-xl uppercase text-brown">
          No tienes notificaciones
        </h3>
        <p className="max-w-[260px] text-sm text-text-secondary">
          Cuando haya novedades sobre tus pedidos o puntos, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <ul className="-mx-6 -mb-4">
      {items.map((item) => (
        <li
          key={item.id}
          className={`px-6 py-5 ${item.isRead ? "bg-white" : "bg-cream"}`}
        >
          <h3 className="text-base font-semibold leading-6 text-brown">
            {item.title}
          </h3>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {item.message}
          </p>
          <time
            dateTime={item.createdAt}
            suppressHydrationWarning
            className="mt-1 block text-sm leading-5 text-text-secondary"
          >
            {formatRelativeTime(item.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}