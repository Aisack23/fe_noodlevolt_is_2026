"use server";

import { revalidatePath } from "next/cache";
import { createPurchase, PurchaseApiError } from "@/lib/api/purchases";
import { getSession, getSessionUser } from "@/lib/session";

export type PurchaseState = { error?: string; invoice?: string };

export async function receivePurchase(_previous: PurchaseState, form: FormData): Promise<PurchaseState> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || user?.rol !== "BRANCH_ADMIN" || !user.branchId)
    return { error: "No tienes permiso para registrar compras en esta sucursal." };

  const supplier = String(form.get("supplier") ?? "").trim();
  const invoiceNumber = String(form.get("invoiceNumber") ?? "").trim();
  const quantities = form.getAll("quantity");
  const unitCosts = form.getAll("unitCost");
  const expirationDates = form.getAll("expirationDate");
  const lines = form.getAll("ingredient").map((id, index) => ({
    branchIngredientId: String(id),
    quantity: String(quantities[index] ?? ""),
    unitCost: String(unitCosts[index] ?? ""),
    expirationDate: expirationDates[index] ? String(expirationDates[index]) : undefined,
  }));
  if (!supplier || !invoiceNumber || !lines.length || lines.some((line) => !line.branchIngredientId || !line.quantity || !line.unitCost))
    return { error: "Completa los datos de la factura y de cada insumo." };

  try {
    await createPurchase(token, { supplier, invoiceNumber, lines });
  } catch (error) {
    return { error: error instanceof PurchaseApiError ? error.message : "No se pudo registrar la compra. Intenta de nuevo." };
  }

  revalidatePath("/gerente/compras");
  revalidatePath("/gerente/inventario");
  revalidatePath("/gerente/insumos-por-comprar");
  return { invoice: invoiceNumber };
}
