"use server";

import { redirect } from "next/navigation";
import {
  createReview,
  getBranchRating,
  getMyOrders,
  ReviewApiError,
  type ApiErrorMessage,
  type BranchRating,
  type CustomerOrder,
} from "@/lib/api/reviews";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

export type SubmitReviewResult =
  | { ok: true; branchRating: BranchRating | null }
  | {
      ok: false;
      kind: "validation" | "forbidden" | "not_found" | "conflict" | "error";
      message: ApiErrorMessage;
      refreshedOrders?: CustomerOrder[];
    };

function validationMessage(message: string): SubmitReviewResult {
  return { ok: false, kind: "validation", message };
}

async function refreshOrdersAfterConflict(token: string): Promise<CustomerOrder[] | undefined> {
  try {
    return await getMyOrders(token);
  } catch (error) {
    if (error instanceof ReviewApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    return undefined;
  }
}

export async function submitReview(
  orderId: string,
  rating: number,
  comment?: string,
): Promise<SubmitReviewResult> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) redirect("/login");
  if (user.rol !== "CLIENT") {
    return { ok: false, kind: "forbidden", message: "Acceso denegado." };
  }

  if (!orderId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return validationMessage("Selecciona una calificación de 1 a 5 estrellas.");
  }
  if (comment !== undefined && (typeof comment !== "string" || comment.length > 500)) {
    return validationMessage("El comentario no puede superar 500 caracteres.");
  }

  let branchId: string;
  try {
    const orders = await getMyOrders(token);
    const order = orders.find((item) => item.id === orderId);
    if (!order) return { ok: false, kind: "not_found", message: "No se encontró el pedido." };
    if (order.status !== "DELIVERED" || order.review !== null) {
      return {
        ok: false,
        kind: "conflict",
        message: "El pedido ya fue calificado o aún no está entregado.",
        refreshedOrders: orders,
      };
    }
    branchId = order.branchId;
  } catch (error) {
    if (error instanceof ReviewApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof ReviewApiError && error.status === 403) {
      return { ok: false, kind: "forbidden", message: "Acceso denegado." };
    }
    return {
      ok: false,
      kind: "error",
      message: error instanceof Error ? error.message : "No se pudo cargar el pedido.",
    };
  }

  try {
    await createReview(token, {
      orderId,
      rating,
      ...(comment !== undefined ? { comment } : {}),
    });
  } catch (error) {
    if (error instanceof ReviewApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    if (error instanceof ReviewApiError && error.status === 403) {
      return { ok: false, kind: "forbidden", message: "Acceso denegado." };
    }
    if (error instanceof ReviewApiError && error.status === 409) {
      return {
        ok: false,
        kind: "conflict",
        message: "El pedido ya fue calificado o aún no está entregado.",
        refreshedOrders: await refreshOrdersAfterConflict(token),
      };
    }
    if (error instanceof ReviewApiError && error.status === 400) {
      return { ok: false, kind: "validation", message: error.serverMessage };
    }
    if (error instanceof ReviewApiError && error.status === 404) {
      return { ok: false, kind: "not_found", message: error.serverMessage };
    }
    return {
      ok: false,
      kind: "error",
      message: error instanceof Error ? error.message : "No se pudo enviar la reseña.",
    };
  }

  // La reseña no se agrega en memoria: ambos datos se vuelven a leer desde el servidor.
  const [ordersResult, ratingResult] = await Promise.allSettled([
    getMyOrders(token),
    getBranchRating(branchId),
  ]);
  if (ordersResult.status === "rejected" &&
      ordersResult.reason instanceof ReviewApiError &&
      ordersResult.reason.status === 401) {
    await deleteSession();
    redirect("/login");
  }
  return {
    ok: true,
    branchRating: ratingResult.status === "fulfilled" ? ratingResult.value : null,
  };
}
