# Despliegue del frontend en Vercel

El procedimiento completo (Neon, Render, seed y lista de verificación) está en `docs/despliegue-pasos.md` del repo del backend. Aquí solo lo que aplica al frontend.

## Proyecto en Vercel

1. **Add New → Project** e importa este repo. Elige la rama **`main`** (solo después de que la PR esté fusionada).
2. **Framework Preset:** Next.js (se detecta solo).
3. **Node.js Version:** `22.x` o `24.x`. Next 16 requiere Node 20.9 o superior; el campo `engines` de `package.json` lo documenta.
4. Variables de entorno, ámbito **Production**:

   | Variable | Valor | De dónde sale |
   | --- | --- | --- |
   | `API_URL` | `https://<servicio>.onrender.com/api/v1` | URL pública del servicio en Render, más `/api/v1` |

   `API_URL` debe terminar en `/api/v1`: el login construye `auth/login` relativo a esa base. Con `localhost:8000` o sin `/api/v1` el login falla.

5. Despliega y anota la URL de producción (`https://<proyecto>.vercel.app`).
6. Pon esa URL exacta en `CORS_ORIGINS` del servicio de Render, sin barra final.

## Sin secretos en el repo

`.env*` está ignorado en git y solo `.env.example` se versiona. El frontend no usa secretos propios: el token lo emite el backend y se guarda en una cookie `httpOnly`. No pongas ninguna credencial en variables `NEXT_PUBLIC_*`.
