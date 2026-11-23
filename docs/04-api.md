# API consumida por el frontend

`API_URL` se configura en el servidor de Next.js. Para producción en Render, el valor es `https://noodlevolt-api.onrender.com/api/v1`. Los clientes HTTP usan el token de la sesión para operaciones autenticadas.

| Módulo | Rutas de NestJS que usa la interfaz, relativas a `/api/v1` |
| --- | --- |
| Sesión | `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, `POST /auth/logout`. |
| Menú | `GET /branches`, `GET /sucursales/:id/menu`. |
| Pedidos | `POST /orders`, `POST /orders/salon`, `GET /orders/me`. |
| Cocina | `GET /kitchen/orders`, `GET /kitchen/orders/ready`, `GET /kitchen/orders/supervision`, `PATCH /kitchen/orders/:id/status`, `PATCH /kitchen/orders/:id/deliver`. |
| Reservas | `GET /reservations/availability`, `POST /reservations`, `GET /branches/:id/reservations`, `PATCH /reservations/:id/cancel`. |
| Inventario y compras | `GET /inventory`, `GET /purchases/low-stock`, `GET /purchases`, `POST /purchases`. |
| Pagos, lealtad y reseñas | `POST /payments/simulate`, `GET /loyalty/me`, `POST /reviews`, `GET /branches/:id/rating`. |
| Notificaciones | `GET /notifications/me`, `PATCH /notifications/:id/read`. |
| Reseñas en gerencia | `GET /branches/:id/reviews`, paginado y restringido por rol y sucursal. |
| Reportes y sucursales | `GET /reports/sales`, `GET /reports/top-dishes`, `GET /branches/:id/config`, `PATCH /branches/:id/config`. |

El frontend expone `GET /api/loyalty/me`, `GET /api/notifications` y `PATCH /api/notifications/:id/read` en su propio dominio. Esas rutas usan las cookies de la sesión para consultar NestJS.

`GET /orders/me` incluye `paymentStatus` para distinguir el pago pendiente, rechazado o aprobado del estado operativo del pedido.

[Contratos completos y permisos](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/main/docs/04-api.md)
