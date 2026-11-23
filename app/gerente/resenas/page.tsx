import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RatingStars } from "@/components/business/RatingStars";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { BotonReintentar } from "@/components/ui/BotonReintentar";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import { getBranches, getMyBranch } from "@/lib/api/branches";
import { getBranchReviews, ReviewApiError } from "@/lib/api/reviews";
import { isBranchAdministrationRole } from "@/lib/auth/roles";
import { getSession, getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Reseñas por sucursal" };

const dateFormatter = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/El_Salvador",
});
const pageLinkClass = "inline-flex min-h-11 items-center rounded-control border border-border px-4 text-sm font-semibold text-brown outline-none hover:bg-cream focus-visible:shadow-focus";

function pageLink(branchId: string, page: number): string {
  return `/gerente/resenas?${new URLSearchParams({ sucursal: branchId, page: String(page) })}`;
}

export default async function ResenasPage({
  searchParams,
}: {
  searchParams: Promise<{ sucursal?: string | string[]; page?: string | string[] }>;
}) {
  const [token, user, params] = await Promise.all([getSession(), getSessionUser(), searchParams]);
  if (!token || !user) redirect("/login");
  if (!isBranchAdministrationRole(user.rol)) return <AccesoDenegado href="/menu" />;

  const isGeneral = user.rol === "GENERAL_MANAGER";
  const branches = isGeneral
    ? await getBranches(token)
    : [await getMyBranch(token)].filter((branch) => branch !== null);
  const selectedBranch = branches.find((branch) => branch.id === params.sucursal) ?? branches[0];
  const requestedPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 && requestedPage <= 1_000_000 ? requestedPage : 1;

  let reviews: Awaited<ReturnType<typeof getBranchReviews>> | null = null;
  if (selectedBranch) {
    try {
      reviews = await getBranchReviews(token, selectedBranch.id, page);
    } catch (error) {
      if (error instanceof ReviewApiError && error.status === 401) redirect("/login");
      if (error instanceof ReviewApiError && error.status === 403) return <AccesoDenegado href="/menu" />;
    }
  }
  const lastPage = reviews ? Math.max(1, Math.ceil(reviews.total / reviews.limit)) : 1;
  if (selectedBranch && reviews && page > lastPage) redirect(pageLink(selectedBranch.id, lastPage));

  return (
    <main className="flex flex-col gap-6 px-4 py-6 md:px-8">
      <header className="space-y-1">
        <h1 className="font-display text-h2 font-bold uppercase text-brown">Reseñas por sucursal</h1>
        {selectedBranch && <p className="text-text-secondary">{selectedBranch.name}</p>}
      </header>
      {isGeneral && selectedBranch && (
        <form action="/gerente/resenas" className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-2 text-sm font-semibold text-brown">
            <label htmlFor="resenas-sucursal">Sucursal</label>
            <select
              id="resenas-sucursal"
              name="sucursal"
              defaultValue={selectedBranch.id}
              key={selectedBranch.id}
              className="min-h-11 rounded-control border border-border bg-white px-3 text-base outline-none focus-visible:shadow-focus"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit">Consultar reseñas</Button>
        </form>
      )}

      {!selectedBranch ? (
        <EstadoVacio titulo="Sin sucursales disponibles" mensaje="No hay sucursales habilitadas para tu cuenta." />
      ) : !reviews ? (
        <div className="flex flex-col items-start gap-3">
          <Alerta>No se pudieron cargar las reseñas de la sucursal.</Alerta>
          <BotonReintentar />
        </div>
      ) : reviews.items.length === 0 ? (
        <EstadoVacio titulo="Sin reseñas" mensaje="Las calificaciones de esta sucursal aparecerán aquí." />
      ) : (
        <>
          <ul aria-label="Reseñas de la sucursal" className="grid gap-4 lg:grid-cols-2">
            {reviews.items.map((review) => (
              <li key={review.id} className="min-w-0 space-y-3 rounded-card border border-border bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <RatingStars value={review.rating} readOnly />
                  <time dateTime={review.createdAt} className="text-sm text-text-secondary">
                    {dateFormatter.format(new Date(review.createdAt))}
                  </time>
                </div>
                <p className="whitespace-pre-wrap break-words text-brown">{review.comment || "Sin comentario"}</p>
              </li>
            ))}
          </ul>
          <nav aria-label="Páginas de reseñas" className="flex flex-wrap items-center gap-4 text-sm text-brown">
            {page > 1 && <Link className={pageLinkClass} href={pageLink(selectedBranch.id, page - 1)}>Anterior</Link>}
            <span>Página {page} de {lastPage} · {reviews.total} reseñas</span>
            {page < lastPage && <Link className={pageLinkClass} href={pageLink(selectedBranch.id, page + 1)}>Siguiente</Link>}
          </nav>
        </>
      )}
    </main>
  );
}
