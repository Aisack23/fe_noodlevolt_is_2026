"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alerta } from "@/components/ui/Alerta";
import { CantidadStepper } from "@/components/ui/CantidadStepper";
import { Input } from "@/components/ui/Input";
import type { Branch } from "@/lib/api/branches";
import type { DiningTableResponseDto, ReservationResponseDto } from "@/lib/api/reservations";
import type { SafeSessionUser } from "@/lib/session";
import { bookReservation, searchTables } from "./actions";

type ReservarMesaClientProps = {
  branches: Branch[];
  initialBranchId?: string;
  user: SafeSessionUser | null;
};

const HORAS_DISPONIBLES = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];

function getFechaManana(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export function ReservarMesaClient({
  branches,
  initialBranchId,
  user,
}: ReservarMesaClientProps) {
  const router = useRouter();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    initialBranchId || (branches[0]?.id ?? ""),
  );
  const [fecha, setFecha] = useState<string>(getFechaManana());
  const [hora, setHora] = useState<string>("19:00");
  const [personas, setPersonas] = useState<number>(4);

  // Estados de búsqueda y resultados
  const [haBuscado, setHaBuscado] = useState<boolean>(false);
  const [mesasDisponibles, setMesasDisponibles] = useState<DiningTableResponseDto[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [searchError, setSearchError] = useState<string | null>(null);

  // Modal de confirmación de reserva
  const [mesaSeleccionada, setMesaSeleccionada] = useState<{
    id?: string;
    number: string;
    capacity: number;
  } | null>(null);
  const [nombreContacto, setNombreContacto] = useState<string>(user?.nombre || "");
  const [telefonoContacto, setTelefonoContacto] = useState<string>("+503 7000-0000");
  const [isBooking, setIsBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reservaConfirmada, setReservaConfirmada] = useState<ReservationResponseDto | null>(null);

  const selectedBranch = branches.find((b) => b.id === selectedBranchId);

  const handleBuscarMesas = () => {
    setSearchError(null);
    setReservaConfirmada(null);
    setHaBuscado(true);

    startSearchTransition(async () => {
      try {
        const result = await searchTables(selectedBranchId, personas);
        if (result.ok && result.tables.length > 0) {
          setMesasDisponibles(result.tables);
        } else {
          setMesasDisponibles([]);
        }
      } catch {
        setSearchError("No fue posible consultar las mesas. Intenta de nuevo.");
      }
    });
  };

  const handleIniciarReserva = (mesa: { id?: string; number: string; capacity: number }) => {
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent("/reservas")}`);
      return;
    }
    setMesaSeleccionada(mesa);
    setBookingError(null);
  };

  const handleConfirmarReserva = async () => {
    if (!selectedBranchId) {
      setBookingError("Selecciona una sucursal.");
      return;
    }
    if (!nombreContacto.trim()) {
      setBookingError("Ingresa tu nombre para la reservación.");
      return;
    }
    if (!telefonoContacto.trim()) {
      setBookingError("Ingresa tu teléfono de contacto.");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Construir timestamp ISO 8601 con offset local de El Salvador (-06:00)
      const startsAt = `${fecha}T${hora}:00-06:00`;

      const result = await bookReservation({
        branchId: selectedBranchId,
        startsAt,
        guests: personas,
        contactName: nombreContacto.trim(),
        phone: telefonoContacto.trim(),
      });

      if (!result.ok) {
        if (result.kind === "unauthenticated") {
          router.push(`/login?returnTo=${encodeURIComponent("/reservas")}`);
          return;
        }
        if (result.kind === "conflict") {
          // Reflejar estado sin mesas disponibles para ese horario
          setMesasDisponibles([]);
          setMesaSeleccionada(null);
          setSearchError(result.message);
          return;
        }
        setBookingError(result.message);
        return;
      }

      setReservaConfirmada(result.reservation);
      setMesaSeleccionada(null);
    } catch {
      setBookingError("Ocurrió un error inesperado al procesar tu reservación.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-4 py-8 sm:py-12">
      {/* Encabezado */}
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-h1 font-bold uppercase tracking-wide text-brown">
          Reservar mesa
        </h1>
        <p className="text-base text-text-secondary">
          Elige sucursal, fecha, hora y personas. Cada reservación dura 90 minutos.
        </p>
      </header>

      {/* Formulario de Parámetros de Reserva */}
      <section
        aria-label="Formulario de reservación"
        className="flex flex-col gap-6"
      >
        {/* Sucursal */}
        <div className="flex flex-col gap-2">
          <label htmlFor="sucursal" className="text-sm font-semibold text-brown">
            Sucursal
          </label>
          <div className="relative">
            <select
              id="sucursal"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="min-h-11 w-full appearance-none rounded-control border border-border bg-white px-4 py-2.5 text-base text-brown outline-none transition-colors focus-visible:shadow-focus"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {!b.isOpen && "(Cerrada)"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex flex-col gap-2">
          <label htmlFor="fecha" className="text-sm font-semibold text-brown">
            Fecha
          </label>
          <div className="relative flex items-center">
            <CalendarIcon
              aria-hidden
              className="pointer-events-none absolute left-4 size-5 text-brown"
            />
            <input
              id="fecha"
              type="date"
              value={fecha}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFecha(e.target.value)}
              className="min-h-11 w-full rounded-control border border-border bg-white pl-12 pr-4 py-2.5 text-base text-brown outline-none transition-colors focus-visible:shadow-focus"
            />
          </div>
        </div>

        {/* Hora */}
        <div className="flex flex-col gap-2">
          <label htmlFor="hora" className="text-sm font-semibold text-brown">
            Hora
          </label>
          <div className="relative">
            <select
              id="hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="min-h-11 w-full appearance-none rounded-control border border-border bg-white px-4 py-2.5 text-base text-brown outline-none transition-colors focus-visible:shadow-focus"
            >
              {HORAS_DISPONIBLES.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Personas */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-brown">Personas</label>
          <div>
            <CantidadStepper
              cantidad={personas}
              min={1}
              max={20}
              onIncrementar={() => setPersonas((prev) => Math.min(20, prev + 1))}
              onDisminuir={() => setPersonas((prev) => Math.max(1, prev - 1))}
              ariaLabel="Cantidad de personas"
            />
          </div>
        </div>

        {/* Botón Buscar mesas */}
        <Button
          type="button"
          variant="primary"
          loading={isSearching}
          loadingText="Buscando mesas…"
          onClick={handleBuscarMesas}
          className="w-full text-base py-3"
        >
          Buscar mesas
        </Button>
      </section>

      {/* Alerta de Error de búsqueda */}
      {searchError && (
        <Alerta tono="danger" className="text-sm">
          {searchError}
        </Alerta>
      )}

      {/* Confirmación de Reservación Exitosa */}
      {reservaConfirmada && (
        <div className="rounded-card border-2 border-success/40 bg-success/6 p-6 flex flex-col gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-success/12 text-success">
              <CheckCircle className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-h3 font-bold uppercase text-brown">
                ¡Reservación confirmada!
              </h2>
              <p className="text-sm text-text-secondary">
                Tu mesa ha sido reservada con éxito.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-control bg-white p-4 border border-border text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-crimson" />
              <span className="text-brown font-medium">
                {selectedBranch?.name ?? "Sucursal"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-orange" />
              <span className="text-brown font-medium">
                {fecha} a las {hora}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-brown" />
              <span className="text-brown font-medium">{personas} personas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">ID:</span>
              <span className="font-mono text-xs font-semibold text-brown truncate">
                {reservaConfirmada.id}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/pedidos"
              className="flex-1 inline-flex min-h-11 items-center justify-center rounded-control bg-crimson px-5 py-2.5 text-sm font-semibold text-white outline-none hover:bg-crimson-hover focus-visible:shadow-focus"
            >
              Ver mis pedidos
            </Link>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setReservaConfirmada(null);
                setHaBuscado(false);
              }}
              className="flex-1"
            >
              Nueva reservación
            </Button>
          </div>
        </div>
      )}

      {/* Resultados de Mesas Disponibles */}
      {haBuscado && !reservaConfirmada && (
        <section aria-label="Resultados de búsqueda" className="flex flex-col gap-4">
          {mesasDisponibles.length > 0 ? (
            <>
              <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
                Mesas disponibles
              </h2>

              <div className="flex flex-col gap-3">
                {mesasDisponibles.map((mesa) => (
                  <article
                    key={mesa.id}
                    className="flex flex-col gap-3 rounded-card border border-border bg-white p-5 shadow-sm"
                  >
                    <span className="text-base font-semibold text-brown">
                      Mesa {mesa.number} · capacidad {mesa.capacity}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleIniciarReserva(mesa)}
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-control border-2 border-orange px-6 py-2.5 text-base font-semibold text-brown outline-none transition-colors hover:border-orange-hover hover:bg-orange/16 focus-visible:shadow-focus"
                    >
                      Reservar
                    </button>
                  </article>
                ))}
              </div>
            </>
          ) : (
            /* Estado Sin Mesas Disponibles (Fidelidad exacta a Sin mesas.png) */
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="relative size-24">
                <Image
                  src="/brand/Logo/Mascota.jpeg"
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
                  No hay mesas disponibles para ese horario
                </h2>
                <p className="text-sm text-text-secondary">
                  Prueba otra hora o cambia la cantidad de personas.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Modal de Confirmación de Datos para la Reserva */}
      {mesaSeleccionada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-reserva-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-card border-2 border-brown bg-white p-6 shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2
                id="modal-reserva-titulo"
                className="font-display text-h3 font-bold uppercase text-brown"
              >
                Confirmar reservación
              </h2>
              <button
                type="button"
                onClick={() => setMesaSeleccionada(null)}
                aria-label="Cerrar modal"
                className="rounded-control p-1 text-text-secondary hover:text-brown outline-none focus-visible:shadow-focus"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="text-sm text-text-secondary">
              Mesa {mesaSeleccionada.number} ({mesaSeleccionada.capacity} personas) en{" "}
              <strong className="text-brown">{selectedBranch?.name}</strong> el{" "}
              <strong className="text-brown">{fecha}</strong> a las{" "}
              <strong className="text-brown">{hora}</strong>.
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Nombre de contacto"
                value={nombreContacto}
                onChange={(e) => setNombreContacto(e.target.value)}
                placeholder="Ingresa tu nombre completo"
                disabled={isBooking}
              />

              <Input
                label="Teléfono de contacto"
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value)}
                placeholder="+503 7000-0000"
                disabled={isBooking}
              />
            </div>

            {bookingError && (
              <Alerta tono="danger" className="text-sm">
                {bookingError}
              </Alerta>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={isBooking}
                onClick={() => setMesaSeleccionada(null)}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                type="button"
                variant="primary"
                loading={isBooking}
                loadingText="Reservando…"
                onClick={handleConfirmarReserva}
                className="flex-1"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
