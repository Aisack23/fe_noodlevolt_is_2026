import { Skeleton, SkeletonTarjeta } from "@/components/ui/Skeleton";

export default function MenuLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      className="mx-auto flex w-full max-w-[1232px] flex-col gap-6 px-4 py-6"
    >
      <span className="sr-only">Cargando el menú…</span>

      <h1 className="font-display text-h1 font-bold uppercase text-brown">Menú</h1>

      <div className="flex gap-2">
        <Skeleton className="h-11 w-24 rounded-full" />
        <Skeleton className="h-11 w-28 rounded-full" />
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>

      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        <SkeletonTarjeta />
        <SkeletonTarjeta />
        <SkeletonTarjeta />
        <SkeletonTarjeta />
      </div>
    </main>
  );
}