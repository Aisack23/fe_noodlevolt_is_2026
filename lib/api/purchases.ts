import { getApiBaseUrl } from "./base-url.ts";
import type { InventoryItem } from "./inventory";

export type PurchaseLineInput = {
  branchIngredientId: string;
  quantity: string;
  unitCost: string;
  expirationDate?: string;
};

export type PurchaseInput = {
  supplier: string;
  invoiceNumber: string;
  lines: PurchaseLineInput[];
};

type Purchase = {
  id: string;
  supplier: string;
  invoiceNumber: string | null;
  purchasedAt: string;
  details: {
    id: string;
    quantity: string;
    unitCost: string;
    expirationDate: string | null;
    ingredientName: string;
    unit: string;
  }[];
};

type PurchasePage = { items: Purchase[]; total: number; page: number; limit: number };

export class PurchaseApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

async function purchaseRequest<T>(token: string, path: string, input?: PurchaseInput): Promise<T> {
  const response = await fetch(new URL(path, getApiBaseUrl()), {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, ...(input ? { "Content-Type": "application/json" } : {}) },
    ...(input ? { method: "POST", body: JSON.stringify(input) } : {}),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message;
    throw new PurchaseApiError(
      response.status,
      response.status < 500 && typeof message === "string" ? message : "No se pudo completar la operación de compras.",
    );
  }
  return response.json();
}

export const getLowStock = (token: string) => purchaseRequest<InventoryItem[]>(token, "purchases/low-stock");
export const getPurchases = (token: string, page: number) => purchaseRequest<PurchasePage>(token, `purchases?page=${page}&limit=10`);
export const createPurchase = (token: string, data: PurchaseInput) => purchaseRequest<Purchase>(token, "purchases", data);
