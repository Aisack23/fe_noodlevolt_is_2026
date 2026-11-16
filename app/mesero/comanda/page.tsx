import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { PersonalShell } from "@/components/ui/PersonalShell";
import type { Mesa, SalonDish } from "@/lib/api/salon";
import { getSalonMenu } from "@/lib/api/salon-menu";
import { TablesApiError, getBranchTables } from "@/lib/api/tables";
import { deleteSession, getSession, getSessionUser } from "@/lib/session";
import { ComandaFlow } from "./comanda-flow";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nueva comanda" };

const GENERIC_ERROR = "No se pudo completar la operación. Intenta de nuevo";

function AccessDenied() {
  return (
    <div className="min-h-screen bg-background">
      <AccesoDenegado href="/menu" />
    </div>
  );
}

export default async function ComandaPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);
  if (!token || !user) redirect("/login");
  if (user.rol !== "WAITER") return <AccessDenied />;

  let initialMesas: Mesa[] = [];
  let initialDishes: SalonDish[] = [];
  let mesasError: string | undefined;
  let menuError = false;
  let nombreSucursal: string | undefined;

  if (!user.branchId) {
    mesasError = "Tu cuenta no tiene una sucursal asignada.";
    menuError = true;
  } else {
    const [mesasResult, menuResult] = await Promise.allSettled([
      getBranchTables(token, user.branchId),
      getSalonMenu(user.branchId),
    ]);

    if (mesasResult.status === "fulfilled") {
      initialMesas = mesasResult.value;
    } else {
      const error: unknown = mesasResult.reason;
      if (error instanceof TablesApiError && error.status === 401) {
        await deleteSession();
        redirect("/login");
      }
      if (error instanceof TablesApiError && error.status === 403) return <AccessDenied />;
      mesasError = GENERIC_ERROR;
    }

    if (menuResult.status === "fulfilled") {
      initialDishes = menuResult.value.dishes;
      nombreSucursal = menuResult.value.branchName;
    } else {
      menuError = true;
    }
  }

  return (
    <PersonalShell rol="WAITER" sucursal={nombreSucursal ?? "Sucursal asignada"} usuario={user}>
      <ComandaFlow
        initialMesas={initialMesas}
        initialError={mesasError}
        initialDishes={initialDishes}
        initialMenuError={menuError}
      />
    </PersonalShell>
  );
}