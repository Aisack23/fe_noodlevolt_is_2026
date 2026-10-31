import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { BadgeEstado } from "./BadgeEstado";
import { Button } from "./Button";

const formatoPrecio = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type TarjetaPlatilloProps = {
  nombre: string;
  descripcion: string;
  precio: number;
  disponible: boolean;
  imagenUrl?: string;
  onAgregar?: () => void;
  agregando?: boolean;
  className?: string;
};

export function TarjetaPlatillo({
  nombre,
  descripcion,
  precio,
  disponible,
  imagenUrl,
  onAgregar,
  agregando = false,
  className,
}: TarjetaPlatilloProps) {
  const atenuado = !disponible && "opacity-50";

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-card border-2 border-brown bg-cream",
        className,
      )}
    >
      <div className={cn("relative flex h-42 items-center justify-center bg-border", atenuado)}>
        {imagenUrl ? (
          <Image
            src={imagenUrl}
            alt={nombre}
            fill
            sizes="(min-width: 768px) 296px, 100vw"
            className="object-cover"
          />
        ) : (
          <ImageIcon aria-hidden className="size-10 text-text-secondary" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className={cn("flex flex-col gap-2", atenuado)}>
          <h3 className="font-display text-h3 font-bold uppercase tracking-wide text-brown">
            {nombre}
          </h3>
          <p className="text-sm text-text-secondary">{descripcion}</p>
        </div>

        <BadgeEstado estado={disponible ? "DISPONIBLE" : "AGOTADO"} className="self-start" />

        <div className="mt-auto flex items-center justify-between pt-2">
          <span
            className={cn(
              "font-display text-h3 font-bold",
              disponible ? "text-crimson" : "text-text-secondary opacity-50",
            )}
          >
            {formatoPrecio.format(precio)}
          </span>
          <Button disabled={!disponible} loading={agregando} onClick={onAgregar}>
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
