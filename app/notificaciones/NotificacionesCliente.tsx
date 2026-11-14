"use client";

import type { NotificationItem } from "@/lib/api/notifications";
import { useNotifications } from "@/lib/hooks/useNotifications";
import NotificacionesContenido from "@/components/business/NotificacionesContenido";

type Props = {
  initialNotifications: NotificationItem[];
};

export default function NotificacionesClient({ initialNotifications }: Props) {
  const { items, unreadCount, status, retry } = useNotifications(true);

  // Mientras llega la primera consulta del hook, se muestran los avisos que ya trajo el servidor.
  const showInitial = status === "loading" && initialNotifications.length > 0;
  const unread = showInitial
    ? initialNotifications.filter((n) => !n.isRead).length
    : unreadCount;

  return (
    <section aria-labelledby="titulo-notificaciones">
      <div className="mb-4 flex items-baseline justify-between">
        <h1
          id="titulo-notificaciones"
          className="font-display text-h3 font-bold uppercase text-brown"
        >
          Notificaciones
        </h1>
        {unread > 0 && (
          <span className="text-sm text-text-secondary">{unread} sin leer</span>
        )}
      </div>
      <NotificacionesContenido
        items={showInitial ? initialNotifications : items}
        status={showInitial ? "success" : status}
        onRetry={retry}
      />
    </section>
  );
}