"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMyNotifications } from "@/lib/api/notifications-client";
import { NotificationApiError, type NotificationItem } from "@/lib/api/notifications";

export type NotificationsStatus =
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "unauthorized";

const POLL_MS = 15_000;

export function useNotifications(enabled = true) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [status, setStatus] = useState<NotificationsStatus>("loading");
  const stopped = useRef(false);

  const load = useCallback(async () => {
    try {
      const page = await fetchMyNotifications();

      setItems(page.items);
      setStatus(page.items.length === 0 ? "empty" : "success");
    } catch (error) {
      if (
        error instanceof NotificationApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        stopped.current = true;
        setStatus("unauthorized");
        return;
      }

      setStatus((prev) =>
        prev === "success" || prev === "empty" ? prev : "error"
      );
    }
  }, []);

  const retry = useCallback(() => {
    stopped.current = false;
    setStatus("loading");
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;

    stopped.current = false;

    const initialTimeout = setTimeout(() => {
      void load();
    }, 0);

    const id = setInterval(() => {
      if (
        !stopped.current &&
        document.visibilityState === "visible"
      ) {
        void load();
      }
    }, POLL_MS);

   
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(id);
    };
  }, [enabled, load]);

  return { items, status, retry };
}