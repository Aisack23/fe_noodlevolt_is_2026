# Historias y módulos implementados

Este inventario se basa en las pantallas, documentos FE y código presentes en el repositorio. No se incluyen responsable, tarjeta ni pull request porque esos datos no están definidos de forma confiable en el árbol de trabajo.

## Cliente

| ID | Historia / módulo | Estado |
|---|---|---|
| FE-01 | Menú público por sucursal | Implementado; existen diferencias visuales documentadas. |
| FE-04 | Pedido para llevar y creación de pedido | Implementado; depende de que el backend respete modalidad y hora de retiro. |
| FE-06 | Pago simulado | Implementado; no es integración con pasarela real. |
| FE-07 | Saldo de puntos de lealtad | Implementado; no incluye historial ni canjes. |
| FE-08 | Mis pedidos y reseñas | Implementado; pendiente validación visual formal contra Figma. |
| FE-09 | Campana y buzón de notificaciones | Implementado; limitado a la primera página de avisos. |
| FE-04 | Reserva de mesa | Implementado en `/reservas`; la especificación detallada está en `docs/FE/FE-04.md`. |

## Operación del restaurante

| ID | Historia / módulo | Estado |
|---|---|---|
| FE-03 | Comanda, tablero y pedidos listos del mesero | Implementado; hay rutas de navegación de mesero aún no creadas. |
| FE-06 | Tablero de cocina | Implementado con actualización periódica. |

## Administración

| ID | Historia / módulo | Estado |
|---|---|---|
| FE-05 | Inventario y compras | Implementado en el área de gerente. |
| FE-10 | Reportes de ventas y platillos más vendidos | Implementado. |
| — | Gestión de sucursales, reservaciones y supervisión de cocina | Implementado según permisos de gerente. |

El identificador FE se conserva cuando existe documentación con ese nombre. Algunos números aparecen en más de un documento histórico para alcances distintos; conviene normalizar esa nomenclatura antes de la entrega final.
