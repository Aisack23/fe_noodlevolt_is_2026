"use client";

import { useState } from "react";
import { ChipCategoria } from "@/components/ui/ChipCategoria";
import { TarjetaPlatillo } from "@/components/ui/TarjetaPlatillo";
import { useCart, type SucursalInfo } from "@/lib/cart/cart-context";

export type Platillo = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
};

export type Categoria = {
  id: string;
  nombre: string;
  platillos: Platillo[];
};

type MenuCatalogoProps = {
  categorias: Categoria[];
  sucursal?: SucursalInfo;
};

export function MenuCatalogo({ categorias, sucursal }: MenuCatalogoProps) {
  const { agregarPlatillo } = useCart();
  const [agregandoId, setAgregandoId] = useState<string | null>(null);
  // null significa "Todas".
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  const visibles = seleccionada
    ? categorias.filter((categoria) => categoria.id === seleccionada)
    : categorias;

  const handleAgregar = (platillo: Platillo) => {
    setAgregandoId(platillo.id);
    agregarPlatillo(
      {
        platilloId: platillo.id,
        nombre: platillo.nombre,
        precio: platillo.precio,
        descripcion: platillo.descripcion,
      },
      sucursal,
    );
    setTimeout(() => {
      setAgregandoId(null);
    }, 400);
  };

  return (
    <>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <ChipCategoria activo={seleccionada === null} onClick={() => setSeleccionada(null)}>
          Todas
        </ChipCategoria>
        {categorias.map((categoria) => (
          <ChipCategoria
            key={categoria.id}
            activo={seleccionada === categoria.id}
            onClick={() => setSeleccionada(categoria.id)}
          >
            {categoria.nombre}
          </ChipCategoria>
        ))}
      </div>

      {visibles.map((categoria) => (
        <section key={categoria.id} className="flex flex-col gap-4">
          <h2 className="font-display text-h2 font-bold uppercase text-brown">
            {categoria.nombre}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {categoria.platillos.map((platillo) => (
              <TarjetaPlatillo
                key={platillo.id}
                nombre={platillo.nombre}
                descripcion={platillo.descripcion}
                precio={platillo.precio}
                disponible={platillo.disponible}
                onAgregar={() => handleAgregar(platillo)}
                agregando={agregandoId === platillo.id}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
