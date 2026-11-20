import { getMyNotifications, NotificationApiError } from "@/lib/api/notifications";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = await getSession();
  if (!token) {
    return Response.json({ message: "Sin sesión." }, { status: 401 });
  }

  try {
    return Response.json(await getMyNotifications(token));
  } catch (error) {
    const status = error instanceof NotificationApiError ? error.status : 500;
    return Response.json({ message: "No se pudieron cargar las notificaciones." }, { status });
  }
}