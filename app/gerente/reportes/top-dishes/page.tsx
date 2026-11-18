import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { getBranches, getMyBranch } from "@/lib/api/branches";
import { canAccessBranchAdministration } from "@/lib/auth/roles";
import { getSession, getSessionUser } from "@/lib/session";
import { TopDishesClient } from "./top-dishes-client";

export const metadata: Metadata = {
  title: "Platillos más vendidos · Gerencia NoodleVolt",
  description: "Consulta el ranking de platillos más vendidos en el período seleccionado.",
};

export default async function TopDishesPage() {
  const token = await getSession();
  const user = await getSessionUser();

  if (!token || !user) {
    redirect("/login");
  }

  if (!canAccessBranchAdministration(user.rol)) {
    return (
      <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
        <AccesoDenegado href="/" />
      </main>
    );
  }

  const isGeneralManager = user.rol === "GENERAL_MANAGER";

  if (!isGeneralManager) {
    const myBranch = await getMyBranch(token);

    if (!myBranch) {
      return (
        <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-h2 font-bold uppercase text-brown">
              Platillos más vendidos
            </h1>
          </div>
          <Alerta tono="warning">
            Tu cuenta no tiene una sucursal asignada. Contacta al administrador general.
          </Alerta>
        </main>
      );
    }

    return (
      <main className="flex-1">
        <TopDishesClient
          isGeneralManager={false}
          fixedBranchName={myBranch.name}
          branches={[]}
        />
      </main>
    );
  }

  let branches: { id: string; name: string }[] = [];
  try {
    const all = await getBranches(token);
    branches = all.map((b) => ({ id: b.id, name: b.name }));
  } catch {
    // Continúa sin el selector si falla
  }

  return (
    <main className="flex-1">
      <TopDishesClient
        isGeneralManager={true}
        fixedBranchName={null}
        branches={branches}
      />
    </main>
  );
}
