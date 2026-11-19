import { getApiBaseUrl } from "./base-url.ts";
export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  orderId: string | null;
  isRead: boolean;
  createdAt: string; 
};

export type NotificationsPage = {
  items: NotificationItem[];
  total: number; // avisos del buzón completo, leídos y no leídos
  unreadCount: number; 
  page: number;
  limit: number;
};

export class NotificationApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Las notificaciones respondieron ${status}`);
    this.status = status;
  }
}



export async function getMyNotifications(token: string): Promise<NotificationsPage> {
  const url = new URL("notifications/me", getApiBaseUrl());
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", "20");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new NotificationApiError(res.status);
  }

  return (await res.json()) as NotificationsPage;
}

// SERVIDOR: marca un aviso propio como leído (idempotente).
export async function markNotificationRead(
  token: string,
  id: string,
): Promise<NotificationItem> {
  const url = new URL(`notifications/${encodeURIComponent(id)}/read`, getApiBaseUrl());

  const res = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new NotificationApiError(res.status);
  }

  return (await res.json()) as NotificationItem;
}