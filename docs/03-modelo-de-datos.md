# Modelo de datos

La base de datos PostgreSQL está gestionada por el backend mediante Prisma. El frontend consume sus DTO a través de la API.

| Datos en pantalla | Relación utilizada |
| --- | --- |
| Menú e inventario | Sucursal, categoría, platillo e insumo. |
| Pedido, pago y reseña | Pedido con sus líneas, pago simulado y reseña cuando está entregado. |
| Reserva | Sucursal, mesa, horario y contacto. |
| Sesión y notificaciones | Usuario, rol, sucursal asignada y avisos asociados. |

El diagrama entidad-relación y la definición de tablas se mantienen junto al esquema del backend. [Modelo canónico](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/main/docs/03-modelo-de-datos.md)
