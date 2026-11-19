# Guía de uso

NoodleVolt es el frontend de una plataforma de gestión de restaurante. La página inicial redirige a `/menu`.

## Roles

| Rol | Acciones disponibles en esta versión |
|---|---|
| Visitante | Consultar el menú y elegir sucursal. |
| CLIENT | Registrarse, iniciar sesión, crear pedidos para llevar, simular su pago, reservar mesa, consultar pedidos, calificar pedidos entregados, consultar puntos y notificaciones. |
| WAITER | Crear comandas de salón y entregar pedidos listos. |
| COOK | Consultar el tablero de cocina y avanzar pedidos de pendiente a preparación o listo. |
| BRANCH_ADMIN | Consultar inventario, compras, reservaciones, estado de sucursal, cocina y reportes de su sucursal. |
| GENERAL_MANAGER | Consultar y administrar sucursales, reservaciones y reportes, incluidos los filtros por sucursal. |
| CASHIER / INVENTORY_MANAGER | El inicio de sesión está reconocido, pero actualmente su destino es el menú; no hay flujo específico implementado. |

La interfaz oculta o deniega pantallas según el rol, pero la autorización definitiva corresponde a la API.

## Flujos principales

### Cliente: registrarse e iniciar sesión

1. Abrir `/registro`, completar nombre, apellido, correo y contraseña.
2. La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
3. Tras el registro, iniciar sesión en `/login`.
4. El destino posterior depende del rol recibido de la API.

### Cliente: consultar menú y realizar pedido para llevar

1. Abrir `/menu` y elegir la sucursal en el selector.
2. Filtrar por categoría si se necesita y agregar platillos disponibles al carrito.
3. Iniciar sesión como `CLIENT` y abrir `/pedidos/llevar`.
4. Ajustar cantidades, elegir pago en línea o en caja y confirmar.
5. Si se eligió pago en línea, continuar en `/pedidos/[id]/pago` y usar una tarjeta de prueba: terminada en `4242` para aprobación o `0002` para rechazo.

El carrito se conserva en el almacenamiento local del navegador. El pedido para llevar se crea mediante la API; la confirmación muestra la hora de retiro enviada por ella o «Por confirmar» si no está disponible.

### Cliente: reservar mesa

1. Iniciar sesión como `CLIENT` y abrir `/reservas` (la ruta `/reservar` redirige allí).
2. Elegir sucursal, fecha, hora, número de personas y datos de contacto.
3. Seleccionar una mesa disponible y confirmar la reservación.

### Cliente: pedidos, reseñas, puntos y notificaciones

1. Abrir `/pedidos` para consultar pedidos propios y filtrar por estado.
2. Para un pedido entregado sin reseña, seleccionar **Calificar** y enviar de una a cinco estrellas; el comentario es opcional.
3. Abrir `/perfil/puntos` para ver el saldo de lealtad.
4. Abrir la campana o `/notificaciones` para consultar avisos. Al cerrar el panel de la campana, los avisos no leídos de su primera página se marcan como leídos.

### Personal operativo

- `WAITER`: en `/mesero/comanda` selecciona mesa y platillos, revisa el resumen y envía la comanda; en `/mesero/listos` entrega pedidos preparados.
- `COOK`: en `/cocina/tablero` toma pedidos pendientes y cambia su estado a **En preparación** o **Listo**. El tablero se actualiza periódicamente.
- `BRANCH_ADMIN` y `GENERAL_MANAGER`: acceden al área `/gerente` para las operaciones administrativas habilitadas por su rol.

## Sesión

La sesión se guarda en cookies `httpOnly` (`session` y `session_refresh`), por lo que el token no se expone al código que se ejecuta en el navegador. Cerrar sesión elimina las cookies y notifica a la API cuando existe un token de actualización.
