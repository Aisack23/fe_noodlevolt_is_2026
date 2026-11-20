# Arquitectura del frontend

Next.js 16 y React 19 ejecutan la interfaz con App Router. Los Server Components consultan datos de la API y las acciones de servidor procesan formularios. Los Client Components manejan el carrito, la navegación y las interacciones.

| Carpeta o archivo | Responsabilidad |
| --- | --- |
| `app/` | Rutas públicas y privadas, acciones y handlers de interfaz. |
| `components/` | Componentes UI y de negocio con React y Tailwind CSS 4. |
| `lib/api/` | Clientes HTTP y adaptación de los contratos del backend. |
| `lib/auth/`, `lib/session.ts` | Verificación de sesión, renovación y cookies `httpOnly`. |
| `proxy.ts` | Redirección y comprobación de sesión para rutas protegidas. |

Next.js comprueba la sesión contra NestJS. Las acciones y las páginas aplican restricciones según el rol, y el backend conserva la autorización de las operaciones y el acceso por sucursal. Los handlers del frontend permiten que el navegador consulte lealtad y notificaciones con la sesión de la interfaz.

[Arquitectura del sistema](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/main/docs/02-arquitectura.md) · [Sistema de diseño](DESIGN_SYSTEM.md)
