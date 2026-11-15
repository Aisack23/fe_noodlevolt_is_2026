import type { Metadata } from "next";
import { getBranches, type Branch } from "@/lib/api/branches";
import { getSessionUser } from "@/lib/session";
import { ReservarMesaClient } from "./reservar-mesa-client";

export const metadata: Metadata = {
  title: "Reservar mesa · NoodleVolt",
  description: "Elige sucursal, fecha, hora y personas. Cada reservación dura 90 minutos.",
};

type ReservasPageProps = {
  searchParams: Promise<{ sucursal?: string }>;
};

export default async function ReservasPage({ searchParams }: ReservasPageProps) {
  const { sucursal } = await searchParams;
  const user = await getSessionUser();

  let branches: Branch[] = [];
  try {
    branches = await getBranches();
  } catch {
    // Si falla la API pública, ofrecemos opciones mínimas por defecto
    branches = [
      {
        id: "branch-santa-tecla",
        name: "Santa Tecla",
        address: "Av. Principal #123",
        timeZone: "America/El_Salvador",
        isActive: true,
        isOpen: true,
      },
      {
        id: "branch-centro",
        name: "San Salvador – Centro",
        address: "Calle Rubén Darío #456",
        timeZone: "America/El_Salvador",
        isActive: true,
        isOpen: true,
      },
    ];
  }

  return (
    <main className="flex-1">
      <ReservarMesaClient
        branches={branches}
        initialBranchId={sucursal}
        user={user}
      />
    </main>
  );
}
