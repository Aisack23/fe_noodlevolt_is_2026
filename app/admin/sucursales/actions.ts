"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BranchApiError, updateBranchStatus, type BranchStatusResponse } from "@/lib/api/branches";
import { canAccessBranchAdministration } from "@/lib/auth/roles";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";

export type UpdateBranchStatusResult =
  | { ok: true; status: BranchStatusResponse }
  | { ok: false; message: string };

function getErrorMessage(error: unknown): string {
  if (!(error instanceof BranchApiError)) {
    return "No se pudo completar la operación. Intenta de nuevo.";
  }
  if (error.status === 400) return "La solicitud no es válida. Intenta de nuevo.";
  if (error.status === 403) return "No tienes autorización para modificar la configuración de esta sucursal.";
  if (error.status === 404) return "No fue posible modificar la configuración de esta sucursal.";
  return "No se pudo completar la operación. Intenta de nuevo.";
}

export async function setBranchOperationalStatus(
  branchId: string,
  isOpen: boolean,
): Promise<UpdateBranchStatusResult> {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) {
    await deleteSession();
    redirect("/login");
  }
  if (!canAccessBranchAdministration(user.rol)) {
    return { ok: false, message: "No tienes autorización para modificar la configuración de esta sucursal." };
  }

  try {
    const status = await updateBranchStatus(token, branchId, isOpen);
    revalidatePath("/admin/sucursales");
    return { ok: true, status };
  } catch (error) {
    if (error instanceof BranchApiError && error.status === 401) {
      await deleteSession();
      redirect("/login");
    }
    return { ok: false, message: getErrorMessage(error) };
  }
}
