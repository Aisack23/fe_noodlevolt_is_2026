"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import NotificacionesContenido from "@/components/business/NotificacionesContenido";

export default function Campana() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Consulta siempre (cada 15 s con la pestaña visible) para mantener el número al día.
  const { items, unreadCount, status, retry, markAsRead } = useNotifications(true);

  // Al cerrar el panel, los avisos que se estaban viendo pasan a leídos.
  const closePanel = useCallback(() => {
    setIsOpen(false);
    const unreadIds = items.filter((item) => !item.isRead).map((item) => item.id);
    void markAsRead(unreadIds);
  }, [items, markAsRead]);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closePanel();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closePanel();
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closePanel]);

  return (
    <div ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (isOpen ? closePanel() : setIsOpen(true))}
        aria-label={
          unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"
        }
        aria-expanded={isOpen}
        aria-controls="panel-notificaciones"
        className="relative flex items-center justify-center rounded-full p-2 text-brown transition-colors hover:bg-cream"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-crimson text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          id="panel-notificaciones"
          role="region"
          aria-label="Notificaciones"
          className="fixed inset-x-2 top-[72px] z-50 overflow-hidden rounded-card border border-border bg-white md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-[400px]"
        >
          <div className="flex items-baseline justify-between px-6 pb-4 pt-6">
            <h2 className="font-display text-h3 font-bold uppercase tracking-[0.01em] text-brown">
              Notificaciones
            </h2>
            {unreadCount > 0 && (
              <span className="text-sm text-text-secondary">{unreadCount} sin leer</span>
            )}
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-6 pb-4">
            <NotificacionesContenido items={items} status={status} onRetry={retry} />
          </div>
        </div>
      )}
    </div>
  );
}