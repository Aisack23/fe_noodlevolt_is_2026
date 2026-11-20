import { markNotificationRead, NotificationApiError } from "@/lib/api/notifications";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getSession();
  if (!token) {
    return Response.json({ message: "Sin sesión." }, { status: 401 });
  }

  const { id } = await params;

  try {
    return Response.json(await markNotificationRead(token, id));
  } catch (error) {
    const status = error instanceof NotificationApiError ? error.status : 500;
    return Response.json({ message: "No se pudo marcar la notificación." }, { status });
  }
}