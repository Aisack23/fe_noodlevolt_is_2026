"use client";

import type { NotificationItem } from "@/lib/api/notifications";
import { useNotifications } from "@/lib/hooks/useNotifications";
import NotificacionesContenido from "@/components/business/NotificacionesContenido";

type Props = {
  initialNotifications: NotificationItem[];
};

export default function NotificacionesClient({ initialNotifications }: Props) {
  const { items, status, retry } = useNotifications(true);

  // Mientras llega la primera consulta del hook, se muestran los avisos que ya trajo el servidor.
  const showInitial = status === "loading" && initialNotifications.length > 0;

  return (
    <section aria-labelledby="titulo-notificaciones">
      <h1
        id="titulo-notificaciones"
        className="mb-4 font-display text-h3 uppercase text-brown"
      >
        Notificaciones
      </h1>
      <NotificacionesContenido
        items={showInitial ? initialNotifications : items}
        status={showInitial ? "success" : status}
        onRetry={retry}
      />
    </section>
  );
}