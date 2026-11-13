import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyNotifications, NotificationApiError } from "@/lib/api/notifications";
import { getSession } from "@/lib/session";
import NotificacionesClient from "./NotificacionesCliente";

export const metadata: Metadata = {
  title: "Notificaciones",
};

export default async function NotificacionesPage() {
  const token = await getSession();
  if (!token) {
    redirect("/login");
  }

  let notifications;
  try {
    notifications = await getMyNotifications(token);
  } catch (error) {
    if (error instanceof NotificationApiError && error.status === 401) {
      redirect("/login");
    }
    // Cualquier otro fallo lo muestra error.tsx, con «Reintentar».
    throw error;
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-card border border-border bg-white p-6">
      <NotificacionesClient initialNotifications={notifications.items} />
      </div>
    </main>
  );
}