# Instalación local

## Requisitos

- Node.js 20.9 o superior (requisito mínimo de Next.js 16).
- npm, incluido con Node.js.
- Una API NoodleVolt accesible para las funciones que consumen datos reales.

No se requiere Docker para este repositorio: no incluye `Dockerfile` ni `docker-compose`.

## Pasos

1. Clonar el repositorio y entrar a su carpeta.
2. Instalar las dependencias bloqueadas:

   ```bash
   npm ci
   ```

3. Crear `.env.local` a partir de `.env.example`.

   En PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Establecer la base de la API:

   ```dotenv
   API_URL=http://localhost:3000/api/v1
   ```

   Puede ser el origen de la API o una URL que ya incluya `/api/v1`; la aplicación normaliza ambos casos.

5. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

6. Abrir `http://localhost:3000`. La raíz redirige a `/menu`.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `API_URL` | Sí para rutas que consumen API | Origen de la API NoodleVolt, con o sin el sufijo `/api/v1`. |

No se deben agregar tokens, contraseñas ni secretos en variables `NEXT_PUBLIC_*`: el frontend usa tokens emitidos por la API y los guarda en cookies `httpOnly`.

## Comandos de calidad

```bash
npm run lint
npm test
npm run build
npm start
```

`npm test` ejecuta las pruebas en `tests/*.test.mjs`, que cubren contratos de autenticación, sucursales, pedidos, cocina, lealtad, reseñas y reportes con `fetch` simulado. `npm start` requiere haber ejecutado antes `npm run build`.
