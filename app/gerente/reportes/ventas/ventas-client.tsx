"use client";

import { useState, useTransition, useId } from "react";
import { RotateCw, TrendingUp, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getSalesReportAction,
  type SalesReportActionResult,
} from "../actions";

type Sucursal = { id: string; name: string };

type VentasClientProps = {
  isGeneralManager: boolean;
  fixedBranchName: string | null;
  branches: Sucursal[];
};

type SalesReport = Extract<SalesReportActionResult, { ok: true }>["report"];

function getHoy(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getPrimerDiaMes(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatMoneda(valor: string): string {
  const num = parseFloat(valor);
  if (Number.isNaN(num)) return valor;
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(num);
}

function formatFecha(fecha: string): string {
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

export function VentasClient({
  isGeneralManager,
  fixedBranchName,
  branches,
}: VentasClientProps) {
  const fromId = useId();
  const toId = useId();
  const sucursalId = useId();

  const [from, setFrom] = useState<string>(getPrimerDiaMes());
  const [to, setTo] = useState<string>(getHoy());
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [report, setReport] = useState<SalesReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fechaError, setFechaError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validarFechas(): string | null {
    if (!from || !to) return "Selecciona la fecha de inicio y fin.";
    if (from > to) return "La fecha de inicio no puede ser posterior a la fecha de fin.";
    return null;
  }

  function handleActualizar() {
    const err = validarFechas();
    if (err) {
      setFechaError(err);
      return;
    }
    setFechaError(null);
    setError(null);

    startTransition(async () => {
      try {
        const result = await getSalesReportAction({
          from,
          to,
          branchId: isGeneralManager ? selectedBranchId || undefined : undefined,
        });
        if (result.ok) {
          setReport(result.report);
          return;
        }
        setError(result.message);
        setReport(null);
      } catch {
        setError("No fue posible cargar el reporte. Inténtalo nuevamente.");
        setReport(null);
      }
    });
  }

  const sucursalMostrada = isGeneralManager
    ? branches.find((b) => b.id === selectedBranchId)?.name ?? "Todas las sucursales"
    : fixedBranchName ?? "Mi sucursal";

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
      {/* Encabezado */}
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">
          Ventas por sucursal
        </h1>
        <p className="text-sm text-text-secondary">
          Total de ventas pagadas en el período seleccionado.
        </p>
      </header>

      {/* Filtros */}
      <section
        aria-label="Filtros del reporte"
        className="flex flex-wrap items-end gap-4 rounded-card border border-border bg-white p-4 shadow-sm"
      >
        {/* Desde */}
        <div className="flex flex-col gap-1">
          <label htmlFor={fromId} className="text-xs font-semibold text-text-secondary">
            Desde
          </label>
          <input
            id={fromId}
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => { setFrom(e.target.value); setFechaError(null); }}
            disabled={isPending}
            className="min-h-11 rounded-control border border-border bg-white px-3 py-2 text-sm text-brown outline-none focus:border-brown focus:ring-1 focus:ring-brown focus-visible:shadow-focus"
          />
        </div>

        {/* Hasta */}
        <div className="flex flex-col gap-1">
          <label htmlFor={toId} className="text-xs font-semibold text-text-secondary">
            Hasta
          </label>
          <input
            id={toId}
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => { setTo(e.target.value); setFechaError(null); }}
            disabled={isPending}
            className="min-h-11 rounded-control border border-border bg-white px-3 py-2 text-sm text-brown outline-none focus:border-brown focus:ring-1 focus:ring-brown focus-visible:shadow-focus"
          />
        </div>

        {/* Selector de sucursal solo para GENERAL_MANAGER */}
        {isGeneralManager && (
          <div className="flex flex-col gap-1">
            <label htmlFor={sucursalId} className="text-xs font-semibold text-text-secondary">
              Sucursal
            </label>
            <select
              id={sucursalId}
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={isPending}
              className="min-h-11 rounded-control border border-border bg-white px-3 py-2 text-sm text-brown outline-none focus:border-brown focus:ring-1 focus:ring-brown focus-visible:shadow-focus"
            >
              <option value="">Todas las sucursales</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          onClick={handleActualizar}
          loading={isPending}
          loadingText="Actualizando…"
          disabled={!from || !to}
          className="self-end"
        >
          Actualizar
        </Button>
      </section>

      {/* Error de validación de fechas */}
      {fechaError && (
        <p role="alert" className="flex items-center gap-2 text-sm font-semibold text-danger">
          <AlertCircle aria-hidden className="size-4 shrink-0" />
          {fechaError}
        </p>
      )}

      {/* Cargando */}
      {isPending && (
        <div aria-busy="true" aria-label="Cargando reporte" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-36 w-full rounded-card" />
          <Skeleton className="h-36 w-full rounded-card" />
        </div>
      )}

      {/* Error de API */}
      {!isPending && error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-20 items-center justify-center rounded-card border border-border bg-cream">
            <AlertCircle aria-hidden className="size-10 text-brown" />
          </div>
          <p className="text-base font-semibold text-brown">{error}</p>
          <Button variant="secondary" onClick={handleActualizar}>
            <RotateCw aria-hidden className="size-4" />
            Reintentar
          </Button>
        </div>
      )}

      {/* Sin datos previos aún */}
      {!isPending && !error && !report && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <TrendingUp aria-hidden className="size-16 text-border" />
          <p className="text-base font-semibold text-brown">
            Selecciona un período y presiona <strong>Actualizar</strong> para ver el reporte.
          </p>
        </div>
      )}

      {/* Resultados */}
      {!isPending && !error && report && (
        <section aria-label="Resultados del reporte de ventas" className="flex flex-col gap-6">
          {/* Período y sucursal consultados */}
          <p className="text-sm text-text-secondary">
            Período: <strong className="text-brown">{formatFecha(report.from)}</strong>
            {" "}al{" "}
            <strong className="text-brown">{formatFecha(report.to)}</strong>
            {" "}· Sucursal:{" "}
            <strong className="text-brown">{sucursalMostrada}</strong>
          </p>

          {report.paymentsCount === 0 ? (
            /* Sin ventas en el período */
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <TrendingUp aria-hidden className="size-16 text-border" />
              <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
                No hay ventas en el período
              </h2>
              <p className="max-w-sm text-sm text-text-secondary">
                Cambia el rango de fechas o la sucursal para ver las ventas del período.
              </p>
            </div>
          ) : (
            /* Tarjetas de indicadores */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Total de ventas */}
              <div className="flex flex-col gap-2 rounded-card border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                  <TrendingUp aria-hidden className="size-5 text-crimson" />
                  Total de ventas pagadas
                </div>
                <p className="font-display text-h1 font-bold text-crimson">
                  {formatMoneda(report.total)}
                </p>
              </div>

              {/* Cantidad de pagos */}
              <div className="flex flex-col gap-2 rounded-card border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                  <CreditCard aria-hidden className="size-5 text-brown" />
                  Pagos registrados
                </div>
                <p className="font-display text-h1 font-bold text-brown">
                  {report.paymentsCount}
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
