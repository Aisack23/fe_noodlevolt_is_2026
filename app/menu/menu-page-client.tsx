"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { useCart, type SucursalInfo } from "@/lib/cart/cart-context";
import type { Branch } from "@/lib/api/branches";
import { MenuCatalogo, type Categoria } from "./menu-catalogo";

type MenuPageClientProps = {
  branches: Branch[];
  selectedBranch: SucursalInfo;
  categorias: Categoria[];
  /** false para el personal: ve el menú, pero sin «Agregar». */
  puedeAgregar: boolean;
};

export function MenuPageClient({
  branches,
  selectedBranch,
  categorias,
  puedeAgregar,
}: MenuPageClientProps) {
  const router = useRouter();
  const { items, sucursal, setSucursal } = useCart();
  const [error, setError] = useState<string | null>(null);
  const selectorRef = useRef<HTMLSelectElement>(null);

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find((item) => item.id === branchId);
    if (!branch || branch.id === selectedBranch.id) return;

    if (items.length > 0 && sucursal?.id !== branch.id) {
      setError("Vacía tu carrito antes de cambiar de sucursal para no mezclar platillos.");
      return;
    }

    setSucursal({ id: branch.id, nombre: branch.name });
    router.push(`/menu?sucursal=${encodeURIComponent(branch.id)}`);
  };

  const selectedBranchInfo = branches.find((branch) => branch.id === selectedBranch.id);

  return (
    <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-h1 font-bold uppercase text-brown">Menú</h1>
          <p className="text-sm text-text-secondary">Elige la sucursal donde retirarás tu pedido.</p>
        </div>

        <label className="flex w-full max-w-sm flex-col gap-1 text-sm font-semibold text-brown">
          Sucursal
          <select
            ref={selectorRef}
            value={selectedBranch.id}
            onChange={(event) => handleBranchChange(event.target.value)}
            className="min-h-11 rounded-control border border-border bg-white px-3 text-base font-normal text-brown outline-none focus-visible:shadow-focus"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}{branch.isOpen ? "" : " · Cerrada"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <Alerta tono="warning">{error}</Alerta>}
      {selectedBranchInfo && !selectedBranchInfo.isOpen && (
        <Alerta tono="warning">
          Esta sucursal está cerrada y no acepta pedidos por el momento.
        </Alerta>
      )}

      {categorias.length === 0 ? (
        // Frame «Cliente / Menú / Vacío» (EstadoVacio 42:1752): «Cambiar sucursal» lleva al selector.
        <EstadoVacio
          titulo="Sin platillos por ahora"
          mensaje="Esta sucursal todavía no tiene platillos en su menú. Prueba con otra sucursal."
          accion={
            branches.length > 1 ? (
              <Button variant="secondary" onClick={() => selectorRef.current?.focus()}>
                Cambiar sucursal
              </Button>
            ) : undefined
          }
        />
      ) : (
        <MenuCatalogo categorias={categorias} sucursal={selectedBranch} puedeAgregar={puedeAgregar} />
      )}
    </main>
  );
}
