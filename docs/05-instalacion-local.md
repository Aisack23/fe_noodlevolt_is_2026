# Instalación local

Usa Node.js 24 y npm. Next.js admite Node.js desde 20.9, pero las pruebas del proyecto ejecutan TypeScript con el runner integrado de Node.

1. Levanta la API en el puerto `3000`. [Instalación y seed del backend](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/main/docs/05-instalacion-local.md)
2. Desde la raíz del frontend instala las dependencias y crea el archivo de configuración.

   ```bash
   npm ci
   cp .env.example .env.local
   npm run dev -- --port 3001
   ```

3. Abre `http://localhost:3001`. Si la API usa otro host o puerto, actualiza `API_URL` en `.env.local`.

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `API_URL` | URL de la API consumida desde Next.js. | `http://localhost:3000/api/v1` |

Ejecuta `npm test` para las pruebas de contrato, `npm run lint` para ESLint y `npm run build` para compilar. Para probar el build en local, ejecuta `npm start -- --port 3001`.
