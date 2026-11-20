# Despliegue

| Componente | Plataforma | URL | Rama de entrega |
| --- | --- | --- | --- |
| Frontend | Render Web Service, Node.js | Pendiente de confirmar con el despliegue | `main` |
| Backend | Render | [API](https://noodlevolt-api.onrender.com/api/v1) | `main` |
| Swagger | Render | [Ruta esperada](https://noodlevolt-api.onrender.com/api/docs), verificar con `SWAGGER_ENABLED=true` en el backend | `main` |
| Base de datos | Neon | Privada | — |

## Publicar una versión

1. Cierra QA en `develop` y prepara `release/x.y.z` según el [flujo de trabajo](07-forma-de-trabajo.md).
2. Con la aprobación registrada, fusiona la rama de release a `main`.
3. Despliega el commit de `main` y comprueba las URLs por HTTPS. [Configuración de Render](despliegue-pasos.md)
4. Etiqueta el commit publicado y crea la release en GitHub. Actualiza la URL real del frontend en el README y en esta guía.

| Variable | Dónde se configura |
| --- | --- |
| `API_URL` | Render → servicio del frontend → Environment. |
| `NODE_VERSION` | Render → servicio del frontend → Environment. |

## Validación de producción

Confirma el menú y el inicio de sesión de los cinco roles funcionales. Prueba una reserva, el ciclo de comanda y entrega, el acceso por sucursal y el reporte por fechas. Usa las cuentas de demo entregadas por Moodle y registra la evidencia en el tablero. [Historias y estado de QA](08-historias.md)

La revisión local en Chromium con una API simulada cubrió los destinos de los cinco roles, el retorno a reservas tras el login, la recuperación ante errores de la API y la navegación móvil de gerencia y mesero.
