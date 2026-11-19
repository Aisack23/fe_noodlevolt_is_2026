# NoodleVolt — Frontend

Interfaz web de NoodleVolt, una plataforma de gestión para un restaurante chino multisucursal. Permite a los clientes consultar el menú, hacer pedidos para llevar, pagar, reservar mesa y consultar sus puntos; al personal, atender comandas, consultar inventario y ventas; y al gerente, abrir o cerrar su sucursal.

Proyecto 3: Plataforma de gestión de restaurantes · Ingeniería de Software, UCA, ciclo 02/2026, Sección 02 · Equipo Elektro.

## Documentación

La documentación completa (roles, arquitectura, modelo de datos, API, despliegue, historias y problemas conocidos) está en el backend:

**[Documentación de NoodleVolt en el repositorio de backend](https://github.com/Aisack23/be_noodlevolt_is_2026/tree/develop/docs)**

Índice: [01 · Guía de uso](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/develop/docs/01-guia-de-uso.md) · [04 · API](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/develop/docs/04-api.md) · [05 · Instalación local](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/develop/docs/05-instalacion-local.md) · [06 · Despliegue](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/develop/docs/06-despliegue.md)

## Despliegue

| Componente | URL |
|---|---|
| Aplicación web (Vercel) | [pendiente] |
| API (Render) | [pendiente] |

## Requisitos

- Node.js 20.9 o superior, requisito de Next.js 16 [verificar la versión mínima en el despliegue].
- npm.
- La API de NoodleVolt en ejecución (ver el [README del backend](https://github.com/Aisack23/be_noodlevolt_is_2026#readme)).

## Instalación

```bash
git clone https://github.com/Aisack23/fe_noodlevolt_is_2026.git
cd fe_noodlevolt_is_2026
npm install
cp .env.example .env.local
```

Editar `.env.local` y definir `API_URL` con la base de la API, incluido el prefijo `/api/v1`:

```bash
API_URL=http://localhost:3000/api/v1
```

El puerto debe coincidir con el de la API (`PORT` del backend, 3000 por defecto). El archivo `.env.example` trae `http://localhost:8000` y no coincide con ese valor [verificar: ver [09 · Problemas conocidos](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/develop/docs/09-problemas-conocidos.md#97-frontend)].

No guardar credenciales en el repositorio. Las cuentas de prueba se entregan en Moodle.

## Ejecución

```bash
npm run dev       # servidor de desarrollo de Next.js [verificar el puerto asignado]
npm run lint
npm run build
npm run start     # servidor de producción tras npm run build
```

## Pruebas

Las pruebas de contrato de la API usan el runner integrado de Node y `fetch` simulado. No requieren dependencias adicionales:

```bash
node --experimental-strip-types tests/reviews-api.test.mjs
```

Cada archivo de `tests/` se ejecuta del mismo modo. No hay un script `npm test` en `package.json` [verificar].

## Estructura

```text
app/          rutas (App Router): menú, pedidos, reservas, cocina, mesero, gerente, perfil
components/   componentes reutilizables
lib/          clientes de la API, sesión y utilidades
proxy.ts      protección de rutas por sesión y rol
tests/        pruebas de contrato de la API
docs/         documentación de las pantallas por historia de usuario
```

## Sesión

La sesión se guarda en una cookie `httpOnly` llamada `session`, creada por el servidor de Next.js. El JavaScript del navegador no puede leer el token. Las rutas protegidas consultan la sesión en el servidor; el control por rol en la interfaz es un apoyo visual y no sustituye los permisos del backend.
