# API consumida por el frontend

## Alcance y base

La API no vive en este repositorio. Todas las rutas externas se resuelven desde `API_URL`; la aplicación normaliza el valor para usar el prefijo `/api/v1`. No hay una URL pública ni documentación Swagger configurada aquí.

## Autenticación

| Operación | Ruta | Uso |
|---|---|---|
| Inicio de sesión | `POST /auth/login` | Envía correo y contraseña; recibe tokens. |
| Usuario actual | `GET /auth/me` | Verifica token y obtiene identidad/rol. |
| Renovar sesión | `POST /auth/refresh` | Envía el token de actualización cuando la sesión está por vencer. |
| Cerrar sesión | `POST /auth/logout` | Invalida la actualización cuando existe. |
| Registro | `POST /users` | Crea una cuenta de cliente. |

Las operaciones autenticadas envían `Authorization: Bearer <accessToken>`. El token permanece en cookies `httpOnly`; las solicitudes se hacen en servidor o a través de un route handler interno.

## Endpoints por módulo

| Módulo | Método y ruta | Consumidor del frontend |
|---|---|---|
| Sucursales | `GET /branches` | Selector público de sucursal. |
| Sucursales | `GET /branches/me/branch`, `PATCH /branches/:id/config` | Administración de sucursal. |
| Menú | `GET /sucursales/:sucursalId/menu` | Menú público y comanda. |
| Pedidos | `POST /orders`, `GET /orders/me` | Pedido para llevar e historial. |
| Pedidos salón | `POST /orders/salon` | Nueva comanda del mesero. |
| Pago | `POST /payments/simulate` | Pago de prueba del pedido. |
| Cocina | `GET /kitchen/orders`, `GET /kitchen/orders/supervision`, `GET /kitchen/orders/ready` | Tablero, supervisión y entrega. |
| Cocina | `PATCH /kitchen/orders/:id/status`, `PATCH /kitchen/orders/:id/deliver` | Cambio de estado y entrega. |
| Reservaciones | `POST /reservations`, `GET /reservations/availability` | Reserva de cliente. |
| Reservaciones | `GET /reservations/branches/:branchId/reservations`, `PATCH /reservations/:id/cancel` | Listado y cancelación administrativa. |
| Mesas | `GET /branches/:branchId/tables` | Disponibilidad, reserva y comandas. |
| Inventario y compras | `GET /inventory`, `GET /purchases/low-stock`, `GET /purchases`, `POST /purchases` | Gestión administrativa. |
| Reseñas | `POST /reviews`, `GET /branches/:id/rating` | Calificación y promedio público. |
| Lealtad | `GET /loyalty/me` | Saldo del cliente. |
| Notificaciones | `GET /notifications/me?page=1&limit=20`, `PATCH /notifications/:id/read` | Campana y buzón. |
| Reportes | `GET /reports/sales`, `GET /reports/top-dishes` | Ventas y platillos más vendidos. |

Los filtros de reportes son `from`, `to`, `branchId` opcional y, para platillos, `limit` entre 1 y 100.

## Manejo de errores

Los clientes de API conservan el código HTTP para que la interfaz distinga sesión no válida (`401`), acceso denegado (`403`), validación, conflicto y errores de servidor. Una respuesta `401` normalmente elimina la sesión y redirige a `/login`; las demás se presentan en el flujo correspondiente.

## Límites conocidos de la integración

- La creación de pedido puede recibir modalidad `ONLINE` y hora de retiro nula desde el backend local; la interfaz muestra «Por confirmar» para esa hora.
- El pago es una simulación contractual: no integra una pasarela real.
- El frontend consulta solo la primera página de 20 notificaciones y marca esas notificaciones como leídas al cerrar el panel.
