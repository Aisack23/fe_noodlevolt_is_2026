import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { getInventory, InventoryApiError, type InventoryItem } from "@/lib/api/inventory";
import { getSession, getSessionUser } from "@/lib/session";
import { InventoryTable } from "./inventory-table";

export const metadata: Metadata = {
  title: "Inventario",
};


const ROLES_PERMITIDOS = ["BRANCH_ADMIN", "GENERAL_MANAGER"];

const formatoFecha = new Intl.DateTimeFormat("es-SV", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/El_Salvador",
});

function Pantalla({
  children,
  ultimaActualizacion,
}: {
  children: ReactNode;
  ultimaActualizacion?: string;
}) {
  return (
    <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">Inventario</h1>
        <p className="text-sm text-brown">
          Nivel de inventario de los insumos clave de tu sucursal.
        </p>
        {ultimaActualizacion && (
          <p className="text-sm text-text-secondary">
            Última actualización: {ultimaActualizacion}
          </p>
        )}
      </div>
      {children}
    </main>
  );
}

export default async function InventarioPage() {
  const token = await getSession();
  const usuario = await getSessionUser();

  if (!token || !usuario) {
    redirect("/login");
  }

  
  if (!usuario.rol || !ROLES_PERMITIDOS.includes(usuario.rol)) {
    return (
      <Pantalla>
        <AccesoDenegado href="/menu" />
      </Pantalla>
    );
  }

  let items: InventoryItem[];
  try {
    items = await getInventory(token);
  } catch (error) {
    if (error instanceof InventoryApiError) {
      if (error.status === 401) redirect("/login");
      if (error.status === 403) {
        return (
          <Pantalla>
            <AccesoDenegado href="/menu" />
          </Pantalla>
        );
      }
    }
    // Cualquier otro fallo lo muestra error.tsx, con «Reintentar».
    throw error;
  }

  const ultimaMarca = items.length
    ? Math.max(...items.map((item) => new Date(item.updatedAt).getTime()))
    : null;

  return (
    <Pantalla
      ultimaActualizacion={
        ultimaMarca !== null ? formatoFecha.format(new Date(ultimaMarca)) : undefined
      }
    >
      {items.length === 0 ? (
        <EstadoVacio
          titulo="No hay insumos registrados en tu sucursal"
          mensaje="Cuando registres insumos, aparecerán aquí."
        />
      ) : (
        <InventoryTable items={items} />
      )}
    </Pantalla>
  );
}