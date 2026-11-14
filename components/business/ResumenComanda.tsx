import { Button } from "@/components/ui/Button";
import { formatUsd, type Mesa } from "@/lib/api/salon";

export type LineaResumen = {
  id: string;
  name: string;
  quantity: number;
  subtotalCents: number;
  note: string;
};

type ResumenComandaProps = {
  mesa: Mesa;
  lineas: LineaResumen[];
  totalCents: number;
  enviando: boolean;
  bloqueado: boolean;
  onConfirmar: () => void;
  onAtras: () => void;
};

export function ResumenComanda({
  mesa,
  lineas,
  totalCents,
  enviando,
  bloqueado,
  onConfirmar,
  onAtras,
}: ResumenComandaProps) {
  return (
    <aside className="flex flex-col gap-4 rounded-card border border-border bg-white p-4 lg:sticky lg:top-6 lg:self-start">
      <div>
        <h2 className="font-display text-h3 font-bold uppercase text-brown">Mesa {mesa.number}</h2>
        {mesa.hasOpenAccount && (
          <p className="text-sm text-text-secondary">
            Cuenta abierta: este pedido se suma a la cuenta.
          </p>
        )}
      </div>

      {lineas.length === 0 ? (
        <p className="text-sm text-text-secondary">Aún no agregaste platillos.</p>
      ) : (
        <ul className="flex flex-col gap-2 text-sm text-brown">
          {lineas.map((linea) => (
            <li key={linea.id}>
              <div className="flex justify-between gap-3">
                <span>
                  {linea.quantity} × {linea.name}
                </span>
                <span>{formatUsd(linea.subtotalCents)}</span>
              </div>
              {linea.note.trim() && (
                <p className="text-text-secondary">Nota: {linea.note.trim()}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="text-base font-semibold text-brown">Total</span>
        <span className="font-display text-h3 font-bold text-brown">{formatUsd(totalCents)}</span>
      </div>

      <div className="flex flex-col gap-2 [&>button]:w-full">
        <Button onClick={onConfirmar} disabled={bloqueado || enviando}>
          {enviando ? "Enviando…" : "Confirmar pedido"}
        </Button>
        <Button variant="secondary" onClick={onAtras} disabled={enviando}>
          Atrás
        </Button>
      </div>
    </aside>
  );
}