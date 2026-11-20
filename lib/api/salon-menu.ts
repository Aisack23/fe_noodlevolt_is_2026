import { obtenerMenu } from "@/lib/api/menu";
import type { SalonDish } from "@/lib/api/salon";

export type SalonMenu = {
  branchName: string;
  dishes: SalonDish[];
};


export async function getSalonMenu(branchId: string): Promise<SalonMenu> {
  const menu = await obtenerMenu(branchId);
  return {
    branchName: menu.sucursal.nombre,
    dishes: menu.categorias.flatMap((categoria) =>
      categoria.platillos.map((platillo) => ({
        id: platillo.id,
        name: platillo.nombre,
        price: platillo.precio,
        category: categoria.nombre,
        available: platillo.disponible,
      })),
    ),
  };
}