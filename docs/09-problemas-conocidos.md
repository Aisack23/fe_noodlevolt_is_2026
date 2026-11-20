# Problemas conocidos

| Problema o pendiente | Cómo comprobarlo | Impacto | Historia |
| --- | --- | --- | --- |
| Falta evidencia de los flujos autenticados en el frontend de producción. | Ejecutar la lista de [validación de producción](06-despliegue.md#validación-de-producción) con las cuentas de demo. | Alto para el cierre de la entrega. | HU-04, HU-07 y HU-10 señaladas en la matriz compartida. |
| Render Free puede suspender los servicios por inactividad. | Abrir el frontend y la API después de al menos 15 minutos sin tráfico. | Primer acceso o login más lento. | Transversal. |
| Error temporal al recuperar la sesión cuando la API está indisponible. | Abrir una ruta protegida con una sesión activa durante una caída de la API. Reintentar cuando se recupere. | Se interrumpe el acceso mientras la API no pueda verificar el token. | Transversal. |

[Problemas conocidos del sistema](https://github.com/Aisack23/be_noodlevolt_is_2026/blob/main/docs/09-problemas-conocidos.md)
