export type PlatilloApi = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  disponible: boolean;
};

export type CategoriaApi = {
  id: string;
  nombre: string;
  platillos: PlatilloApi[];
};

export type MenuApi = {
  sucursal: { id: string; nombre: string };
  categorias: CategoriaApi[];
};

export async function obtenerMenu(sucursalId: string): Promise<MenuApi> {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("Falta la variable de entorno API_URL.");
  }

  const res = await fetch(
    new URL(`sucursales/${sucursalId}/menu`, apiUrl.replace(/\/?$/, "/")),
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`El menú respondió ${res.status}`);
  }

  return res.json();
}