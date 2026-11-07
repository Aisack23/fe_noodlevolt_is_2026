import type { Metadata } from "next";
import { sampleInventory } from "@/lib/api/inventory";
import { InventoryTable } from "./inventory-table";
import { EstadoVacio } from "@/components/ui/EstadoVacio";

export const metadata: Metadata = {
  title: "Inventario",
};

const formatoFecha = new Intl.DateTimeFormat("es-SV", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/El_Salvador",
});

export default function InventarioPage() {


  // SUPUESTO: datos de ejemplo hasta que BE-05 esté en develop.
  const items = sampleInventory;

  const ultimaMarca = items.length
    ? Math.max(...items.map((item) => new Date(item.updatedAt).getTime()))
    : null;

  return (
    <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">Inventario</h1>
        <p className="text-sm text-brown">
          Nivel de inventario de los insumos clave de tu sucursal.
        </p>
        {ultimaMarca !== null && (
          <p className="text-sm text-text-secondary">
            Última actualización: {formatoFecha.format(new Date(ultimaMarca))}
          </p>
        )}
      </div>
           {items.length === 0 ? (
        <EstadoVacio
          titulo="No hay insumos registrados en tu sucursal"
          mensaje="Cuando registres insumos, aparecerán aquí."
        />
      ) : (
        <InventoryTable items={items} />
      )}
    </main>
  );
}