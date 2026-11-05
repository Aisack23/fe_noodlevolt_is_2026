import type { Metadata } from "next";
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

  // El precio llega como texto ("8.50") y la descripción puede ser null.
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

  return (
    <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6">
      <h1 className="font-display text-h1 font-bold uppercase text-brown">Menú</h1>
      <MenuCatalogo categorias={categorias} />
    </main>
  );
}