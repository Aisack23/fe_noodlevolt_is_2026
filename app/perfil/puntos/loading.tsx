import { Skeleton } from "@/components/ui/Skeleton";

export default function MisPuntosLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      className="mx-auto flex w-full max-w-[752px] flex-col gap-4 px-4 py-6 md:py-10"
    >
      <span className="sr-only">Consultando tu saldo de puntos…</span>
      <Skeleton className="h-11 w-48" />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-14 w-full" />
      ))}
    </main>
  );
}
