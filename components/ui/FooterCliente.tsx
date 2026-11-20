import Image from "next/image";
import Link from "next/link";

const explora = [
  { href: "/menu", etiqueta: "Menú" },
  { href: "/reservas", etiqueta: "Reservar mesa" },
  { href: "/perfil/puntos", etiqueta: "Mis puntos" },
];

// Provisional: cuando exista un endpoint de sucursales, esta lista vendrá de la API.
const sucursales = ["San Salvador – Centro", "Santa Tecla", "Antiguo Cuscatlán"];

export function FooterCliente() {
  return (
    <footer className="bg-cream">
      <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-8 px-4 py-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3">
            <div className="relative h-16 w-40 overflow-hidden rounded-control">
              <Image
                src="/brand/Logo/Horizontal.jpeg"
                alt="NoodleVolt"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <p className="text-sm text-text-secondary">
              Comida asiática rápida y con energía.
            </p>
          </div>

          <div className="flex gap-12">
            <nav aria-label="Explora" className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-brown">Explora</h2>
              {explora.map((enlace) => (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  className="text-sm text-text-secondary hover:text-brown"
                >
                  {enlace.etiqueta}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-brown">Sucursales</h2>
              {sucursales.map((nombre) => (
                <p key={nombre} className="text-sm text-text-secondary">
                  {nombre}
                </p>
              ))}
            </div>
          </div>
        </div>

        <p className="border-t border-border pt-6 text-sm text-text-secondary">
          © 2026 NoodleVolt — Equipo Elektro
        </p>
      </div>
    </footer>
  );
}