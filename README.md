# NoodleVolt — Frontend

Frontend de NoodleVolt con Next.js App Router, React, TypeScript y Tailwind CSS. Las pantallas protegidas consultan la sesión de servidor y la API configurada mediante `API_URL`.

## Desarrollo

Requisitos: Node.js compatible con la versión de Next del proyecto y dependencias instaladas con `npm install`.

```bash
npm run dev
npm run lint
npm run build
```

Configura `API_URL` en `.env.local` con la base `/api/v1` de la API. Usa `.env.example` como referencia y no guardes credenciales en el repositorio.

## FE-08 — Mis pedidos y reseñas

- Listado protegido por rol en [`/pedidos`](./app/pedidos/(mis-pedidos)/page.tsx), con filtro opcional por estado.
- Formulario para calificar un pedido entregado en [`/pedidos/[id]/resena`](./app/pedidos/[id]/resena/page.tsx).
- Contrato, manejo de errores, decisiones y límites de verificación: [docs/FE-08.md](./docs/FE-08.md).
- Componentes reutilizados y añadidos: [docs/COMPONENTS.md](./docs/COMPONENTS.md).

Pruebas de contrato FE-08 con `fetch` simulado (runner integrado de Node 24; no requiere dependencias de pruebas):

```bash
node --experimental-strip-types tests/reviews-api.test.mjs
```

## Documentación del proyecto

- [Sistema de diseño](./docs/DESIGN_SYSTEM.md)
- [Inventario de componentes](./docs/COMPONENTS.md)
- [Roadmap frontend](./docs/FRONTEND_ROADMAP.md)
