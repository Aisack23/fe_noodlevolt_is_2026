import { NotificationApiError, type NotificationsPage } from "./notifications";

export async function fetchMyNotifications(): Promise<NotificationsPage> {
  const res = await fetch("/api/notifications", { cache: "no-store" });

  if (!res.ok) {
    throw new NotificationApiError(res.status);
  }

  return res.json();
}