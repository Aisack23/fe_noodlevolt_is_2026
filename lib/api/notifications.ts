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
  total: number;
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
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const url = new URL("notifications/me", apiUrl.replace(/\/?$/, "/"));
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