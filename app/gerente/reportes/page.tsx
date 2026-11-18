import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, TrendingUp, Utensils } from "lucide-react";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { getSession, getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Reportes · Gerencia NoodleVolt",
  description: "Accede a los reportes de ventas y platillos más vendidos.",
};

const reportes = [
  {
    href: "/gerente/reportes/ventas",
    titulo: "Ventas",
    descripcion: "Consulta las ventas pagadas por período y sucursal.",
    Icon: TrendingUp,
  },
  {
    href: "/gerente/reportes/top-dishes",
    titulo: "Platillos más vendidos",
    descripcion: "Revisa el ranking de los platillos con más ventas.",
    Icon: Utensils,
  },
] as const;

export default async function ReportesPage() {
  const [token, user] = await Promise.all([getSession(), getSessionUser()]);

  if (!token || !user) {
    redirect("/login");
  }

  if (user.rol !== "GENERAL_MANAGER") {
    return <AccesoDenegado href="/menu" />;
  }

  return (
    <main className="grid flex-1 grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-8">
      <h1 className="sr-only">Reportes</h1>
      {reportes.map(({ href, titulo, descripcion, Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex min-h-56 flex-col justify-between rounded-card border border-border bg-white p-6 shadow-sm outline-none transition hover:-translate-y-0.5 hover:border-orange hover:shadow-md focus-visible:shadow-focus"
        >
          <div className="flex size-12 items-center justify-center rounded-control bg-cream text-crimson">
            <Icon aria-hidden className="size-6" />
          </div>
          <div className="mt-6">
            <h2 className="font-display text-h3 font-bold uppercase text-brown">{titulo}</h2>
            <p className="mt-2 text-sm text-text-secondary">{descripcion}</p>
          </div>
          <span className="mt-6 flex items-center gap-2 text-sm font-semibold text-crimson">
            Ver reporte
            <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ))}
    </main>
  );
}
