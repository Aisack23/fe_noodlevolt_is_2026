import {
  NotificationApiError,
  type NotificationItem,
  type NotificationsPage,
} from "./notifications";

export async function fetchMyNotifications(): Promise<NotificationsPage> {
  const res = await fetch("/api/notifications", { cache: "no-store" });

  if (!res.ok) {
    throw new NotificationApiError(res.status);
  }

  return res.json();
}

export async function markMyNotificationRead(id: string): Promise<NotificationItem> {
  const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: "PATCH",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new NotificationApiError(res.status);
  }

  return res.json();
}