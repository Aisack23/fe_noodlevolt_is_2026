import { getMyLoyalty, LoyaltyApiError } from "@/lib/api/loyalty";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Puente para componentes cliente (chip de la barra): el token sigue en la cookie httpOnly. */
export async function GET() {
  const token = await getSession();
  if (!token) {
    return Response.json({ message: "Sin sesión." }, { status: 401 });
  }

  try {
    return Response.json(await getMyLoyalty(token));
  } catch (error) {
    const status = error instanceof LoyaltyApiError ? error.status : 500;
    return Response.json({ message: "No se pudo consultar el saldo de puntos." }, { status });
  }
}
