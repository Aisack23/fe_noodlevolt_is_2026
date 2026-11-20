# Desplegar el frontend en Render

El frontend ejecuta Next.js en un **Web Service** con runtime **Node**. El backend NestJS vive en un servicio separado. [Guía de Next.js en Render](https://render.com/docs/deploy-nextjs-app)

1. En Render, elige **New → Web Service** y conecta `Aisack23/fe_noodlevolt_is_2026`.
2. Selecciona `develop` para pruebas o `main` para la release aprobada. Deja **Root Directory** vacío.
3. Selecciona **Node** y, para la demo, **Free**.
4. Usa `npm ci --include=dev && npm run build` como **Build Command** y `npm start -- --hostname 0.0.0.0` como **Start Command**.
5. En **Environment**, configura `NODE_VERSION=24.22.1` y `API_URL=https://noodlevolt-api.onrender.com/api/v1`.
6. Despliega. Cuando el servicio esté **Live**, registra su dominio exacto en el README y la página de despliegue.

Las llamadas de sesión a NestJS salen desde el servidor de Next.js. Configura `CORS_ORIGINS` en el backend si el navegador realiza llamadas directas a la API. La conexión de base de datos y los secretos JWT se configuran en el servicio del backend.

[Comprobaciones de producción](06-despliegue.md#validación-de-producción) · [Límites del plan gratuito](https://render.com/docs/free)
