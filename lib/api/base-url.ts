/** API_URL admite el origen solo o una URL que ya termina en /api/v1. */
export function getApiBaseUrl(): string {
  const value = process.env.API_URL;
  if (!value) throw new Error("Falta la variable de entorno API_URL.");
  const base = new URL(value);
  const path = base.pathname.replace(/\/+$/, "");
  base.pathname = path.endsWith("/api/v1") ? `${path}/` : `${path}/api/v1/`;
  base.search = "";
  base.hash = "";
  return base.toString();
}
