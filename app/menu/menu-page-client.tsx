"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alerta } from "@/components/ui/Alerta";
import { useCart, type SucursalInfo } from "@/lib/cart/cart-context";
import type { Branch } from "@/lib/api/branches";
import { MenuCatalogo, type Categoria } from "./menu-catalogo";

type MenuPageClientProps = {
  branches: Branch[];
  selectedBranch: SucursalInfo;
  categorias: Categoria[];
};

export function MenuPageClient({
  branches,
  selectedBranch,
  categorias,
}: MenuPageClientProps) {
  const router = useRouter();
  const { items, sucursal, setSucursal } = useCart();
  const [error, setError] = useState<string | null>(null);

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
        <p className="py-12 text-center text-sm text-text-secondary">
          Esta sucursal todavía no tiene platillos en su menú.
        </p>
      ) : (
        <MenuCatalogo categorias={categorias} sucursal={selectedBranch} />
      )}
    </main>
  );
}
