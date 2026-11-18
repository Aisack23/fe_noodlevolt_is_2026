"use client";

import { useState, useTransition, useId } from "react";
import { RotateCw, Utensils, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  getTopDishesReportAction,
  type TopDishesReportActionResult,
} from "../actions";

type Sucursal = { id: string; name: string };

type TopDishesClientProps = {
  isGeneralManager: boolean;
  fixedBranchName: string | null;
  branches: Sucursal[];
};

type TopDishesReport = Extract<TopDishesReportActionResult, { ok: true }>["report"];

const LIMIT_DEFAULT = 10;

function getHoy(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getPrimerDiaMes(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function formatFecha(fecha: string): string {
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

export function TopDishesClient({
  isGeneralManager,
  fixedBranchName,
  branches,
}: TopDishesClientProps) {
  const fromId = useId();
  const toId = useId();
  const sucursalId = useId();
  const limitId = useId();

  const [from, setFrom] = useState<string>(getPrimerDiaMes());
  const [to, setTo] = useState<string>(getHoy());
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [limit, setLimit] = useState<number>(LIMIT_DEFAULT);
  const [report, setReport] = useState<TopDishesReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fechaError, setFechaError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function validarFechas(): string | null {
    if (!from || !to) return "Selecciona la fecha de inicio y fin.";
    if (from > to) return "La fecha de inicio no puede ser posterior a la fecha de fin.";
    return null;
  }

  function validarLimit(): number {
    return Math.max(1, Math.min(100, Math.trunc(limit || LIMIT_DEFAULT)));
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
        const result = await getTopDishesReportAction({
          from,
          to,
          branchId: isGeneralManager ? selectedBranchId || undefined : undefined,
          limit: validarLimit(),
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

  // Valor máximo de la barra (cantidad del primer platillo)
  const maxQuantity = Math.max(1, ...(report?.dishes.map((dish) => dish.quantity) ?? []));

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8">
      {/* Encabezado */}
      <header className="flex flex-col gap-1 border-b border-border pb-4">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">
          Platillos más vendidos
        </h1>
        <p className="text-sm text-text-secondary">
          Ranking de los platillos más vendidos en el período seleccionado.
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

        {/* Selector sucursal solo para GENERAL_MANAGER */}
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

        {/* Límite de resultados */}
        <div className="flex flex-col gap-1">
          <label htmlFor={limitId} className="text-xs font-semibold text-text-secondary">
            Cantidad
          </label>
          <input
            id={limitId}
            type="number"
            value={limit}
            min={1}
            max={100}
            step={1}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={isPending}
            className="w-24 min-h-11 rounded-control border border-border bg-white px-3 py-2 text-sm text-brown outline-none focus:border-brown focus:ring-1 focus:ring-brown focus-visible:shadow-focus"
          />
        </div>

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
        <div aria-busy="true" aria-label="Cargando reporte" className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-control" />
          ))}
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
          <Utensils aria-hidden className="size-16 text-border" />
          <p className="text-base font-semibold text-brown">
            Selecciona un período y presiona <strong>Actualizar</strong> para ver el ranking.
          </p>
        </div>
      )}

      {/* Resultados */}
      {!isPending && !error && report && (
        <section aria-label="Resultados de platillos más vendidos" className="flex flex-col gap-6">
          {/* Período y sucursal consultados */}
          <p className="text-sm text-text-secondary">
            Período: <strong className="text-brown">{formatFecha(report.from)}</strong>
            {" "}al{" "}
            <strong className="text-brown">{formatFecha(report.to)}</strong>
            {" "}· Sucursal:{" "}
            <strong className="text-brown">{sucursalMostrada}</strong>
          </p>

          {report.dishes.length === 0 ? (
            /* Sin datos en el período */
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Utensils aria-hidden className="size-16 text-border" />
              <h2 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
                No hay ventas en el período
              </h2>
              <p className="max-w-sm text-sm text-text-secondary">
                Elige otro período o sucursal para ver los platillos más vendidos.
              </p>
            </div>
          ) : (
            /* Tabla + barras de ranking */
            <div className="rounded-card border border-border bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border bg-white text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      <th scope="col" className="w-12 px-4 py-3.5 text-center">#</th>
                      <th scope="col" className="px-4 py-3.5">Platillo</th>
                      <th scope="col" className="px-4 py-3.5 text-right">Cantidad</th>
                      <th scope="col" className="px-4 py-3.5 min-w-[160px]" aria-label="Proporción" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {report.dishes.map((dish, idx) => {
                      const pct = maxQuantity > 0 ? (dish.quantity / maxQuantity) * 100 : 0;
                      return (
                        <tr key={dish.dishId} className="transition-colors hover:bg-background/60">
                          <td className="px-4 py-3.5 text-center text-sm font-bold text-text-secondary">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-brown">
                            {dish.dishName}
                          </td>
                          <td className="px-4 py-3.5 text-right text-sm font-bold text-crimson">
                            {dish.quantity}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="relative h-4 overflow-hidden rounded-full bg-cream">
                              <div
                                className="absolute inset-y-0 left-0 rounded-full bg-crimson transition-all"
                                style={{ width: `${pct}%` }}
                                aria-hidden
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
