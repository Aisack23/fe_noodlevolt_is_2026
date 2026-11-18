import type { Metadata } from "next";
import { getBranches } from "@/lib/api/branches";
import { obtenerMenu } from "@/lib/api/menu";
import { type Categoria } from "./menu-catalogo";
import { MenuPageClient } from "./menu-page-client";
import { getSessionUser } from "@/lib/session";
import { isClientRole } from "@/lib/auth/roles";
import { EstadoVacio } from "@/components/ui/EstadoVacio";

export const metadata: Metadata = {
  title: "Menú",
};

type MenuPageProps = {
  searchParams: Promise<{ sucursal?: string }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const [branches, params, user] = await Promise.all([
    getBranches(),
    searchParams,
    getSessionUser(),
  ]);

  // FE-01: «el menú permanece público». Lo ven invitados, clientes y personal;
  // solo el invitado y el CLIENT pueden agregar al carrito (el personal no compra:
  // /pedidos/llevar solo admite CLIENT). El invitado inicia sesión al confirmar.
  const puedeAgregar = !user || isClientRole(user.rol);

  const activeBranches = branches.filter((branch) => branch.isActive);
  const selectedBranch = activeBranches.find((branch) => branch.id === params.sucursal) ?? activeBranches[0];

  if (!selectedBranch) {
    return (
      <main className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6">
        <h1 className="font-display text-h1 font-bold uppercase text-brown">Menú</h1>
        <EstadoVacio
          titulo="Sin sucursales disponibles"
          mensaje="No hay sucursales activas disponibles."
        />
      </main>
    );
  }

  const menu = await obtenerMenu(selectedBranch.id);

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
    <MenuPageClient
      branches={activeBranches}
      selectedBranch={menu.sucursal}
      categorias={categorias}
      puedeAgregar={puedeAgregar}
    />
  );
}
