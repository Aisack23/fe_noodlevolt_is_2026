"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import NotificacionesContenido from "@/components/business/NotificacionesContenido";

export default function Campana() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Solo consulta (y sondea cada 15 s) mientras el panel está abierto.
  const { items, status, retry } = useNotifications(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
        aria-controls="panel-notificaciones"
        className="flex items-center justify-center rounded-full p-2 text-brown transition-colors hover:bg-cream"
      >
        <Bell className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          id="panel-notificaciones"
          role="region"
          aria-label="Notificaciones"
          className="fixed inset-x-2 top-[72px] z-50 overflow-hidden rounded-card border border-border bg-white md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-3 md:w-[400px]"
        >
          <h2 className="px-6 pb-2 pt-6 font-display text-h3 uppercase text-brown">
            Notificaciones
          </h2>
          <div className="max-h-[70vh] overflow-y-auto px-6 pb-4">
            <NotificacionesContenido items={items} status={status} onRetry={retry} />
          </div>
        </div>
      )}
    </div>
  );
}