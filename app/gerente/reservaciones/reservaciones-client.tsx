"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  CalendarCheck,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ReservationItem } from "@/lib/api/reservations";
import {
  cancelReservationAction,
  getBranchReservationsAction,
} from "./actions";

type ReservacionesClientProps = {
  branchId: string;
  initialDate: string;
  initialResult: Awaited<ReturnType<typeof getBranchReservationsAction>>;
  timeZone: string;
  branches: { id: string; name: string }[];
};

// Genera franjas horarias de 12:00 a 20:00
const FRANJAS_HORARIAS = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function extraerHora(iso: string, timeZone: string): string {
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return iso;
    return d.toLocaleTimeString("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    });
  } catch {
    return iso;
  }
}

export function ReservacionesClient({
  branchId,
  initialDate,
  initialResult,
  timeZone,
  branches,
}: ReservacionesClientProps) {
  const router = useRouter();
  const [fecha, setFecha] = useState<string>(initialDate);
  const [reservaciones, setReservaciones] = useState<ReservationItem[]>(initialResult.ok ? initialResult.reservations : []);
  const [totalMesas, setTotalMesas] = useState(initialResult.ok ? initialResult.totalMesas : 0);
  const [isLoading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(initialResult.ok ? null : initialResult.message);

  // Modal de cancelación
  const [reservaACancelar, setReservaACancelar] = useState<ReservationItem | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Cambio de fecha
  const handleFechaChange = (nuevaFecha: string) => {
    setFecha(nuevaFecha);
    setError(null);

    startTransition(async () => {
      const result = await getBranchReservationsAction(branchId, nuevaFecha);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setReservaciones(result.reservations);
      setTotalMesas(result.totalMesas);
    });
  };

  const handleReintentar = () => {
    handleFechaChange(fecha);
  };

  // Cálculo dinámico de ocupación por franja
  const ocupacionPorFranja = useMemo(() => {
    return FRANJAS_HORARIAS.map((franja) => {
      const [fHora, fMin] = franja.split(":").map(Number);
      const franjaMinutos = fHora * 60 + fMin;

      // Una reservación dura 90 min. Ocupa la franja si su intervalo se cruza con [franjaMinutos, franjaMinutos + 60)
      const activas = reservaciones.filter((r) => {
        if (r.status !== "CONFIRMED" && r.status !== "PENDING") return false;
        const dateFormat = new Intl.DateTimeFormat("en-CA", { timeZone });
        const toMinutes = (iso: string) => {
          const day = dateFormat.format(new Date(iso));
          if (day < fecha) return -1440;
          if (day > fecha) return 1440;
          const [hours, minutes] = extraerHora(iso, timeZone).split(":").map(Number);
          return hours * 60 + minutes;
        };
        return toMinutes(r.startsAt) < franjaMinutos + 60 && toMinutes(r.endsAt) > franjaMinutos;
      });

      const ocupadas = new Set(activas.map((reserva) => reserva.tableId)).size;
      const libres = Math.max(0, totalMesas - ocupadas);

      return {
        franja,
        ocupadas,
        libres,
      };
    });
  }, [reservaciones, totalMesas, fecha, timeZone]);

  // Cancelar reservación
  const handleConfirmarCancelacion = async () => {
    if (!reservaACancelar) return;

    setIsCancelling(true);
    setCancelError(null);

    try {
      const result = await cancelReservationAction(reservaACancelar.id);
      if (!result.ok) {
        setCancelError(result.message);
        return;
      }

      // Actualizar el estado en la lista local para reflejar CANCELLED
      setReservaciones((prev) =>
        prev.map((r) =>
          r.id === result.id ? { ...r, status: result.status } : r,
        ),
      );
      setReservaACancelar(null);
    } catch {
      setCancelError("No se pudo cancelar la reservación. Intenta de nuevo.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
      {/* Encabezado y Selector de Fecha */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-h2 font-bold uppercase text-brown">
            Reservaciones
          </h1>
          <p className="text-sm text-text-secondary">
            Consulta y cancela las reservaciones de tu sucursal.
          </p>
        </div>

        {branches.length > 0 && (
          <label className="flex flex-col gap-1 text-xs font-semibold text-text-secondary">
            Sucursal
            <select className="min-h-11 rounded-control border border-border bg-white px-3 text-sm text-brown"
              value={branchId} onChange={(event) => router.push(`?sucursal=${encodeURIComponent(event.target.value)}`)}>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </label>
        )}
        {/* Filtro Fecha */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-fecha" className="text-xs font-semibold text-text-secondary">
            Fecha
          </label>
          <div className="relative flex items-center">
            <CalendarIcon
              aria-hidden
              className="pointer-events-none absolute left-3 size-4 text-brown"
            />
            <input
              id="filtro-fecha"
              type="date"
              value={fecha}
              onChange={(e) => handleFechaChange(e.target.value)}
              disabled={isLoading}
              className="min-h-11 rounded-control border border-border bg-white pl-10 pr-3 py-2 text-sm text-brown outline-none transition-colors focus-visible:shadow-focus"
            />
          </div>
        </div>
      </header>

      {/* Estado de Error (Fidelidad exacta a Error.png) */}
      {error ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex size-20 items-center justify-center rounded-card bg-cream text-brown border border-border">
            <AlertCircle aria-hidden className="size-10 text-brown" />
          </div>
          <p className="text-base font-semibold text-brown">
            No se pudo completar la operación. Intenta de nuevo
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReintentar}
            className="mt-2"
          >
            <RotateCw aria-hidden className="size-4" />
            Reintentar
          </Button>
        </div>
      ) : reservaciones.length === 0 && !isLoading ? (
        /* Estado Vacío (Fidelidad exacta a Vacío.png) */
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="relative size-28">
            <Image
              src="/brand/Logo/Mascota.jpeg"
              alt=""
              fill
              sizes="112px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
              No hay reservaciones para esta fecha
            </h2>
            <p className="text-sm text-text-secondary">
              Cambia la fecha o vuelve más tarde.
            </p>
          </div>
        </div>
      ) : (
        /* Estado Con Resultados (Fidelidad a Con reservaciones.png) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Tabla de reservaciones */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="overflow-x-auto rounded-card border border-border bg-white shadow-sm">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border bg-white text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    <th scope="col" className="px-4 py-3.5">
                      Identificador
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Cliente
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Hora
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Personas
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-center">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {reservaciones.map((reserva) => {
                    const horaFormateada = extraerHora(reserva.startsAt, timeZone);
                    const cancelable = reserva.status === "CONFIRMED" || reserva.status === "PENDING";

                    return (
                      <tr
                        key={reserva.id}
                        className="transition-colors hover:bg-background/80"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-brown">
                          {reserva.alias}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-brown">
                          {reserva.contactName}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-brown">
                          {horaFormateada}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-brown">
                          {reserva.guests}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {cancelable ? (
                            <button
                              type="button"
                              onClick={() => {
                                setReservaACancelar(reserva);
                                setCancelError(null);
                              }}
                              title="Cancelar reservación"
                              aria-label={`Cancelar reservación ${reserva.alias}`}
                              className="inline-flex size-9 items-center justify-center rounded-full bg-success/12 text-success hover:bg-success/20 transition-colors outline-none focus-visible:shadow-focus"
                            >
                              <CalendarCheck aria-hidden className="size-5" />
                            </button>
                          ) : (
                            <span
                              title={reserva.status === "CANCELED" ? "Reservación cancelada" : "Reservación finalizada"}
                              aria-label={reserva.status === "CANCELED" ? "Reservación cancelada" : "Reservación finalizada"}
                              className="inline-flex size-9 items-center justify-center rounded-full bg-danger/12 text-danger"
                            >
                              <CalendarX aria-hidden className="size-5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Paginación */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-text-secondary">
                <span>
                  Mostrando 1-{reservaciones.length} de {reservaciones.length} reservaciones
                </span>

                <div className="flex items-center gap-1.5" aria-label="Paginación">
                  <button
                    type="button"
                    disabled
                    aria-label="Página anterior"
                    className="inline-flex size-9 items-center justify-center rounded-control border border-border text-neutral opacity-50 cursor-not-allowed outline-none"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <span
                    aria-current="page"
                    className="inline-flex size-9 items-center justify-center rounded-control bg-crimson font-bold text-white shadow-sm"
                  >
                    1
                  </span>

                  <button
                    type="button"
                    disabled
                    aria-label="Página siguiente"
                    className="inline-flex size-9 items-center justify-center rounded-control border border-border text-neutral opacity-50 cursor-not-allowed outline-none"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Ocupación por franja */}
          <aside
            aria-label="Ocupación por franja horaria"
            className="lg:col-span-4 flex flex-col gap-3 rounded-card border border-border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-0.5 border-b border-border pb-3">
              <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
                Ocupación por franja
              </h2>
              <p className="text-xs text-text-secondary">
                Franjas de 1 h · reservaciones de 90 min · {totalMesas} mesas
              </p>
            </div>

            <div className="flex flex-col divide-y divide-border/60">
              {ocupacionPorFranja.map(({ franja, ocupadas, libres }) => (
                <div
                  key={franja}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="font-medium text-brown">{franja}</span>
                  <span className="text-text-secondary">
                    {ocupadas} ocupadas · {libres} libres
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Modal de Cancelación (Fidelidad exacta a Cancelar · Confirmación.png) */}
      {reservaACancelar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-cancelar-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-card border-2 border-brown bg-white p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2
                id="modal-cancelar-titulo"
                className="font-display text-h3 font-bold uppercase text-brown"
              >
                ¿Cancelar la reservación?
              </h2>
              <button
                type="button"
                onClick={() => setReservaACancelar(null)}
                aria-label="Cerrar modal"
                className="rounded-control p-1 text-text-secondary hover:text-brown outline-none focus-visible:shadow-focus"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-brown">
              La reservación{" "}
              <strong className="text-brown">
                {reservaACancelar.alias}
              </strong>{" "}
              de <strong className="text-brown">{reservaACancelar.contactName}</strong> (
              {extraerHora(reservaACancelar.startsAt, timeZone)} · {reservaACancelar.guests} personas)
              quedará «Cancelada» y su horario se liberará. Esta
              acción no se puede deshacer.
            </p>

            {cancelError && (
              <p role="alert" className="text-sm font-semibold text-danger">{cancelError}</p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isCancelling}
                onClick={() => setReservaACancelar(null)}
                className="flex-1 sm:flex-none"
              >
                Volver
              </Button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmarReservaCancelacion}
                className="inline-flex min-h-11 flex-1 sm:flex-none items-center justify-center rounded-control border-2 border-crimson px-5 py-2.5 text-base font-semibold text-crimson hover:bg-crimson hover:text-white transition-colors outline-none focus-visible:shadow-focus disabled:opacity-50"
              >
                {isCancelling ? "Cancelando…" : "Cancelar reservación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleConfirmarReservaCancelacion() {
    handleConfirmarCancelacion();
  }
}
