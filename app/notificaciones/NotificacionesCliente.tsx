'use client';

import React, { useEffect, useState } from 'react';
import { NotificationItem } from '@/lib/api/notifications';
import { Bell, Clock } from 'lucide-react';

interface Props {
  initialNotifications: NotificationItem[];
}

export default function NotificacionesClient({ initialNotifications }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  useEffect(() => {
    const fetchNotis = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/notifications/me`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(Array.isArray(data) ? data : (data.data || []));
        }
      } catch (err) {
        console.error('Error en polling de notificaciones', err);
      }
    };

    // Sondeo cada 15 segundos (Requisito FE-09)
    const interval = setInterval(fetchNotis, 15000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-24 h-24 bg-[#F7EBD9] rounded-2xl mx-auto flex items-center justify-center border-2 border-[#E8DED3]">
          <Bell className="w-10 h-10 text-[#D86B2C]" />
        </div>
        <h2 className="text-xl font-bold font-display text-[#2C1810]">
          NO TIENES NOTIFICACIONES
        </h2>
        <p className="text-[#6B5E55] max-w-sm mx-auto text-sm">
          Cuando haya novedades sobre tus pedidos o puntos, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#E8DED3] pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-wide font-display text-[#2C1810]">
          NOTIFICACIONES
        </h1>
        <span className="text-sm text-[#6B5E55] font-medium">
          {unreadCount} sin leer
        </span>
      </div>

      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-xl border transition-all ${
            notif.isRead
              ? 'bg-white border-[#E8DED3]'
              : 'bg-[#F7EBD9]/60 border-[#D86B2C]/40 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#2C1810] text-base">{notif.title}</h3>
              <p className="text-[#6B5E55] text-sm mt-1">{notif.message}</p>
            </div>
            <span className="text-xs text-[#6B5E55] whitespace-nowrap flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date(notif.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}