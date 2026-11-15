"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  CreditCard,
  Receipt,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alerta } from "@/components/ui/Alerta";
import type { PaymentResult } from "@/lib/api/payments";
import {
  submitPaymentSimulation,
  type SimulatePaymentActionResult,
} from "./actions";


type CardToken = "test_4242" | "test_0002";

type CardOption = {
  token: CardToken;
  label: string;
  description: string;
  last4: string;
};

const CARD_OPTIONS: CardOption[] = [
  {
    token: "test_4242",
    label: "Tarjeta de prueba •••• 4242",
    description: "Visa terminada en 4242",
    last4: "4242",
  },
  {
    token: "test_0002",
    label: "Tarjeta de prueba •••• 0002",
    description: "Visa terminada en 0002",
    last4: "0002",
  },
];

const formatoPrecio = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}


function ResultadoAprobado({
  payment,
  orderId,
}: {
  payment: PaymentResult;
  orderId: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/12">
          <CheckCircle aria-hidden className="size-8 text-success" />
        </div>
        <h2 className="font-display text-h2 font-bold uppercase text-brown">
          ¡Pago aprobado!
        </h2>
        <p className="text-base text-text-secondary">
          Tu pago ha sido procesado exitosamente.
        </p>
      </div>

      <div className="w-full rounded-card border-2 border-success/40 bg-success/6 p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-text-secondary">Monto pagado</span>
            <span className="text-lg font-bold text-brown">
              {formatoPrecio.format(Number(payment.amount))}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-text-secondary">Tarjeta</span>
            <span className="font-semibold text-brown flex items-center gap-1.5">
              <CreditCard aria-hidden className="size-4 text-crimson" />
              •••• {payment.last4}
            </span>
          </div>
        </div>

        {payment.receipt && (
          <div className="border-t border-success/20 pt-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-brown">
              <Receipt aria-hidden className="size-4 text-success" />
              Comprobante de pago
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-text-secondary">Número</dt>
                <dd className="font-semibold text-brown">
                  {payment.receipt.number}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-text-secondary">Importe</dt>
                <dd className="font-semibold text-brown">
                  {formatoPrecio.format(Number(payment.receipt.amount))}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-text-secondary">Fecha de emisión</dt>
                <dd className="font-semibold text-brown">
                  {formatDate(payment.receipt.issuedAt)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href={`/pedidos`}
          className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-crimson px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-crimson-hover outline-none focus-visible:shadow-focus"
        >
          Ver mis pedidos
          <ArrowRight aria-hidden className="size-5" />
        </Link>
        <Link
          href="/menu"
          className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-control border-2 border-orange px-6 py-3 text-base font-semibold text-brown transition-colors hover:border-orange-hover hover:bg-orange/16 outline-none focus-visible:shadow-focus"
        >
          Volver al menú
        </Link>
      </div>
    </div>
  );
}

function ResultadoRechazado({
  payment,
  onReintentar,
}: {
  payment: PaymentResult;
  onReintentar: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex size-16 items-center justify-center rounded-full bg-danger/12">
          <XCircle aria-hidden className="size-8 text-danger" />
        </div>
        <h2 className="font-display text-h2 font-bold uppercase text-brown">
          Pago rechazado
        </h2>
        {payment.reason && (
          <p className="text-base text-text-secondary">{payment.reason}</p>
        )}
      </div>

      <Alerta tono="danger" className="w-full text-sm">
        No se pudo completar el cobro con la tarjeta •••• {payment.last4}.
        Puedes intentar con otra tarjeta de prueba.
      </Alerta>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button
          type="button"
          variant="primary"
          onClick={onReintentar}
          className="flex-1"
        >
          <RefreshCw aria-hidden className="size-5" />
          Reintentar pago
        </Button>
        <Link
          href="/pedidos"
          className="flex-1 inline-flex min-h-11 items-center justify-center gap-2 rounded-control border-2 border-orange px-6 py-3 text-base font-semibold text-brown transition-colors hover:border-orange-hover hover:bg-orange/16 outline-none focus-visible:shadow-focus"
        >
          Ver mis pedidos
        </Link>
      </div>
    </div>
  );
}


type PagoSimuladoClientProps = {
  orderId: string;
};

export function PagoSimuladoClient({ orderId }: PagoSimuladoClientProps) {
  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState<CardToken>("test_4242");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const handleReintentar = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response: SimulatePaymentActionResult =
        await submitPaymentSimulation(orderId, selectedToken);

      if (!response.ok) {
        if (response.kind === "unauthenticated") {
          router.push(
            `/login?returnTo=${encodeURIComponent(`/pedidos/${orderId}/pago`)}`,
          );
          return;
        }
        setError(response.message);
        return;
      }

      setResult(response.payment);
    } catch {
      setError("Ocurrió un error inesperado al procesar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, selectedToken, isSubmitting, router]);

  // ── Resultado ──
  if (result) {
    if (result.status === "APROBADO") {
      return (
        <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 py-8 sm:py-12">
          <ResultadoAprobado payment={result} orderId={orderId} />
        </div>
      );
    }

    return (
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 py-8 sm:py-12">
        <ResultadoRechazado payment={result} onReintentar={handleReintentar} />
      </div>
    );
  }

  // ── Formulario de selección de tarjeta ──
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-col items-center text-center gap-2">
        <div className="flex size-14 items-center justify-center rounded-full bg-cream">
          <CreditCard aria-hidden className="size-7 text-crimson" />
        </div>
        <h1 className="font-display text-h1 font-bold uppercase tracking-wide text-brown">
          Pagar pedido
        </h1>
        <p className="text-base text-text-secondary">
          Selecciona una tarjeta de prueba para simular el pago.
        </p>
      </header>

      <div className="rounded-card border-2 border-brown bg-cream p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-brown">
            Tarjeta de pago
          </span>
          <div
            className="flex flex-col gap-2"
            role="radiogroup"
            aria-label="Seleccionar tarjeta de prueba"
          >
            {CARD_OPTIONS.map((card) => (
              <button
                key={card.token}
                type="button"
                role="radio"
                aria-checked={selectedToken === card.token}
                disabled={isSubmitting}
                onClick={() => setSelectedToken(card.token)}
                className={[
                  "flex w-full items-start gap-4 rounded-control border-2 p-4 text-left transition-all outline-none",
                  "focus-visible:shadow-focus",
                  selectedToken === card.token
                    ? "border-crimson bg-cream/40"
                    : "border-border bg-white hover:border-orange",
                  isSubmitting && "cursor-not-allowed opacity-60",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className={[
                    "flex size-10 shrink-0 items-center justify-center rounded-control",
                    selectedToken === card.token
                      ? "bg-crimson text-white"
                      : "bg-cream text-brown",
                  ].join(" ")}
                >
                  <CreditCard aria-hidden className="size-5" />
                </div>

                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-base font-semibold text-brown">
                    {card.label}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {card.description}
                  </span>
                </div>

                <div
                  className={[
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors mt-0.5",
                    selectedToken === card.token
                      ? "border-crimson bg-white"
                      : "border-border bg-white",
                  ].join(" ")}
                >
                  {selectedToken === card.token && (
                    <span className="size-2.5 rounded-full bg-crimson" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-control bg-white p-3 border border-border">
          <ShieldCheck
            aria-hidden
            className="size-5 text-success shrink-0 mt-0.5"
          />
          <div className="text-xs text-text-secondary">
            <span className="font-semibold text-brown block mb-0.5">
              Pago simulado
            </span>
            Este es un entorno de prueba. No se realizará ningún cargo real.
          </div>
        </div>

        {error && (
          <Alerta tono="danger" className="text-sm">
            {error}
          </Alerta>
        )}

        <Button
          type="button"
          variant="primary"
          loading={isSubmitting}
          loadingText="Procesando pago…"
          onClick={handleSubmit}
          className="w-full text-base py-3"
        >
          Confirmar pago
        </Button>
      </div>
    </div>
  );
}
