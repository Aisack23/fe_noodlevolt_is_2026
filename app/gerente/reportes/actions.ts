"use server";

import { BranchApiError, getMyBranch } from "@/lib/api/branches";
import {
  getSalesReport,
  getTopDishesReport,
  ReportsApiError,
  type SalesReportResponse,
  type TopDishesReportResponse,
} from "@/lib/api/reports";
import { canAccessBranchAdministration } from "@/lib/auth/roles";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

type ReportFilters = {
  from: string;
  to: string;
  branchId?: string;
};

type ReportFailureKind = "unauthenticated" | "forbidden" | "validation" | "error";

export type SalesReportActionResult =
  | { ok: true; report: SalesReportResponse }
  | { ok: false; kind: ReportFailureKind; message: string };

export type TopDishesReportActionResult =
  | { ok: true; report: TopDishesReportResponse }
  | { ok: false; kind: ReportFailureKind; message: string };

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function validateFilters(filters: ReportFilters): string | null {
  if (!isValidDate(filters.from) || !isValidDate(filters.to)) {
    return "Selecciona fechas válidas para el reporte.";
  }
  if (filters.from > filters.to) {
    return "La fecha de inicio no puede ser posterior a la fecha de fin.";
  }
  if (filters.branchId !== undefined && filters.branchId.trim() === "") {
    return "La sucursal seleccionada no es válida.";
  }
  return null;
}

async function resolveReportAccess(filters: ReportFilters) {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);

  if (!token || !user) {
    await deleteSession();
    return { ok: false as const, kind: "unauthenticated" as const, message: "Tu sesión expiró. Inicia sesión para continuar." };
  }

  if (!canAccessBranchAdministration(user.rol)) {
    return { ok: false as const, kind: "forbidden" as const, message: "Tu cuenta no tiene permiso para consultar reportes." };
  }

  if (user.rol === "GENERAL_MANAGER") {
    return { ok: true as const, token, branchId: filters.branchId };
  }

  try {
    const branch = await getMyBranch(token);
    if (!branch) {
      return { ok: false as const, kind: "forbidden" as const, message: "Tu cuenta no tiene una sucursal asignada para consultar reportes." };
    }
    return { ok: true as const, token, branchId: branch.id };
  } catch (error) {
    if (error instanceof BranchApiError && error.status === 401) {
      await deleteSession();
      return { ok: false as const, kind: "unauthenticated" as const, message: "Tu sesión expiró. Inicia sesión para continuar." };
    }
    return { ok: false as const, kind: "error" as const, message: "No se pudo identificar la sucursal asignada a tu cuenta." };
  }
}

function errorResult(error: unknown): { ok: false; kind: ReportFailureKind; message: string } {
  if (error instanceof ReportsApiError) {
    if (error.status === 401) {
      return { ok: false, kind: "unauthenticated", message: "Tu sesión expiró. Inicia sesión para continuar." };
    }
    if (error.status === 403) {
      return { ok: false, kind: "forbidden", message: "No tienes permiso para consultar este reporte." };
    }
  }
  return { ok: false, kind: "error", message: "No fue posible cargar el reporte. Inténtalo nuevamente." };
}

export async function getSalesReportAction(filters: ReportFilters): Promise<SalesReportActionResult> {
  const validationError = validateFilters(filters);
  if (validationError) return { ok: false, kind: "validation", message: validationError };

  const access = await resolveReportAccess(filters);
  if (!access.ok) return access;

  try {
    return { ok: true, report: await getSalesReport(access.token, { from: filters.from, to: filters.to, branchId: access.branchId }) };
  } catch (error) {
    const result = errorResult(error);
    if (result.kind === "unauthenticated") await deleteSession();
    return result;
  }
}

export async function getTopDishesReportAction(
  filters: ReportFilters & { limit: number },
): Promise<TopDishesReportActionResult> {
  const validationError = validateFilters(filters);
  if (validationError) return { ok: false, kind: "validation", message: validationError };
  if (!Number.isInteger(filters.limit) || filters.limit < 1 || filters.limit > 100) {
    return { ok: false, kind: "validation", message: "La cantidad debe ser un número entero entre 1 y 100." };
  }

  const access = await resolveReportAccess(filters);
  if (!access.ok) return access;

  try {
    return { ok: true, report: await getTopDishesReport(access.token, { from: filters.from, to: filters.to, branchId: access.branchId, limit: filters.limit }) };
  } catch (error) {
    const result = errorResult(error);
    if (result.kind === "unauthenticated") await deleteSession();
    return result;
  }
}
