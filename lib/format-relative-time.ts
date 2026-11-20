// Convierte una fecha ISO en "hace 2 min", "hace 1 h", "ayer" o "hace 3 días".
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";

  const diffMs = Math.max(0, now - time);
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return `hace ${days} días`;
}