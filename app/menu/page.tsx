import type { Metadata } from "next";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { obtenerMenu } from "@/lib/api/menu";
import { MenuCatalogo, type Categoria } from "./menu-catalogo";

export const metadata: Metadata = {
  title: "Menú",
};

export default async function MenuPage() {
  const sucursalId = process.env.MENU_BRANCH_ID;
  if (!sucursalId) {
    throw new Error("Falta la variable de entorno MENU_BRANCH_ID.");
  }

  const menu = await obtenerMenu(sucursalId);

  
  const categorias: Categoria[] = menu.categorias.map((categoria) => ({
    id: categoria.id,
    nombre: categoria.nombre,
    platillos: categoria.platillos.map((platillo) => ({
      id: platillo.id,
      nombre: platillo.nombre,
      descripcion: platillo.descripcion ?? "",
      precio: Number(platillo.precio),
      disponible: platillo.disponible,
    })),
  }));

  const sinPlatillos = categorias.length === 0;
  //const sinPlatillos = true;

  return (
    <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-h1 font-bold uppercase text-brown">Menú</h1>
        <p className="text-sm text-text-secondary">{menu.sucursal.nombre}</p>
      </div>

      {sinPlatillos ? (
        <EstadoVacio
          titulo="Sin platillos por ahora"
          mensaje="Esta sucursal todavía no tiene platillos en su menú."
        />
      ) : (
        <MenuCatalogo categorias={categorias} sucursal={menu.sucursal} />
      )}
    </main>
  );
}