/**
 * Indica si un inicio de reservación es una fecha ISO válida y posterior a ahora.
 * Mantiene la regla de negocio del formulario independiente de la interfaz.
 */
export function isFutureReservationStart(
  startsAt: string,
  now: number = Date.now(),
): boolean {
  const startsAtTime = new Date(startsAt).getTime();
  return Number.isFinite(startsAtTime) && startsAtTime > now;
}
