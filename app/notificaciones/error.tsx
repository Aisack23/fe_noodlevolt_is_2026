'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ reset }: ErrorProps) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mx-auto w-full max-w-[400px] overflow-hidden rounded-card border border-border bg-white">
        <h1 className="px-5 pb-3 pt-5 font-display text-h3 uppercase text-brown">
          Notificaciones
        </h1>
        <div role="alert" className="space-y-3 bg-danger/10 p-5">
          <p className="text-sm text-danger">
            No se pudo completar la operación. Intenta de nuevo
          </p>
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-control border-2 border-orange px-4 py-2.5 font-semibold text-brown transition-colors hover:bg-cream"
          >
            Reintentar
          </button>
        </div>
      </div>
    </main>
  );
}